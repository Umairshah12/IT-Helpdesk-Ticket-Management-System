export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'EMPLOYEE';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_USER'
  | 'PENDING_THIRD_PARTY'
  | 'RESOLVED'
  | 'CLOSED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  employeeId: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  designation?: string | null;
  avatarUrl?: string | null;
  departmentId?: string | null;
  department?: Department | null;
  joiningDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  managerId?: string | null;
  manager?: User | null;
  isActive: boolean;
  memberCount?: number;
  openTicketCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  defaultPriority: TicketPriority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SLAPolicy {
  id: string;
  name: string;
  description?: string | null;
  priority: TicketPriority;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  isBusinessHoursOnly: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  fileUrl: string;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    fullName: string;
    role: Role;
  };
  createdAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    avatarUrl?: string | null;
  };
  content: string;
  isInternal: boolean;
  attachments?: TicketAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  actorId: string;
  actor: {
    id: string;
    fullName: string;
    role: Role;
  };
  actionType: string;
  fieldChanged?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  description: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ServiceRating {
  id: string;
  ticketId: string;
  requesterId: string;
  technicianId?: string | null;
  rating: number; // 1-5
  feedback?: string | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  location?: string | null;
  responseDueAt?: string | null;
  resolutionDueAt?: string | null;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;

  categoryId: string;
  category?: TicketCategory;

  departmentId?: string | null;
  department?: Department | null;

  requesterId: string;
  requester: User;

  assigneeId?: string | null;
  assignee?: User | null;

  slaPolicyId?: string | null;
  slaPolicy?: SLAPolicy | null;

  comments?: TicketComment[];
  attachments?: TicketAttachment[];
  activities?: TicketActivity[];
  rating?: ServiceRating | null;
  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  actorId?: string | null;
  actor?: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
  } | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  overdueTickets: number;
  totalEmployees: number;
  totalTechnicians: number;
  totalDepartments: number;
  avgResponseTimeMinutes: number;
  avgResolutionTimeHours: number;
  slaCompliancePercentage: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

