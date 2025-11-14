import api from './api';

export const achievementService = {
  /**
   * Get all achievements with user's earned status
   */
  async getUserAchievements() {
    const response = await api.get('/achievements');
    return response.data.data;
  },
};
