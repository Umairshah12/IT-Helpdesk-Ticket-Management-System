import { api } from './api';
import { ApiResponse, Ticket, TicketPriority, TicketStatus } from '../types';

export interface TicketFilterParams {
  search?: string;
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  categoryId?: string;
  departmentId?: string;
  assigneeId?: string;
  requesterId?: string;
  isOverdue?: boolean;
  myTickets?: boolean | string;
  dateRange?: string; // 'today' | '7days' | '30days' | '90days' | 'year' | 'custom'
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const ticketService = {
  async getTickets(params: TicketFilterParams = {}): Promise<ApiResponse<Ticket[]>> {
    const res = await api.get('/tickets', { params });
    return res.data;
  },

  async getTicketById(id: string): Promise<ApiResponse<Ticket>> {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  },

  async createTicket(payload: {
    title: string;
    description: string;
    categoryId: string;
    priority: TicketPriority;
    departmentId?: string;
    location?: string;
    assigneeId?: string;
  }): Promise<ApiResponse<Ticket>> {
    const res = await api.post('/tickets', payload);
    return res.data;
  },

  async updateTicket(id: string, payload: Partial<Ticket>): Promise<ApiResponse<Ticket>> {
    const res = await api.put(`/tickets/${id}`, payload);
    return res.data;
  },

  async updateStatus(id: string, status: TicketStatus, note?: string): Promise<ApiResponse<Ticket>> {
    const res = await api.patch(`/tickets/${id}/status`, { status, note });
    return res.data;
  },

  async updatePriority(id: string, priority: TicketPriority, note?: string): Promise<ApiResponse<Ticket>> {
    const res = await api.patch(`/tickets/${id}/priority`, { priority, note });
    return res.data;
  },

  async assignTicket(id: string, assigneeId: string | null, reason?: string): Promise<ApiResponse<Ticket>> {
    const res = await api.patch(`/tickets/${id}/assign`, { assigneeId, reason });
    return res.data;
  },

  async addComment(id: string, data: { content: string; isInternal?: boolean }): Promise<ApiResponse<Ticket>> {
    const res = await api.post(`/tickets/${id}/comments`, data);
    return res.data;
  },

  async uploadAttachment(ticketId: string, file: File): Promise<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async resolveTicket(id: string, resolutionNote: string): Promise<ApiResponse<Ticket>> {
    const res = await api.patch(`/tickets/${id}/resolve`, { resolutionNote });
    return res.data;
  },

  async reopenTicket(id: string, reason: string): Promise<ApiResponse<Ticket>> {
    const res = await api.patch(`/tickets/${id}/reopen`, { reason });
    return res.data;
  },

  async rateTicket(id: string, data: { rating: number; feedback?: string }): Promise<ApiResponse<Ticket>> {
    const res = await api.post(`/tickets/${id}/rate`, data);
    return res.data;
  },

  async exportCsv(params: TicketFilterParams = {}): Promise<Blob> {
    const res = await api.get('/tickets/export/csv', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};
