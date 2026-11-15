import { api } from './api';
import { ApiResponse, TicketCategory, TicketPriority } from '../types';

export const categoryService = {
  async getCategories(): Promise<ApiResponse<TicketCategory[]>> {
    const res = await api.get('/categories');
    return res.data;
  },

  async createCategory(data: {
    name: string;
    code: string;
    description?: string;
    defaultPriority: TicketPriority;
  }): Promise<ApiResponse<TicketCategory>> {
    const res = await api.post('/categories', data);
    return res.data;
  },

  async updateCategory(id: string, data: Partial<TicketCategory>): Promise<ApiResponse<TicketCategory>> {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

