import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  employeeId: z.string().min(2),
  password: z.string().min(8).optional().default('Welcome@2026!'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN', 'EMPLOYEE']),
  departmentId: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export const updateRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN', 'EMPLOYEE']),
});

