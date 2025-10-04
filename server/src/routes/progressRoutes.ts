import { Router } from 'express';
import {
  getMyProgress,
  getCourseProgress,
  markLessonComplete,
  getStudyStats,
} from '../controllers/progressController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/my-progress', requireAuth, getMyProgress);
router.get('/course/:courseId', requireAuth, getCourseProgress);
router.post('/lesson/:lessonId/complete', requireAuth, markLessonComplete);
router.get('/stats', requireAuth, getStudyStats);

export default router;
