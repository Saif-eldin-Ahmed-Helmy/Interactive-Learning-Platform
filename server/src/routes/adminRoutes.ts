import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getPendingCourses,
  approveCourse,
  getPlatformAnalytics,
} from '../controllers/adminController';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';

const router = Router();

router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.put('/users/:id', requireAuth, requireAdmin, updateUserRole);
router.delete('/users/:id', requireAuth, requireAdmin, deleteUser);
router.get('/courses/pending', requireAuth, requireAdmin, getPendingCourses);
router.put('/courses/:id/approve', requireAuth, requireAdmin, approveCourse);
router.get('/analytics', requireAuth, requireAdmin, getPlatformAnalytics);

export default router;
