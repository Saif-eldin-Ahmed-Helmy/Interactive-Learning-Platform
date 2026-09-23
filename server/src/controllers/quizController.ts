import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Quiz } from '../models/Quiz';
import { Progress } from '../models/Progress';
import { User } from '../models/User';
import { Lesson } from '../models/Lesson';
import { gradeQuiz } from '../utils/gradeQuiz';
import { sendSuccess, sendError } from '../utils/responses';

export const getQuizByLessonId = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'unauthorized');
    }

    const quiz = await Quiz.findOne({ lessonId });

    if (!quiz) {
      return sendError(res, 404, 'quiz not found for this lesson');
    }

    return sendSuccess(res, quiz);
  } catch (error) {
    console.error('get quiz error:', error);
    return sendError(res, 500, 'failed to fetch quiz');
  }
};

export const submitQuizAttempt = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const { answers, lessonId, courseId } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'unauthorized');
    }

    if (!answers || !Array.isArray(answers)) {
      return sendError(res, 400, 'invalid answers format');
    }

    // Fetch quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return sendError(res, 404, 'quiz not found');
    }

    const lesson = await Lesson.findById(quiz.lessonId);
    if (!lesson || String(lesson._id) !== lessonId || String(lesson.courseId) !== courseId) {
      return sendError(res, 400, 'quiz does not belong to this lesson and course');
    }
    let result;
    try {
      result = gradeQuiz(quiz.questions, answers, quiz.passingScore);
    } catch (error) {
      return sendError(res, 400, (error as Error).message);
    }
    const { score, totalPoints, percentage, passed } = result;

    // Find or create progress record
    let progress = await Progress.findOne({ userId, courseId });
    
    if (!progress) {
      return sendError(res, 404, 'progress record not found - please enroll in the course first');
    }

    const attempt = { quizId, lessonId, score, answers, attemptedAt: new Date(), passed };
    await mongoose.connection.transaction(async session => {
      // Atomically claim the first pass to prevent concurrent duplicate rewards.
      const firstPass = passed && await Progress.findOneAndUpdate(
        { _id: progress._id, quizAttempts: { $not: { $elemMatch: { quizId, passed: true } } } },
        { $push: { quizAttempts: attempt } },
        { new: true, session }
      );
      if (firstPass) {
        await User.findByIdAndUpdate(userId, { $inc: { points: score } }, { session });
      } else {
        await Progress.updateOne({ _id: progress._id }, { $push: { quizAttempts: attempt } }, { session });
      }

    });

    return sendSuccess(res, {
      score,
      totalPoints,
      percentage,
      passed,
      passingScore: quiz.passingScore,
      message: passed ? 'Congratulations! You passed!' : 'Keep trying! You can do it!'
    });
  } catch (error) {
    console.error('submit quiz error:', error);
    return sendError(res, 500, 'failed to submit quiz attempt');
  }
};
