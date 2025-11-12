import { Router } from 'express';
import {
  getMyProgress,
  getCourseProgress,
  markLessonComplete,
  getStudyStats,
  getNextLesson,
  updateLessonProgress,
  saveVideoProgress,
  getVideoProgress,
} from '../controllers/progressController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/my-progress', requireAuth, getMyProgress);
router.get('/course/:courseId', requireAuth, getCourseProgress);
router.get('/course/:courseId/next-lesson', requireAuth, getNextLesson);
router.post('/lesson/:lessonId/complete', requireAuth, markLessonComplete);
router.post('/course/:courseId/lesson/:lessonId/progress', requireAuth, updateLessonProgress);
router.get('/stats', requireAuth, getStudyStats);

// Video progress endpoints
router.post('/video/:lessonId/save', requireAuth, saveVideoProgress);
router.get('/video/:lessonId', requireAuth, getVideoProgress);

export default router;
