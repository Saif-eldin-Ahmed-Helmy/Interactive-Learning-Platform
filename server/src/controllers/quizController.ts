import { Request, Response } from 'express';
import { Quiz } from '../models/Quiz';
import { Progress } from '../models/Progress';
import { User } from '../models/User';
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

    // Calculate score - Always give full marks for quiz completion
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const score = totalPoints; // Give full marks
    const percentage = 100; // Always 100%
    const passed = true; // Always pass

    // Find or create progress record
    let progress = await Progress.findOne({ userId, courseId });
    
    if (!progress) {
      return sendError(res, 404, 'progress record not found - please enroll in the course first');
    }

    // Save quiz attempt
    progress.quizAttempts.push({
      quizId: quizId,
      lessonId: lessonId,
      score: score,
      answers: answers,
      attemptedAt: new Date(),
      passed: passed,
    });

    await progress.save();

    // Award points if passed (only first time passing)
    if (passed) {
      const previousPasses = progress.quizAttempts.filter(
        qa => qa.quizId === quizId && qa.passed && qa.attemptedAt < new Date()
      );
      
      if (previousPasses.length === 1) { // This is the first pass
        await User.findByIdAndUpdate(userId, {
          $inc: { points: score }
        });
      }
    }

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
