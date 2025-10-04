import api from './api';
import { User } from '../types';

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher';
  }) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data as User;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.data as User;
  },
};
