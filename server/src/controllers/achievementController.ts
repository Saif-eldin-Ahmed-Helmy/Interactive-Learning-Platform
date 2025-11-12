import { Request, Response } from 'express';
import { Achievement } from '../models/Achievement';
import { Badge } from '../models/Badge';
import { Progress } from '../models/Progress';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/responses';

/**
 * Get all achievements with user's earned status
 * GET /api/users/achievements
 */
export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'User not authenticated');
    }

    // Fetch all achievement templates
    const achievementTemplates = await Achievement.find().sort({ category: 1, points: 1 });

    // Fetch user's earned badges
    const earnedBadges = await Badge.find({ userId });

    // Fetch user's progress data for calculating achievement status
    const user = await User.findById(userId);
    const progress = await Progress.find({ userId });

    // Calculate stats
    const completedLessons = progress.reduce((total, prog) => {
      return total + prog.completedLessons.length;
    }, 0);

    const completedCourses = progress.filter((prog) => prog.overallProgress === 100).length;

    // Map achievements with earned status
    const achievementsWithStatus = achievementTemplates.map((achievement) => {
      // Check if user has earned this achievement
      const earnedBadge = earnedBadges.find(
        (badge) => badge.name === achievement.name
      );

      let earned = false;
      let progress_value = 0;

      // Calculate progress based on requirement type
      if (!earnedBadge) {
        switch (achievement.requirement.type) {
          case 'lesson_count':
          case 'lesson_complete':
            progress_value = completedLessons;
            earned = completedLessons >= achievement.requirement.value;
            break;

          case 'course_count':
          case 'course_complete':
            progress_value = completedCourses;
            earned = completedCourses >= achievement.requirement.value;
            break;

          case 'all_courses':
            // TODO: Get total courses count and compare
            progress_value = completedCourses;
            earned = false; // Will implement when we know total courses
            break;

          case 'streak':
            progress_value = user?.currentStreak || 0;
            earned = (user?.currentStreak || 0) >= achievement.requirement.value;
            break;

          default:
            earned = false;
        }
      } else {
        earned = true;
        progress_value = achievement.requirement.value;
      }

      return {
        _id: achievement._id,
        name: achievement.name,
        description: achievement.description,
        iconUrl: achievement.iconUrl,
        category: achievement.category,
        requirement: achievement.requirement,
        points: achievement.points,
        earned,
        earnedAt: earnedBadge?.earnedAt || null,
        progress: {
          current: progress_value,
          required: achievement.requirement.value,
        },
      };
    });

    // Group by category
    const grouped = achievementsWithStatus.reduce((acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(achievement);
      return acc;
    }, {} as Record<string, typeof achievementsWithStatus>);

    return sendSuccess(res, {
      achievements: achievementsWithStatus,
      grouped,
      stats: {
        total: achievementsWithStatus.length,
        earned: achievementsWithStatus.filter((a) => a.earned).length,
        locked: achievementsWithStatus.filter((a) => !a.earned).length,
      },
    });
  } catch (error: any) {
    console.error('get user achievements error:', error);
    return sendError(res, 500, error.message || 'Failed to fetch achievements');
  }
};
