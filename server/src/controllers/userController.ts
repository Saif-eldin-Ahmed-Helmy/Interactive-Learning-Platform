import { Request, Response } from 'express';
import { User } from '../models/User';
import { Badge } from '../models/Badge';
import { Progress } from '../models/Progress';
import { sendSuccess, sendError } from '../utils/responses';

/**
 * Get user profile with all stats
 * GET /api/users/profile
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'User not authenticated');
    }

    // Fetch user data
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Fetch earned badges
    const badges = await Badge.find({ userId, earned: true }).limit(6);

    // Count completed courses
    const completedCourses = await Progress.countDocuments({
      userId,
      overallProgress: 100,
    });

    return sendSuccess(res, {
      user: {
        name: user.name,
        email: user.email,
        enrolledDate: user.createdAt,
        treeLevel: user.treeLevel,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        studyHours: user.studyHours,
        points: user.points,
      },
      badges,
      completedCourses,
    });
  } catch (error: any) {
    return sendError(res, 500, error.message || 'Failed to fetch profile');
  }
};

/**
 * Update user name
 * PUT /api/users/profile/name
 */
export const updateUserName = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { name } = req.body;

    if (!userId) {
      return sendError(res, 401, 'User not authenticated');
    }

    if (!name || name.trim().length === 0) {
      return sendError(res, 400, 'Name is required');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    ).select('name');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, { name: user.name });
  } catch (error: any) {
    return sendError(res, 500, error.message || 'Failed to update name');
  }
};
