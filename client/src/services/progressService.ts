import api from './api';
import { Progress, StudyStats } from '../types';

export const progressService = {
  async getMyProgress() {
    const response = await api.get('/progress/my-progress');
    return response.data.data as Progress[];
  },

  async getCourseProgress(courseId: string) {
    const response = await api.get(`/progress/course/${courseId}`);
    return response.data.data as Progress;
  },

  async markLessonComplete(lessonId: string, timeSpent: number) {
    const response = await api.post(`/progress/lesson/${lessonId}/complete`, {
      timeSpent,
    });
    return response.data;
  },

  async getStudyStats() {
    const response = await api.get('/progress/stats');
    return response.data.data as StudyStats;
  },
};
