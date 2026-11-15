import {
  SEED_USERS,
  SEED_DEPARTMENTS,
  SEED_CATEGORIES,
  SEED_SLA_POLICIES,
  SEED_TICKETS,
  SEED_COMMENTS,
  SEED_ACTIVITIES,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SeedDepartment,
  SeedCategory,
  SeedSlaPolicy,
  SeedNotification,
  SeedActivity,
  SeedTicket,
  SeedAuditLog,
} from './seedData';
import { v4 as uuidv4 } from 'uuid';
import { slaCalculator } from '../utils/slaCalculator';

// In-Memory Relational Store with deep clone from Seed Data
class MemoryStore {
  public users = [...SEED_USERS];
  public departments: SeedDepartment[] = [...SEED_DEPARTMENTS];
  public categories: SeedCategory[] = [...SEED_CATEGORIES];
  public slaPolicies: SeedSlaPolicy[] = [...SEED_SLA_POLICIES];
  public tickets: SeedTicket[] = [...SEED_TICKETS];
  public comments = [...SEED_COMMENTS];
  public activities: SeedActivity[] = [...SEED_ACTIVITIES];
  public attachments: any[] = [];
  public notifications: SeedNotification[] = [...SEED_NOTIFICATIONS];
  public auditLogs: SeedAuditLog[] = [...SEED_AUDIT_LOGS];
  public refreshTokens: any[] = [];
  public serviceRatings: any[] = [
    {
      id: 'rating-001',
      ticketId: 'tkt-005',
      requesterId: 'user-005',
      technicianId: 'user-003',
      rating: 5,
      feedback: 'Excellent response and fixed Outlook search right away!',
      createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000),
    },
  ];
  public systemSettings: Record<string, string> = {
    allowRegistration: 'true',
    defaultSlaEnforced: 'true',
    emailNotificationsEnabled: 'true',
    maxAttachmentSizeMb: '10',
    systemName: 'Helpdesk Pro Enterprise',
  };

  // Helper: auto-generate next ticket number
  public generateTicketNumber(): string {
    const year = new Date().getFullYear();
    const count = this.tickets.length + 1;
    return `TKT-${year}-${String(count).padStart(4, '0')}`;
  }

  // Populate relations for a ticket
  public hydrateTicket(t: any, viewerRole?: string): any {
    const requester = this.users.find((u) => u.id === t.requesterId);
    const assignee = this.users.find((u) => u.id === t.assigneeId);
    const department = this.departments.find((d) => d.id === t.departmentId);
    const category = this.categories.find((c) => c.id === t.categoryId);
    const slaPolicy = this.slaPolicies.find((s) => s.id === t.slaPolicyId);

    // Filter comments: internal comments are NEVER shown to employees
    const rawComments = this.comments.filter((c) => c.ticketId === t.id);
    const comments = rawComments
      .filter((c) => (viewerRole === 'EMPLOYEE' ? !c.isInternal : true))
      .map((c) => {
        const author = this.users.find((u) => u.id === c.authorId);
        return {
          ...c,
          author: author
            ? {
                id: author.id,
                fullName: author.fullName,
                email: author.email,
                role: author.role,
                avatarUrl: author.avatarUrl,
              }
            : null,
          attachments: this.attachments.filter((a) => a.commentId === c.id),
        };
      });

    const activities = this.activities
      .filter((a) => a.ticketId === t.id)
      .map((a) => {
        const actor = this.users.find((u) => u.id === a.actorId);
        return {
          ...a,
          actor: actor
            ? { id: actor.id, fullName: actor.fullName, role: actor.role }
            : null,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const ticketAttachments = this.attachments.filter((a) => a.ticketId === t.id);
    const rating = this.serviceRatings.find((r) => r.ticketId === t.id);

    // Dynamically check if overdue
    const isOverdue = slaCalculator.checkIsOverdue(t.resolutionDueAt, t.status);

    return {
      ...t,
      isOverdue,
      requester: requester
        ? {
            id: requester.id,
            fullName: requester.fullName,
            email: requester.email,
            employeeId: requester.employeeId,
            role: requester.role,
            phone: requester.phone,
          }
        : null,
      assignee: assignee
        ? {
            id: assignee.id,
            fullName: assignee.fullName,
            email: assignee.email,
            employeeId: assignee.employeeId,
            role: assignee.role,
          }
        : null,
      department: department ? { id: department.id, name: department.name, code: department.code } : null,
      category: category ? { id: category.id, name: category.name, code: category.code } : null,
      slaPolicy: slaPolicy ? { id: slaPolicy.id, name: slaPolicy.name, priority: slaPolicy.priority } : null,
      comments,
      activities,
      attachments: ticketAttachments,
      rating: rating || null,
      _count: {
        comments: comments.length,
        attachments: ticketAttachments.length,
      },
    };
  }

  // Record an audit log entry
  public logAudit(entry: {
    actorId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
  }) {
    this.auditLogs.unshift({
      id: `audit-${uuidv4()}`,
      actorId: entry.actorId || null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId || null,
      ipAddress: entry.ipAddress || '127.0.0.1',
      userAgent: entry.userAgent || 'App',
      details: entry.details || null,
      createdAt: new Date(),
    });
  }

  // Create notification
  public notify(entry: {
    userId: string;
    title: string;
    message: string;
    type: string;
    entityType?: string | null;
    entityId?: string | null;
  }) {
    this.notifications.unshift({
      id: `notif-${uuidv4()}`,
      userId: entry.userId,
      title: entry.title,
      message: entry.message,
      type: entry.type,
      entityType: entry.entityType || 'TICKET',
      entityId: entry.entityId || null,
      isRead: false,
      readAt: null,
      createdAt: new Date(),
    });
  }
}

export const dbStore = new MemoryStore();
