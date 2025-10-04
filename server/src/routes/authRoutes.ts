import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController';
import { registerValidation, loginValidation } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);

export default router;
