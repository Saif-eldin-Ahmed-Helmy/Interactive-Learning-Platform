import { Router } from 'express';
import {
  getMyChallenges,
  createChallenge,
  acceptChallenge,
  declineChallenge,
  submitChallengeResult,
  getLeaderboard,
} from '../controllers/challengeController';
import { requireAuth } from '../middleware/auth';
import { requireStudent } from '../middleware/roleCheck';

const router = Router();

router.get('/', requireAuth, requireStudent, getMyChallenges);
router.post('/create', requireAuth, requireStudent, createChallenge);
router.post('/:id/accept', requireAuth, requireStudent, acceptChallenge);
router.post('/:id/decline', requireAuth, requireStudent, declineChallenge);
router.post('/:id/submit', requireAuth, requireStudent, submitChallengeResult);
router.get('/leaderboard', requireAuth, getLeaderboard);

export default router;
