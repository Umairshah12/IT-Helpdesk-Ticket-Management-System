import { Request, Response, NextFunction } from 'express';
import { tokenHelper } from '../utils/tokenHelper';
import { ApiResponse } from '../utils/apiResponse';
import { dbStore } from '../data/store';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'EMPLOYEE';
  fullName: string;
  departmentId?: string | null;
  employeeId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Authentication required. No token provided.', 'UNAUTHORIZED', undefined, 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = tokenHelper.verifyAccessToken(token);

  if (!payload) {
    return ApiResponse.error(res, 'Invalid or expired access token.', 'TOKEN_EXPIRED', undefined, 401);
  }

  // Retrieve user record to verify account is active
  const user = dbStore.users.find((u) => u.id === payload.userId);
  if (!user) {
    return ApiResponse.error(res, 'User record not found.', 'USER_NOT_FOUND', undefined, 401);
  }

  if (user.status !== 'ACTIVE') {
    return ApiResponse.error(res, `Account is ${user.status.toLowerCase()}. Access denied.`, 'ACCOUNT_INACTIVE', undefined, 403);
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role as any,
    fullName: user.fullName,
    departmentId: user.departmentId,
    employeeId: user.employeeId,
  };

  next();
};

