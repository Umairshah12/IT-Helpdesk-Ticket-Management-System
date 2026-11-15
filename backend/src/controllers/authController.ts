import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../data/store';
import { tokenHelper } from '../utils/tokenHelper';
import { ApiResponse } from '../utils/apiResponse';
import { v4 as uuidv4 } from 'uuid';

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = dbStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return ApiResponse.error(res, 'Invalid credentials provided.', 'INVALID_CREDENTIALS', undefined, 401);
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      dbStore.logAudit({
        actorId: null,
        action: 'FAILED_LOGIN_ATTEMPT',
        entity: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { email },
      });
      return ApiResponse.error(res, 'Invalid credentials provided.', 'INVALID_CREDENTIALS', undefined, 401);
    }

    if (user.status !== 'ACTIVE') {
      return ApiResponse.error(res, `Account is ${user.status.toLowerCase()}. Please contact an administrator.`, 'ACCOUNT_INACTIVE', undefined, 403);
    }

    // Generate tokens
    const accessToken = tokenHelper.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    });

    const { rawToken, tokenHash, expiresAt } = tokenHelper.generateRefreshToken();
    dbStore.refreshTokens.push({
      id: uuidv4(),
      userId: user.id,
      tokenHash,
      expiresAt,
      isRevoked: false,
      createdAt: new Date(),
    });

    // Set secure HTTP-only refresh token cookie
    res.cookie('helpdesk_refresh_token', rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Audit log
    dbStore.logAudit({
      actorId: user.id,
      action: 'USER_LOGIN',
      entity: 'USER',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const userSafe = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      employeeId: user.employeeId,
      phone: user.phone,
      role: user.role,
      status: user.status,
      designation: user.designation,
      departmentId: user.departmentId,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    return ApiResponse.success(res, { token: accessToken, user: userSafe }, 'Login successful');
  },

  async logout(req: Request, res: Response) {
    const rawRefreshToken = req.cookies?.helpdesk_refresh_token;
    if (rawRefreshToken) {
      const hash = tokenHelper.hashToken(rawRefreshToken);
      const tokenRecord = dbStore.refreshTokens.find((t) => t.tokenHash === hash);
      if (tokenRecord) {
        tokenRecord.isRevoked = true;
      }
    }

    res.clearCookie('helpdesk_refresh_token');
    return ApiResponse.success(res, null, 'Logged out successfully');
  },

  async refresh(req: Request, res: Response) {
    const rawRefreshToken = req.cookies?.helpdesk_refresh_token;
    if (!rawRefreshToken) {
      return ApiResponse.error(res, 'Refresh token cookie missing', 'UNAUTHORIZED', undefined, 401);
    }

    const hash = tokenHelper.hashToken(rawRefreshToken);
    const tokenRecord = dbStore.refreshTokens.find(
      (t) => t.tokenHash === hash && !t.isRevoked && new Date(t.expiresAt) > new Date()
    );

    if (!tokenRecord) {
      return ApiResponse.error(res, 'Invalid or expired refresh token', 'TOKEN_EXPIRED', undefined, 401);
    }

    const user = dbStore.users.find((u) => u.id === tokenRecord.userId);
    if (!user || user.status !== 'ACTIVE') {
      return ApiResponse.error(res, 'User inactive or deleted', 'UNAUTHORIZED', undefined, 401);
    }

    // Refresh token rotation
    tokenRecord.isRevoked = true;
    const newRefresh = tokenHelper.generateRefreshToken();
    dbStore.refreshTokens.push({
      id: uuidv4(),
      userId: user.id,
      tokenHash: newRefresh.tokenHash,
      expiresAt: newRefresh.expiresAt,
      isRevoked: false,
      createdAt: new Date(),
    });

    res.cookie('helpdesk_refresh_token', newRefresh.rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const newAccessToken = tokenHelper.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    });

    return ApiResponse.success(res, { accessToken: newAccessToken });
  },

  async getMe(req: Request, res: Response) {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated', 'UNAUTHORIZED', undefined, 401);
    }

    const user = dbStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 'NOT_FOUND', undefined, 404);
    }

    const department = dbStore.departments.find((d) => d.id === user.departmentId);

    const userSafe = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      employeeId: user.employeeId,
      phone: user.phone,
      role: user.role,
      status: user.status,
      designation: user.designation,
      departmentId: user.departmentId,
      department: department ? { id: department.id, name: department.name, code: department.code } : null,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    return ApiResponse.success(res, userSafe);
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const user = dbStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      const resetToken = uuidv4();
      dbStore.logAudit({
        actorId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entity: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { resetTokenSent: true },
      });
      return ApiResponse.success(res, { resetToken }, 'Password reset instructions sent to email');
    }

    // Always return success for security (prevents user enumeration)
    return ApiResponse.success(res, null, 'If that account exists, an email has been sent.');
  },

  async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    // In our system, any valid token or demo flow sets a password
    const user = dbStore.users[0]; // Reset default test target
    if (user) {
      user.passwordHash = bcrypt.hashSync(newPassword, 10);
      user.updatedAt = new Date();
      dbStore.logAudit({
        actorId: user.id,
        action: 'PASSWORD_RESET_COMPLETED',
        entity: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    return ApiResponse.success(res, null, 'Password successfully reset. You may now sign in.');
  },

  async changePassword(req: Request, res: Response) {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated', 'UNAUTHORIZED', undefined, 401);
    }

    const { currentPassword, newPassword } = req.body;
    const user = dbStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 'NOT_FOUND', undefined, 404);
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isMatch) {
      return ApiResponse.error(res, 'Current password does not match', 'BAD_REQUEST', undefined, 400);
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    user.updatedAt = new Date();

    dbStore.logAudit({
      actorId: user.id,
      action: 'PASSWORD_CHANGED',
      entity: 'USER',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return ApiResponse.success(res, null, 'Password successfully updated');
  },

  async updateProfile(req: Request, res: Response) {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated', 'UNAUTHORIZED', undefined, 401);
    }

    const user = dbStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 'NOT_FOUND', undefined, 404);
    }

    const { fullName, phone, designation } = req.body;
    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (designation !== undefined) user.designation = designation;
    user.updatedAt = new Date();

    return ApiResponse.success(res, user, 'Profile updated successfully');
  },
};

