import api from './api';

export const quizService = {
  async getQuizByLessonId(lessonId: string) {
    const response = await api.get(`/quiz/lesson/${lessonId}`);
    return response.data.data;
  },

  async submitQuizAttempt(quizId: string, answers: number[], lessonId: string, courseId: string) {
    const response = await api.post(`/quiz/${quizId}/submit`, {
      answers,
      lessonId,
      courseId,
    });
    return response.data.data;
  },
};
