import { Router } from 'express';
import {
  getAllUsers,
  searchUsers,
  updateUserRole,
  updateUser,
  deleteUser,
  getPendingCourses,
  approveCourse,
  getPlatformAnalytics,
  populateCourses,
  seedAchievements,
  populateQuizzes,
  syncQuizIdsToLessons,
} from '../controllers/adminController';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';

const router = Router();

router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.get('/users/search', requireAuth, requireAdmin, searchUsers);
router.put('/users/:id/role', requireAuth, requireAdmin, updateUserRole);
router.put('/users/:id', requireAuth, requireAdmin, updateUser);
router.delete('/users/:id', requireAuth, requireAdmin, deleteUser);
router.get('/courses/pending', requireAuth, requireAdmin, getPendingCourses);
router.put('/courses/:id/approve', requireAuth, requireAdmin, approveCourse);
router.post('/courses/populate', requireAuth, requireAdmin, populateCourses);
router.post('/seed/achievements', requireAuth, requireAdmin, seedAchievements);
router.post('/seed/quizzes', requireAuth, requireAdmin, populateQuizzes);
router.post('/sync/quiz-ids', requireAuth, requireAdmin, syncQuizIdsToLessons);
router.get('/analytics', requireAuth, requireAdmin, getPlatformAnalytics);

export default router;
