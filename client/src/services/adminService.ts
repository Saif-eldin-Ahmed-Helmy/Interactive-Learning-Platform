import api from './api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  points: number;
  studyHours: number;
  currentStreak: number;
  createdAt: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'student' | 'teacher' | 'admin';
}

export const adminService = {
  async searchUsers(query: string) {
    const response = await api.get(`/admin/users/search?query=${encodeURIComponent(query)}`);
    return response.data.data as User[];
  },

  async getAllUsers() {
    const response = await api.get('/admin/users');
    return response.data.data as User[];
  },

  async updateUser(userId: string, data: UpdateUserData) {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data.data as User;
  },

  async updateUserRole(userId: string, role: 'student' | 'teacher' | 'admin') {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data.data as User;
  },

  async deleteUser(userId: string) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async getPendingCourses() {
    const response = await api.get('/admin/courses/pending');
    return response.data.data;
  },

  async approveCourse(courseId: string) {
    const response = await api.put(`/admin/courses/${courseId}/approve`);
    return response.data.data;
  },

  async getPlatformAnalytics() {
    const response = await api.get('/admin/analytics');
    return response.data.data;
  },
};
