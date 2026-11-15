import { api } from './api';
import { ApiResponse, SLAPolicy, TicketPriority } from '../types';

export const slaService = {
  async getPolicies(): Promise<ApiResponse<SLAPolicy[]>> {
    const res = await api.get('/sla/policies');
    return res.data;
  },

  async createPolicy(data: {
    name: string;
    priority: TicketPriority;
    responseTimeMinutes: number;
    resolutionTimeMinutes: number;
    isBusinessHoursOnly: boolean;
    description?: string;
  }): Promise<ApiResponse<SLAPolicy>> {
    const res = await api.post('/sla/policies', data);
    return res.data;
  },

  async updatePolicy(id: string, data: Partial<SLAPolicy>): Promise<ApiResponse<SLAPolicy>> {
    const res = await api.put(`/sla/policies/${id}`, data);
    return res.data;
  },

  async getSLACompliance(): Promise<ApiResponse<{
    complianceRate: number;
    totalEvaluated: number;
    breachedCount: number;
    nearBreachCount: number;
  }>> {
    const res = await api.get('/sla/compliance');
    return res.data;
  },
};

