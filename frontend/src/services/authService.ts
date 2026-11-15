import { api } from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<{ resetToken?: string }>> {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data: { token: string; newPassword: string }): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<null>> {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },
};

