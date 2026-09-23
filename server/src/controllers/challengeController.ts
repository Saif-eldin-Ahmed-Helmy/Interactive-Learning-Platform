import { Request, Response } from 'express';
import { Challenge } from '../models/Challenge';
import { Quiz } from '../models/Quiz';
import { Lesson } from '../models/Lesson';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { Badge } from '../models/Badge';
import { gradeQuiz } from '../utils/gradeQuiz';
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

    if (opponentId === challengerId) return sendError(res, 400, 'choose another participant');

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

    const challenge = await Challenge.findOneAndUpdate(
      { _id: id, opponentId: req.session.userId, status: 'pending' },
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

    const challenge = await Challenge.findOneAndUpdate(
      { _id: id, opponentId: req.session.userId, status: 'pending' },
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
    const { answers } = req.body;
    const userId = req.session.userId;

    const challenge = await Challenge.findOne({
      _id: id,
      status: 'accepted',
      $or: [{ challengerId: userId }, { opponentId: userId }],
    });

    if (!challenge) {
      return sendError(res, 404, 'active challenge not found');
    }

    const quiz = await Quiz.findById(challenge.quizId);
    if (!quiz) return sendError(res, 404, 'quiz not found');
    let score;
    try {
      score = gradeQuiz(quiz.questions, answers, quiz.passingScore).percentage;
    } catch (error) {
      return sendError(res, 400, (error as Error).message);
    }

    const isChallenger = challenge.challengerId.toString() === userId;
    const updateField = isChallenger ? 'challengerScore' : 'opponentScore';

    const updated = await Challenge.findOneAndUpdate(
      { _id: id, status: 'accepted', [updateField]: { $exists: false } },
      { [updateField]: score },
      { new: true }
    );

    if (!updated) {
      return sendError(res, 409, 'result already submitted or challenge completed');
    }

    // check if both completed
    if (updated!.challengerScore !== undefined && updated!.opponentScore !== undefined) {
      const winnerId =
        updated!.challengerScore === updated!.opponentScore ? null :
        updated!.challengerScore > updated!.opponentScore
          ? updated!.challengerId
          : updated!.opponentId;

      const completed = await Challenge.findOneAndUpdate(
        { _id: id, status: 'accepted' },
        { status: 'completed', winnerId, completedAt: new Date() },
        { new: true }
      );

      if (!completed) return sendSuccess(res, updated, 'result submitted');

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
      if (winnerId) await User.findByIdAndUpdate(winnerId, {
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
