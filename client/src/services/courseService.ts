import api from './api';
import { Course } from '../types';

export const courseService = {
  async getAllCourses() {
    const response = await api.get('/courses');
    return response.data.data as Course[];
  },

  async getCourseById(id: string) {
    const response = await api.get(`/courses/${id}`);
    return response.data.data as Course;
  },

  async createCourse(data: Partial<Course>) {
    const response = await api.post('/courses', data);
    return response.data.data as Course;
  },

  async enrollInCourse(courseId: string) {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  async unenrollFromCourse(courseId: string) {
    const response = await api.delete(`/courses/${courseId}/enroll`);
    return response.data;
  },

  async getEnrolledCourses() {
    const response = await api.get('/courses/enrolled');
    return response.data.data as Course[];
  },
};
