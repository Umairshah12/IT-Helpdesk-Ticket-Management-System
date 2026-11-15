import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  description: z.string().optional().nullable(),
  defaultPriority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  isActive: z.boolean().optional(),
});

export const slaPolicySchema = z.object({
  name: z.string().min(2).max(100),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  responseTimeMinutes: z.number().int().positive(),
  resolutionTimeMinutes: z.number().int().positive(),
  isBusinessHoursOnly: z.boolean().default(true),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

