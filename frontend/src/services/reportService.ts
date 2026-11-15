import { api } from './api';
import { ApiResponse, DashboardStats } from '../types';

export const reportService = {
  async getDashboardStats(dateRange?: string): Promise<ApiResponse<DashboardStats>> {
    const res = await api.get('/reports/dashboard', { params: { dateRange } });
    return res.data;
  },

  async getTicketTrends(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<ApiResponse<Array<{
    label: string;
    created: number;
    resolved: number;
    closed: number;
  }>>> {
    const res = await api.get('/reports/tickets/trends', { params: { period } });
    return res.data;
  },

  async getDepartmentReports(): Promise<ApiResponse<Array<{
    departmentName: string;
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    slaCompliance: number;
  }>>> {
    const res = await api.get('/reports/departments');
    return res.data;
  },

  async getTechnicianReports(): Promise<ApiResponse<Array<{
    id: string;
    fullName: string;
    email: string;
    assignedCount: number;
    resolvedCount: number;
    avgResolutionHours: number;
    ratingAverage: number;
  }>>> {
    const res = await api.get('/reports/technicians');
    return res.data;
  },
};

