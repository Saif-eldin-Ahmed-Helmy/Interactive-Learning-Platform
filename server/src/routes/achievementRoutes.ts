import express from 'express';
import { requireAuth } from '../middleware/auth';
import { getUserAchievements } from '../controllers/achievementController';

const router = express.Router();

// Get user's achievements with earned status
router.get('/', requireAuth, getUserAchievements);

export default router;
