import express from 'express';
import { requireAuth } from '../middleware/auth';
import { getUserProfile, updateUserName } from '../controllers/userController';

const router = express.Router();

// Get user profile with stats
router.get('/profile', requireAuth, getUserProfile);

// Update user name
router.put('/profile/name', requireAuth, updateUserName);

export default router;
