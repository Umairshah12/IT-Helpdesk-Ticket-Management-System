import { Request, Response } from 'express';
import { dbStore } from '../data/store';
import { ApiResponse } from '../utils/apiResponse';
import { v4 as uuidv4 } from 'uuid';

export const departmentController = {
  async getDepartments(req: Request, res: Response) {
    const departments = dbStore.departments.map((dept) => {
      const memberCount = dbStore.users.filter((u) => u.departmentId === dept.id).length;
      const openTicketCount = dbStore.tickets.filter(
        (t) => t.departmentId === dept.id && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
      ).length;
      const manager = dbStore.users.find((u) => u.id === dept.managerId);

      return {
        ...dept,
        memberCount,
        openTicketCount,
        manager: manager ? { id: manager.id, fullName: manager.fullName, email: manager.email } : null,
      };
    });

    return ApiResponse.success(res, departments);
  },

  async getDepartmentById(req: Request, res: Response) {
    const { id } = req.params;
    const dept = dbStore.departments.find((d) => d.id === id);

    if (!dept) {
      return ApiResponse.error(res, 'Department not found', 'NOT_FOUND', undefined, 404);
    }

    const members = dbStore.users
      .filter((u) => u.departmentId === dept.id)
      .map((u) => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, employeeId: u.employeeId }));

    const tickets = dbStore.tickets
      .filter((t) => t.departmentId === dept.id)
      .map((t) => dbStore.hydrateTicket(t));

    return ApiResponse.success(res, {
      ...dept,
      members,
      tickets,
    });
  },

  async createDepartment(req: Request, res: Response) {
    const actor = req.user!;
    const { name, code, description, managerId } = req.body;

    const existingName = dbStore.departments.some((d) => d.name.toLowerCase() === name.toLowerCase());
    if (existingName) {
      return ApiResponse.error(res, 'A department with this name already exists.', 'DUPLICATE_NAME', undefined, 400);
    }

    const existingCode = dbStore.departments.some((d) => d.code.toUpperCase() === code.toUpperCase());
    if (existingCode) {
      return ApiResponse.error(res, 'A department with this code already exists.', 'DUPLICATE_CODE', undefined, 400);
    }

    const newDeptId = `dept-${uuidv4().substring(0, 8)}`;
    const newDept = {
      id: newDeptId,
      name,
      code: code.toUpperCase(),
      description: description || null,
      managerId: managerId || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.departments.push(newDept);

    dbStore.logAudit({
      actorId: actor.id,
      action: 'DEPARTMENT_CREATED',
      entity: 'DEPARTMENT',
      entityId: newDeptId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { name, code },
    });

    return ApiResponse.success(res, newDept, 'Department created successfully', undefined, 201);
  },

  async updateDepartment(req: Request, res: Response) {
    const actor = req.user!;
    const { id } = req.params;
    const dept = dbStore.departments.find((d) => d.id === id);

    if (!dept) {
      return ApiResponse.error(res, 'Department not found', 'NOT_FOUND', undefined, 404);
    }

    const { name, code, description, managerId, isActive } = req.body;
    if (name) dept.name = name;
    if (code) dept.code = code.toUpperCase();
    if (description !== undefined) dept.description = description;
    if (managerId !== undefined) dept.managerId = managerId;
    if (isActive !== undefined) dept.isActive = isActive;
    dept.updatedAt = new Date();

    dbStore.logAudit({
      actorId: actor.id,
      action: 'DEPARTMENT_UPDATED',
      entity: 'DEPARTMENT',
      entityId: dept.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { name: dept.name },
    });

    return ApiResponse.success(res, dept, 'Department updated successfully');
  },

  async deleteDepartment(req: Request, res: Response) {
    const { id } = req.params;
    const dept = dbStore.departments.find((d) => d.id === id);

    if (!dept) {
      return ApiResponse.error(res, 'Department not found', 'NOT_FOUND', undefined, 404);
    }

    // Safety constraint: Prevent deletion if users or tickets exist
    const userCount = dbStore.users.filter((u) => u.departmentId === dept.id).length;
    if (userCount > 0) {
      return ApiResponse.error(
        res,
        `Cannot delete department because ${userCount} users are assigned to it. Deactivate the department or reassign users first.`,
        'DEPENDENCY_CONFLICT',
        undefined,
        400
      );
    }

    dept.isActive = false;
    dept.updatedAt = new Date();

    return ApiResponse.success(res, null, 'Department deactivated safely');
  },
};

