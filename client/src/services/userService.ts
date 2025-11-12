import api from './api';

export const userService = {
  /**
   * Get user profile with stats
   */
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data.data;
  },

  /**
   * Update user name
   */
  async updateName(name: string) {
    const response = await api.put('/users/profile/name', { name });
    return response.data.data;
  },
};
