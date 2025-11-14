import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getQuizByLessonId, submitQuizAttempt } from '../controllers/quizController';

const router = Router();

router.get('/lesson/:lessonId', requireAuth, getQuizByLessonId);
router.post('/:quizId/submit', requireAuth, submitQuizAttempt);

export default router;
