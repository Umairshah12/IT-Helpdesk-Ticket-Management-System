import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../data/store';
import { ApiResponse } from '../utils/apiResponse';
import { v4 as uuidv4 } from 'uuid';

export const userController = {
  async getUsers(req: Request, res: Response) {
    const { role, status, departmentId, search, page = 1, limit = 20 } = req.query as any;

    let users = [...dbStore.users];

    if (role) {
      users = users.filter((u) => u.role === role);
    }
    if (status) {
      users = users.filter((u) => u.status === status);
    }
    if (departmentId) {
      users = users.filter((u) => u.departmentId === departmentId);
    }
    if (search) {
      const term = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.employeeId.toLowerCase().includes(term)
      );
    }

    const total = users.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const paginated = users.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const safeUsers = paginated.map((u) => {
      const dept = dbStore.departments.find((d) => d.id === u.departmentId);
      return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        employeeId: u.employeeId,
        phone: u.phone,
        role: u.role,
        status: u.status,
        designation: u.designation,
        departmentId: u.departmentId,
        department: dept ? { id: dept.id, name: dept.name, code: dept.code } : null,
        joiningDate: u.joiningDate,
        createdAt: u.createdAt,
      };
    });

    return ApiResponse.success(res, safeUsers, undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  },

  async getUserById(req: Request, res: Response) {
    const { id } = req.params;
    const user = dbStore.users.find((u) => u.id === id);

    if (!user) {
      return ApiResponse.error(res, 'User not found', 'NOT_FOUND', undefined, 404);
    }

    const dept = dbStore.departments.find((d) => d.id === user.departmentId);
    const assignedTickets = dbStore.tickets.filter((t) => t.assigneeId === user.id);
    const requestedTickets = dbStore.tickets.filter((t) => t.requesterId === user.id);

    return ApiResponse.success(res, {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      employeeId: user.employeeId,
      phone: user.phone,
      role: user.role,
      status: user.status,
      designation: user.designation,
      departmentId: user.departmentId,
      department: dept ? { id: dept.id, name: dept.name, code: dept.code } : null,
      joiningDate: user.joiningDate,
      createdAt: user.createdAt,
      stats: {
        assignedTotal: assignedTickets.length,
        assignedActive: assignedTickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length,
        requestedTotal: requestedTickets.length,
      },
    });
  },

  async createUser(req: Request, res: Response) {
    const actor = req.user!;
    const { email, fullName, employeeId, password, role, departmentId, designation, phone } = req.body;

    // Check unique email and employeeId
    const emailExists = dbStore.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return ApiResponse.error(res, 'A user with this email address already exists.', 'DUPLICATE_EMAIL', undefined, 400);
    }

    const empIdExists = dbStore.users.some((u) => u.employeeId.toUpperCase() === employeeId.toUpperCase());
    if (empIdExists) {
      return ApiResponse.error(res, 'A user with this Employee ID already exists.', 'DUPLICATE_EMP_ID', undefined, 400);
    }

    // Role safety check: Admins cannot create Super Admins
    if (role === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      return ApiResponse.error(res, 'Only Super Admins can provision new Super Admin accounts.', 'FORBIDDEN', undefined, 403);
    }

    const newUserId = `user-${uuidv4().substring(0, 8)}`;
    const passwordHash = bcrypt.hashSync(password || 'Welcome@2026!', 10);

    const newUser: any = {
      id: newUserId,
      email,
      passwordHash,
      fullName,
      employeeId,
      phone: phone || null,
      role,
      status: 'ACTIVE',
      designation: designation || null,
      departmentId: departmentId || null,
      avatarUrl: null,
      joiningDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.users.unshift(newUser);

    dbStore.logAudit({
      actorId: actor.id,
      action: 'USER_CREATED',
      entity: 'USER',
      entityId: newUserId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { email, role, employeeId },
    });

    const dept = dbStore.departments.find((d) => d.id === departmentId);
    return ApiResponse.success(
      res,
      {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        employeeId: newUser.employeeId,
        role: newUser.role,
        status: newUser.status,
        department: dept ? { id: dept.id, name: dept.name } : null,
      },
      'User created successfully',
      undefined,
      201
    );
  },

  async updateUser(req: Request, res: Response) {
    const actor = req.user!;
    const { id } = req.params;
    const user = dbStore.users.find((u) => u.id === id);

    if (!user) {
      return ApiResponse.error(res, 'User not found', 'NOT_FOUND', undefined, 404);
    }

    const { fullName, phone, designation, departmentId } = req.body;
    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (designation !== undefined) user.designation = designation;
    if (departmentId !== undefined) user.departmentId = departmentId;
    user.updatedAt = new Date();

    dbStore.logAudit({
      actorId: actor.id,
      action: 'USER_UPDATED',
      entity: 'USER',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { fullName, departmentId },
    });

    return ApiResponse.success(res, user, 'User updated successfully');
  },

  async updateStatus(req: Request, res: Response) {
    const actor = req.user!;
    const { id } = req.params;
    const { status } = req.body;

    const user = dbStore.users.find((u) => u.id === id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 'NOT_FOUND', undefined, 404);
    }

    // Protection: cannot deactivate oneself or the primary Super Admin
    if (user.id === actor.id) {
      return ApiResponse.error(res, 'You cannot alter your own account status.', 'BAD_REQUEST', undefined, 400);
    }

    const oldStatus = user.status;
    user.status = status;
    user.updatedAt = new Date();

    dbStore.logAudit({
      actorId: actor.id,
      action: 'USER_STATUS_CHANGED',
      entity: 'USER',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { oldStatus, newStatus: status },
    });

    return ApiResponse.success(res, { id: user.id, status: user.status }, `Account status updated to ${status}`);
  },

  async updateRole(req: Request, res: Response) {
    const actor = req.user!;
    const { id } = req.params;
    const { role } = req.body;

    // Only Super Admin can change roles
    if (actor.role !== 'SUPER_ADMIN') {
      return ApiResponse.error(res, 'Only Super Admins are permitted to change user roles.', 'FORBIDDEN', undefined, 403);
    }

    const user = dbStore.users.find((u) => u.id === id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 'NOT_FOUND', undefined, 404);
    }

    const oldRole = user.role;
    user.role = role;
    user.updatedAt = new Date();

    dbStore.logAudit({
      actorId: actor.id,
      action: 'USER_ROLE_ELEVATED',
      entity: 'USER',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { oldRole, newRole: role },
    });

    return ApiResponse.success(res, { id: user.id, role: user.role }, `User role updated to ${role}`);
  },

  async getTechnicians(req: Request, res: Response) {
    const techs = dbStore.users.filter((u) => u.role === 'TECHNICIAN' && u.status === 'ACTIVE');

    const result = techs.map((t) => {
      const activeTickets = dbStore.tickets.filter(
        (tkt) => tkt.assigneeId === t.id && tkt.status !== 'RESOLVED' && tkt.status !== 'CLOSED'
      );
      const resolvedTickets = dbStore.tickets.filter((tkt) => tkt.assigneeId === t.id && (tkt.status === 'RESOLVED' || tkt.status === 'CLOSED'));

      return {
        id: t.id,
        fullName: t.fullName,
        email: t.email,
        employeeId: t.employeeId,
        designation: t.designation,
        activeWorkload: activeTickets.length,
        resolvedCount: resolvedTickets.length,
        isAvailable: activeTickets.length < 10,
      };
    });

    return ApiResponse.success(res, result);
  },
};

