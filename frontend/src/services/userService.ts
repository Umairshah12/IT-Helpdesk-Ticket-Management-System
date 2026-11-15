import { api } from './api';
import { ApiResponse, Role, User, UserStatus } from '../types';

export const userService = {
  async getUsers(params: {
    role?: Role;
    status?: UserStatus;
    departmentId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<User[]>> {
    const res = await api.get('/users', { params });
    return res.data;
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  async createUser(userData: {
    email: string;
    fullName: string;
    employeeId: string;
    password?: string;
    role: Role;
    departmentId?: string;
    designation?: string;
    phone?: string;
  }): Promise<ApiResponse<User>> {
    const res = await api.post('/users', userData);
    return res.data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    const res = await api.put(`/users/${id}`, userData);
    return res.data;
  },

  async updateStatus(id: string, status: UserStatus): Promise<ApiResponse<User>> {
    const res = await api.patch(`/users/${id}/status`, { status });
    return res.data;
  },

  async updateRole(id: string, role: Role): Promise<ApiResponse<User>> {
    const res = await api.patch(`/users/${id}/role`, { role });
    return res.data;
  },

  async getTechnicians(): Promise<ApiResponse<User[]>> {
    const res = await api.get('/technicians');
    return res.data;
  },
};

