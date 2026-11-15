import { Request, Response } from 'express';
import { dbStore } from '../data/store';
import { ApiResponse } from '../utils/apiResponse';
import { slaCalculator } from '../utils/slaCalculator';
import { v4 as uuidv4 } from 'uuid';

export const ticketController = {
  async getTickets(req: Request, res: Response) {
    const user = req.user!;
    const {
      search,
      status,
      priority,
      categoryId,
      departmentId,
      assigneeId,
      requesterId,
      isOverdue,
      dateRange,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query as any;

    let tickets = [...dbStore.tickets];

    // RBAC Scope Filtering
    if (user.role === 'EMPLOYEE') {
      tickets = tickets.filter((t) => t.requesterId === user.id);
    } else if (user.role === 'TECHNICIAN' && req.query.myTickets === 'true') {
      tickets = tickets.filter((t) => t.assigneeId === user.id);
    }

    // Explicit Filter Queries
    if (status) {
      tickets = tickets.filter((t) => t.status === status);
    }
    if (priority) {
      tickets = tickets.filter((t) => t.priority === priority);
    }
    if (categoryId) {
      tickets = tickets.filter((t) => t.categoryId === categoryId);
    }
    if (departmentId) {
      tickets = tickets.filter((t) => t.departmentId === departmentId);
    }
    if (assigneeId) {
      tickets = tickets.filter((t) => t.assigneeId === assigneeId);
    }
    if (requesterId) {
      tickets = tickets.filter((t) => t.requesterId === requesterId);
    }
    if (isOverdue === 'true') {
      tickets = tickets.filter((t) => slaCalculator.checkIsOverdue(t.resolutionDueAt, t.status));
    }

    // Date Range Filter
    const now = Date.now();
    if (dateRange === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      tickets = tickets.filter((t) => new Date(t.createdAt) >= startOfDay);
    } else if (dateRange === '7days') {
      const cut = new Date(now - 7 * 24 * 60 * 60 * 1000);
      tickets = tickets.filter((t) => new Date(t.createdAt) >= cut);
    } else if (dateRange === '30days') {
      const cut = new Date(now - 30 * 24 * 60 * 60 * 1000);
      tickets = tickets.filter((t) => new Date(t.createdAt) >= cut);
    } else if (dateRange === '90days') {
      const cut = new Date(now - 90 * 24 * 60 * 60 * 1000);
      tickets = tickets.filter((t) => new Date(t.createdAt) >= cut);
    } else if (startDate && endDate) {
      tickets = tickets.filter(
        (t) => new Date(t.createdAt) >= new Date(startDate) && new Date(t.createdAt) <= new Date(endDate)
      );
    }

    // Search Query (ticket number, title, description)
    if (search) {
      const term = search.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(term) ||
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term)
      );
    }

    // Sorting
    tickets.sort((a: any, b: any) => {
      const valA = new Date(a[sortBy] || a.createdAt).getTime();
      const valB = new Date(b[sortBy] || b.createdAt).getTime();
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const total = tickets.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const paginated = tickets.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const hydrated = paginated.map((t) => dbStore.hydrateTicket(t, user.role));

    return ApiResponse.success(res, hydrated, undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  },

  async getTicketById(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;

    const ticket = dbStore.tickets.find((t) => t.id === id || t.ticketNumber === id);
    if (!ticket) {
      return ApiResponse.error(res, 'Ticket not found', 'NOT_FOUND', undefined, 404);
    }

    // Employee authorization check: employees can only view their own tickets
    if (user.role === 'EMPLOYEE' && ticket.requesterId !== user.id) {
      return ApiResponse.error(res, 'Access denied. You can only view your own tickets.', 'FORBIDDEN', undefined, 403);
    }

    const hydrated = dbStore.hydrateTicket(ticket, user.role);
    return ApiResponse.success(res, hydrated);
  },

  async createTicket(req: Request, res: Response) {
    const user = req.user!;
    const { title, description, categoryId, priority, departmentId, location, assigneeId } = req.body;

    // Resolve category and SLA policy
    const category = dbStore.categories.find((c) => c.id === categoryId);
    if (!category) {
      return ApiResponse.error(res, 'Category not found', 'BAD_REQUEST', undefined, 400);
    }

    const slaPolicy = dbStore.slaPolicies.find((p) => p.priority === priority && p.isActive);
    const responseMins = slaPolicy ? slaPolicy.responseTimeMinutes : 240;
    const resolutionMins = slaPolicy ? slaPolicy.resolutionTimeMinutes : 1440;

    const { responseDueAt, resolutionDueAt } = slaCalculator.calculateDeadlines({
      createdAt: new Date(),
      responseTimeMinutes: responseMins,
      resolutionTimeMinutes: resolutionMins,
      isBusinessHoursOnly: slaPolicy ? slaPolicy.isBusinessHoursOnly : true,
    });

    const newTicketId = `tkt-${uuidv4().substring(0, 8)}`;
    const ticketNumber = dbStore.generateTicketNumber();

    const newTicket: any = {
      id: newTicketId,
      ticketNumber,
      title,
      description,
      priority,
      status: assigneeId ? 'ASSIGNED' : 'OPEN',
      location: location || null,
      categoryId,
      departmentId: departmentId || user.departmentId || 'dept-001',
      requesterId: user.id,
      assigneeId: assigneeId || null,
      slaPolicyId: slaPolicy ? slaPolicy.id : null,
      responseDueAt,
      resolutionDueAt,
      firstResponseAt: null as Date | null,
      resolvedAt: null as Date | null,
      closedAt: null as Date | null,
      isOverdue: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.tickets.unshift(newTicket);

    // Record creation activity
    dbStore.activities.unshift({
      id: `act-${uuidv4()}`,
      ticketId: newTicketId,
      actorId: user.id,
      actionType: 'CREATED',
      fieldChanged: null,
      oldValue: null,
      newValue: null,
      description: `Ticket created by ${user.fullName} with ${priority} priority.`,
      metadata: null,
      createdAt: new Date(),
    });

    // Notify assignee if assigned
    if (assigneeId) {
      dbStore.notify({
        userId: assigneeId,
        title: 'New Ticket Assigned',
        message: `You have been assigned to ticket ${ticketNumber}: "${title}".`,
        type: 'TICKET_ASSIGNED',
        entityType: 'TICKET',
        entityId: newTicketId,
      });
    }

    // Notify admins of new critical/high tickets
    if (priority === 'CRITICAL' || priority === 'HIGH') {
      const admins = dbStore.users.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN');
      admins.forEach((admin) => {
        dbStore.notify({
          userId: admin.id,
          title: `New ${priority} Ticket Created`,
          message: `${ticketNumber} requires attention: "${title}".`,
          type: 'TICKET_ALERT',
          entityType: 'TICKET',
          entityId: newTicketId,
        });
      });
    }

    dbStore.logAudit({
      actorId: user.id,
      action: 'TICKET_CREATED',
      entity: 'TICKET',
      entityId: newTicketId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { ticketNumber, priority, title },
    });

    const hydrated = dbStore.hydrateTicket(newTicket, user.role);
    return ApiResponse.success(res, hydrated, 'Ticket created successfully', undefined, 201);
  },

  async updateTicket(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const ticket = dbStore.tickets.find((t) => t.id === id);

    if (!ticket) {
      return ApiResponse.error(res, 'Ticket not found', 'NOT_FOUND', undefined, 404);
    }

    const { title, description, location, categoryId } = req.body;
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (location !== undefined) ticket.location = location;
    if (categoryId) ticket.categoryId = categoryId;
    ticket.updatedAt = new Date();

    const hydrated = dbStore.hydrateTicket(ticket, user.role);
    return ApiResponse.success(res, hydrated, 'Ticket updated successfully');
  },

  async updateStatus(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const { status, note } = req.body;

    const ticket: any = dbStore.tickets.find((t) => t.id === id);
    if (!ticket) {
      return ApiResponse.error(res, 'Ticket not found', 'NOT_FOUND', undefined, 404);
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updatedAt = new Date();

    // Check first response tracking
    if (!ticket.firstResponseAt && (status === 'IN_PROGRESS' || user.role === 'TECHNICIAN')) {
      ticket.firstResponseAt = new Date();
    }

    if (status === 'RESOLVED') {
      ticket.resolvedAt = new Date();
    } else if (status === 'CLOSED') {
      ticket.closedAt = new Date();
    }

    // Activity
    dbStore.activities.unshift({
      id: `act-${uuidv4()}`,
      ticketId: ticket.id,
      actorId: user.id,
      actionType: 'STATUS_CHANGED',
      fieldChanged: 'status',
      oldValue: oldStatus,
      newValue: status,
      description: `${user.fullName} updated ticket status from ${oldStatus} to ${status}.${note ? ` Note: ${note}` : ''}`,
      metadata: { note },
      createdAt: new Date(),
    });

    // Notify requester
    if (ticket.requesterId !== user.id) {
      dbStore.notify({
        userId: ticket.requesterId,
        title: 'Ticket Status Updated',
        message: `Your ticket ${ticket.ticketNumber} is now ${status.replace('_', ' ')}.`,
        type: 'STATUS_UPDATED',
        entityType: 'TICKET',
        entityId: ticket.id,
      });
    }

    const hydrated = dbStore.hydrateTicket(ticket, user.role);
    return ApiResponse.success(res, hydrated, `Status updated to ${status}`);
  },

  async updatePriority(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const { priority, note } = req.body;

    const ticket = dbStore.tickets.find((t) => t.id === id);
    if (!ticket) {
      return ApiResponse.error(res, 'Ticket not found', 'NOT_FOUND', undefined, 404);
    }

    const oldPriority = ticket.priority;
    ticket.priority = priority;

    // Recompute SLA deadlines
    const slaPolicy = dbStore.slaPolicies.find((p) => p.priority === priority && p.isActive);
    if (slaPolicy) {
      ticket.slaPolicyId = slaPolicy.id;
      const { responseDueAt, resolutionDueAt } = slaCalculator.calculateDeadlines({
        createdAt: new Date(ticket.createdAt),
        responseTimeMinutes: slaPolicy.responseTimeMinutes,
        resolutionTimeMinutes: slaPolicy.resolutionTimeMinutes,
        isBusinessHoursOnly: slaPolicy.isBusinessHoursOnly,
      });
      ticket.responseDueAt = responseDueAt;
      ticket.resolutionDueAt = resolutionDueAt;
    }
    ticket.updatedAt = new Date();

    dbStore.activities.unshift({
      id: `act-${uuidv4()}`,
      ticketId: ticket.id,
      actorId: user.id,
      actionType: 'PRIORITY_CHANGED',
      fieldChanged: 'priority',
      oldValue: oldPriority,
      newValue: priority,
      description: `${user.fullName} changed priority from ${oldPriority} to ${priority}.${note ? ` Note: ${note}` : ''}`,
      createdAt: new Date(),
    });

    const hydrated = dbStore.hydrateTicket(ticket, user.role);
    return ApiResponse.success(res, hydrated, `Priority updated to ${priority}`);
  },

  async assignTicket(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const { assigneeId, reason } = req.body;

    const ticket: any = dbStore.tickets.find((t) => t.id === id);
    if (!ticket) {
      return ApiResponse.error(res, 'Ticket not found', 'NOT_FOUND', undefined, 404);
    }

    const previousAssigneeId = ticket.assigneeId;
    ticket.assigneeId = assigneeId;
    if (assigneeId && ticket.status === 'OPEN') {
      ticket.status = 'ASSIGNED';
    }
    ticket.updatedAt = new Date();

    const newAssignee = dbStore.users.find((u) => u.id === assigneeId);

    dbStore.activities.unshift({
      id: `act-${uuidv4()}`,
      ticketId: ticket.id,
      actorId: user.id,
      actionType: 'ASSIGNED',
      fieldChanged: 'assigneeId',
      oldValue: previousAssigneeId,
      newValue: assigneeId,
      description: assigneeId
        ? `Ticket assigned to ${newAssignee?.fullName || 'Technician'} by ${user.fullName}.${reason ? ` Reason: ${reason}` : ''}`
        : `Ticket unassigned by ${user.fullName}.`,
      createdAt: new Date(),
    });

    if (assigneeId && assigneeId !== user.id) {
      dbStore.notify({
        userId: assigneeId,
        title: 'Ticket Assigned',
        message: `Ticket ${ticket.ticketNumber} was assigned to you by ${user.fullName}.`,
        type: 'TICKET_ASSIGNED',
        entityType: 'TICKET',
        entityId: ticket.id,
      });
    }

    const hydrated = dbStore.hydrateTicket(ticket, user.role);
    return ApiResponse.success(res, hydrated, 'Ticket assignment updated');
  },

  async addComment(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const { content, isInternal = false } = req.body;

    const ticket: any = dbStore.tickets.find((t) => t.id === id);
    if (!ticket) {
      return ApiResponse.error(res, 'Ticket not found', 'NOT_FOUND', undefined, 404);
    }

    // Role check: Employees can NEVER post internal notes
    const safeInternal = user.role === 'EMPLOYEE' ? false : Boolean(isInternal);

    const commentId = `comment-${uuidv4()}`;
    const newComment = {
      id: commentId,
      ticketId: ticket.id,
      authorId: user.id,
      content,
      isInternal: safeInternal,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.comments.push(newComment);
    ticket.updatedAt = new Date();

    // Track first response if a technician or admin replies
    if (!ticket.firstResponseAt && user.role !== 'EMPLOYEE') {
      ticket.firstResponseAt = new Date();
    }

    dbStore.activities.unshift({
      id: `act-${uuidv4()}`,
      ticketId: ticket.id,
      actorId: user.id,
      actionType: safeInternal ? 'INTERNAL_NOTE_ADDED' : 'COMMENT_ADDED',
      description: safeInternal
        ? `${user.fullName} added an internal troubleshooting note.`
        : `${user.fullName} posted a reply on the ticket.`,
      createdAt: new Date(),
    });

    // Notify appropriate counterparty
    if (!safeInternal) {
      const recipientId = user.id === ticket.requesterId ? ticket.assigneeId : ticket.requesterId;
      if (recipientId) {
        dbStore.notify({
          userId: recipientId,
          title: `New Message on ${ticket.ticketNumber}`,
          message: `${user.fullName}: "${content.substring(0, 80)}${content.length > 80 ? '...' : ''}"`,
          type: 'NEW_COMMENT',
          entityType: 'TICKET',
          entityId: ticket.id,
        });
      }
    }

    const hydrated = dbStore.hydrateTicket(ticket, user.role);
    return ApiResponse.success(res, hydrated, 'Comment posted successfully');
  },

  async uploadAttachment(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return ApiResponse.error(res, 'No file was uploaded', 'BAD_REQUEST', undefined, 400);
    }

    const ticket = dbStore.tickets.find((t) => t.id === id);
    if (!ticket) {
      return ApiResponse.error(res, 'Ticket not found', 'NOT_FOUND', undefined, 404);
    }

    const attachmentRecord = {
      id: `attach-${uuidv4()}`,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      fileUrl: `/uploads/${file.filename}`,
      ticketId: ticket.id,
      uploadedById: user.id,
      createdAt: new Date(),
    };

    dbStore.attachments.push(attachmentRecord);

    dbStore.activities.unshift({
      id: `act-${uuidv4()}`,
      ticketId: ticket.id,
      actorId: user.id,
      actionType: 'ATTACHMENT_ADDED',
      description: `${user.fullName} attached file: ${file.originalname}`,
      createdAt: new Date(),
    });

    return ApiResponse.success(res, attachmentRecord, 'File uploaded successfully');
  },

  async resolveTicket(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const { resolutionNote } = req.body;

    const ticket: any = dbStore.tickets.find((t) => t.id === id);
    if (!ticket) {
      return ApiResponse.error(res, 'Ticket not found', 'NOT_FOUND', undefined, 404);
    }

    ticket.status = 'RESOLVED';
    ticket.resolvedAt = new Date();
    ticket.updatedAt = new Date();

    // Add resolution comment
    dbStore.comments.push({
      id: `comment-${uuidv4()}`,
      ticketId: ticket.id,
      authorId: user.id,
      content: `RESOLUTION SUMMARY: ${resolutionNote}`,
      isInternal: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    dbStore.activities.unshift({
      id: `act-${uuidv4()}`,
      ticketId: ticket.id,
      actorId: user.id,
      actionType: 'RESOLVED',
      description: `Ticket resolved by ${user.fullName}. Summary: ${resolutionNote}`,
      createdAt: new Date(),
    });

    // Notify requester with prompt to confirm or rate
    dbStore.notify({
      userId: ticket.requesterId,
      title: 'Ticket Resolved',
      message: `Your ticket ${ticket.ticketNumber} has been marked as RESOLVED by ${user.fullName}. Please review the resolution and rate your experience.`,
      type: 'TICKET_RESOLVED',
      entityType: 'TICKET',
      entityId: ticket.id,
    });

    const hydrated = dbStore.hydrateTicket(ticket, user.role);
    return ApiResponse.success(res, hydrated, 'Ticket resolved successfully');
  },

  async reopenTicket(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const { reason } = req.body;

    const ticket: any = dbStore.tickets.find((t) => t.id === id);
    if (!ticket) {
      return ApiResponse.error(res, 'Ticket not found', 'NOT_FOUND', undefined, 404);
    }

    if (ticket.status !== 'RESOLVED') {
      return ApiResponse.error(res, 'Only resolved tickets can be reopened', 'BAD_REQUEST', undefined, 400);
    }

    ticket.status = 'IN_PROGRESS';
    ticket.resolvedAt = null;
    ticket.updatedAt = new Date();

    dbStore.comments.push({
      id: `comment-${uuidv4()}`,
      ticketId: ticket.id,
      authorId: user.id,
      content: `TICKET REOPENED: ${reason}`,
      isInternal: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    dbStore.activities.unshift({
      id: `act-${uuidv4()}`,
      ticketId: ticket.id,
      actorId: user.id,
      actionType: 'REOPENED',
      description: `Ticket reopened by ${user.fullName}. Reason: ${reason}`,
      createdAt: new Date(),
    });

    if (ticket.assigneeId) {
      dbStore.notify({
        userId: ticket.assigneeId,
        title: 'Ticket Reopened',
        message: `Ticket ${ticket.ticketNumber} has been reopened by ${user.fullName}: "${reason}"`,
        type: 'TICKET_REOPENED',
        entityType: 'TICKET',
        entityId: ticket.id,
      });
    }

    const hydrated = dbStore.hydrateTicket(ticket, user.role);
    return ApiResponse.success(res, hydrated, 'Ticket reopened successfully');
  },

  async rateTicket(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const ticket: any = dbStore.tickets.find((t) => t.id === id);
    if (!ticket) {
      return ApiResponse.error(res, 'Ticket not found', 'NOT_FOUND', undefined, 404);
    }

    if (ticket.requesterId !== user.id) {
      return ApiResponse.error(res, 'Only the ticket requester can submit a rating', 'FORBIDDEN', undefined, 403);
    }

    const ratingRecord = {
      id: `rating-${uuidv4()}`,
      ticketId: ticket.id,
      requesterId: user.id,
      technicianId: ticket.assigneeId,
      rating,
      feedback: feedback || null,
      createdAt: new Date(),
    };

    const existingIdx = dbStore.serviceRatings.findIndex((r) => r.ticketId === ticket.id);
    if (existingIdx >= 0) {
      dbStore.serviceRatings[existingIdx] = ratingRecord;
    } else {
      dbStore.serviceRatings.push(ratingRecord);
    }

    // Auto-close ticket once rated
    if (ticket.status === 'RESOLVED') {
      ticket.status = 'CLOSED';
      ticket.closedAt = new Date();
    }

    dbStore.activities.unshift({
      id: `act-${uuidv4()}`,
      ticketId: ticket.id,
      actorId: user.id,
      actionType: 'RATED',
      description: `${user.fullName} rated the service ${rating}/5 stars.`,
      createdAt: new Date(),
    });

    const hydrated = dbStore.hydrateTicket(ticket, user.role);
    return ApiResponse.success(res, hydrated, 'Thank you for your rating and feedback!');
  },

  async exportCsv(req: Request, res: Response) {
    const user = req.user!;
    let tickets = [...dbStore.tickets];

    if (user.role === 'EMPLOYEE') {
      tickets = tickets.filter((t) => t.requesterId === user.id);
    }

    const headers = [
      'Ticket Number',
      'Title',
      'Priority',
      'Status',
      'Category',
      'Department',
      'Requester',
      'Assignee',
      'Created Date',
      'Due Date',
      'Resolved Date',
      'Is Overdue',
    ];

    const rows = tickets.map((t) => {
      const h = dbStore.hydrateTicket(t, user.role);
      return [
        h.ticketNumber,
        `"${h.title.replace(/"/g, '""')}"`,
        h.priority,
        h.status,
        h.category?.name || 'Uncategorized',
        h.department?.name || 'General',
        h.requester?.fullName || 'N/A',
        h.assignee?.fullName || 'Unassigned',
        new Date(h.createdAt).toISOString(),
        h.resolutionDueAt ? new Date(h.resolutionDueAt).toISOString() : 'None',
        h.resolvedAt ? new Date(h.resolvedAt).toISOString() : 'Unresolved',
        h.isOverdue ? 'YES' : 'NO',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=helpdesk_tickets_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  },
};
