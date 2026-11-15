import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must provide at least 10 characters of detail'),
  categoryId: z.string().min(1, 'Category is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  departmentId: z.string().optional(),
  location: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'OPEN',
    'ASSIGNED',
    'IN_PROGRESS',
    'PENDING_USER',
    'PENDING_THIRD_PARTY',
    'RESOLVED',
    'CLOSED',
  ]),
  note: z.string().optional(),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  note: z.string().optional(),
});

export const assignTicketSchema = z.object({
  assigneeId: z.string().nullable(),
  reason: z.string().optional(),
});

export const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty'),
  isInternal: z.boolean().optional().default(false),
});

export const resolveTicketSchema = z.object({
  resolutionNote: z.string().min(5, 'Resolution note is required'),
});

export const reopenTicketSchema = z.object({
  reason: z.string().min(5, 'Reason for reopening ticket is required'),
});

export const rateTicketSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().optional(),
});

