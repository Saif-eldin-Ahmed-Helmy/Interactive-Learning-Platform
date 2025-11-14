import { Router } from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getEnrolledCourses,
} from '../controllers/courseController';
import { requireAuth } from '../middleware/auth';
import { requireTeacher, requireAdmin, requireStudent } from '../middleware/roleCheck';
import { courseValidation } from '../middleware/validation';

const router = Router();

router.get('/', requireAuth, getAllCourses);
router.get('/enrolled', requireAuth, getEnrolledCourses);
router.get('/:id', requireAuth, getCourseById);
router.post('/', requireAuth, requireTeacher, courseValidation, createCourse);
router.put('/:id', requireAuth, requireTeacher, updateCourse);
router.delete('/:id', requireAuth, requireAdmin, deleteCourse);
router.post('/:id/enroll', requireAuth, requireStudent, enrollInCourse);
router.delete('/:id/enroll', requireAuth, requireStudent, unenrollFromCourse);

export default router;
