import { Request, Response } from 'express';
import { Challenge } from '../models/Challenge';
import { Quiz } from '../models/Quiz';
import { Lesson } from '../models/Lesson';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { Badge } from '../models/Badge';
import { sendSuccess, sendError, sendCreated } from '../utils/responses';

export const getMyChallenges = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    const challenges = await Challenge.find({
      $or: [{ challengerId: userId }, { opponentId: userId }],
    })
      .populate('challengerId', 'name')
      .populate('opponentId', 'name')
      .populate('quizId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, challenges);
  } catch (error) {
    console.error('get challenges error:', error);
    return sendError(res, 500, 'failed to fetch challenges');
  }
};

export const createChallenge = async (req: Request, res: Response) => {
  try {
    const { opponentId, quizId } = req.body;
    const challengerId = req.session.userId;

    if (!opponentId || !quizId) {
      return sendError(res, 400, 'opponent and quiz are required');
    }

    const challenge = await Challenge.create({
      challengerId,
      opponentId,
      quizId,
      status: 'pending',
    });

    // notify opponent
    await Notification.create({
      userId: opponentId,
      type: 'challenge',
      title: 'new challenge!',
      message: 'you have been challenged to a quiz battle',
      relatedType: 'challenge',
      relatedId: challenge._id,
    });

    return sendCreated(res, challenge, 'challenge created successfully');
  } catch (error) {
    console.error('create challenge error:', error);
    return sendError(res, 500, 'failed to create challenge');
  }
};

export const acceptChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findByIdAndUpdate(
      id,
      { status: 'accepted' },
      { new: true }
    );

    if (!challenge) {
      return sendError(res, 404, 'challenge not found');
    }

    return sendSuccess(res, challenge, 'challenge accepted');
  } catch (error) {
    console.error('accept challenge error:', error);
    return sendError(res, 500, 'failed to accept challenge');
  }
};

export const declineChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findByIdAndUpdate(
      id,
      { status: 'declined' },
      { new: true }
    );

    if (!challenge) {
      return sendError(res, 404, 'challenge not found');
    }

    return sendSuccess(res, challenge, 'challenge declined');
  } catch (error) {
    console.error('decline challenge error:', error);
    return sendError(res, 500, 'failed to decline challenge');
  }
};

export const submitChallengeResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score } = req.body;
    const userId = req.session.userId;

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return sendError(res, 404, 'challenge not found');
    }

    // determine if challenger or opponent
    const isChallenger = challenge.challengerId.toString() === userId;
    const updateField = isChallenger ? 'challengerScore' : 'opponentScore';

    const updated = await Challenge.findByIdAndUpdate(
      id,
      { [updateField]: score },
      { new: true }
    );

    // check if both completed
    if (updated!.challengerScore !== undefined && updated!.opponentScore !== undefined) {
      const winnerId =
        updated!.challengerScore > updated!.opponentScore
          ? updated!.challengerId
          : updated!.opponentId;

      await Challenge.findByIdAndUpdate(id, {
        status: 'completed',
        winnerId,
        completedAt: new Date(),
      });

      // notify both users
      await Notification.create({
        userId: updated!.challengerId,
        type: 'challenge',
        title: 'challenge completed!',
        message: 'check the results',
        relatedType: 'challenge',
        relatedId: id,
      });

      await Notification.create({
        userId: updated!.opponentId,
        type: 'challenge',
        title: 'challenge completed!',
        message: 'check the results',
        relatedType: 'challenge',
        relatedId: id,
      });

      // award points to winner
      await User.findByIdAndUpdate(winnerId, {
        $inc: { points: 30 },
      });
    }

    return sendSuccess(res, updated, 'result submitted');
  } catch (error) {
    console.error('submit result error:', error);
    return sendError(res, 500, 'failed to submit result');
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const topUsers = await User.find({ role: 'student' })
      .select('name points studyHours currentStreak')
      .sort({ points: -1 })
      .limit(10);

    return sendSuccess(res, topUsers);
  } catch (error) {
    console.error('get leaderboard error:', error);
    return sendError(res, 500, 'failed to fetch leaderboard');
  }
};
