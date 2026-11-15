import { api } from './api';
import { ApiResponse, Department } from '../types';

export const departmentService = {
  async getDepartments(): Promise<ApiResponse<Department[]>> {
    const res = await api.get('/departments');
    return res.data;
  },

  async getDepartmentById(id: string): Promise<ApiResponse<Department>> {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },

  async createDepartment(data: {
    name: string;
    code: string;
    description?: string;
    managerId?: string;
  }): Promise<ApiResponse<Department>> {
    const res = await api.post('/departments', data);
    return res.data;
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<ApiResponse<Department>> {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },

  async deleteDepartment(id: string): Promise<ApiResponse<null>> {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },
};

