import { Request, Response } from 'express';
import { Progress } from '../models/Progress';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { Badge } from '../models/Badge';
import { Notification } from '../models/Notification';
import { StudySession } from '../models/StudySession';
import { sendSuccess, sendError } from '../utils/responses';

export const getMyProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'unauthorized');
    }

    const progress = await Progress.find({ userId })
      .populate('courseId', 'title description thumbnailUrl')
      .sort({ lastAccessedAt: -1 });

    return sendSuccess(res, progress);
  } catch (error) {
    console.error('get progress error:', error);
    return sendError(res, 500, 'failed to fetch progress');
  }
};

export const getCourseProgress = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'unauthorized');
    }

    const progress = await Progress.findOne({ userId, courseId })
      .populate('courseId');

    if (!progress) {
      return sendError(res, 404, 'progress not found');
    }

    return sendSuccess(res, progress);
  } catch (error) {
    console.error('get course progress error:', error);
    return sendError(res, 500, 'failed to fetch course progress');
  }
};

export const markLessonComplete = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { timeSpent } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'unauthorized');
    }

    // find progress record (need to know which course)
    const progress = await Progress.findOne({
      userId,
      'completedLessons.lessonId': { $ne: lessonId },
    });

    if (!progress) {
      return sendError(res, 404, 'progress record not found');
    }

    // add to completed lessons
    progress.completedLessons.push({
      lessonId,
      completedAt: new Date(),
      timeSpent: timeSpent || 0,
    });

    // calculate new overall progress
    const course = await Course.findById(progress.courseId);
    let totalLessons = 0;
    course?.modules.forEach((m) => (totalLessons += m.lessons.length));
    progress.overallProgress = (progress.completedLessons.length / totalLessons) * 100;

    // update last accessed
    progress.lastAccessedAt = new Date();
    await progress.save();

    // update user study hours
    const minutes = timeSpent || 0;
    await User.findByIdAndUpdate(userId, {
      $inc: { studyHours: minutes / 60 },
    });

    // check for achievements
    await checkModuleCompletion(userId, progress.courseId.toString(), course!);

    return sendSuccess(res, progress, 'lesson marked as complete');
  } catch (error) {
    console.error('mark lesson complete error:', error);
    return sendError(res, 500, 'failed to mark lesson complete');
  }
};

export const getStudyStats = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'unauthorized');
    }

    const user = await User.findById(userId);
    const badges = await Badge.find({ userId });
    const sessions = await StudySession.find({ userId }).sort({ sessionDate: -1 }).limit(30);

    const stats = {
      points: user?.points || 0,
      studyHours: user?.studyHours || 0,
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      treeLevel: user?.treeLevel || 1,
      totalBadges: badges.filter((b) => b.type === 'badge').length,
      totalMedals: badges.filter((b) => b.type === 'medal').length,
      totalCertificates: badges.filter((b) => b.type === 'certificate').length,
      recentSessions: sessions,
      recentBadges: badges.slice(0, 5),
    };

    return sendSuccess(res, stats);
  } catch (error) {
    console.error('get stats error:', error);
    return sendError(res, 500, 'failed to fetch stats');
  }
};

// helper function to check and award module completion badge
const checkModuleCompletion = async (userId: string, courseId: string, course: any) => {
  try {
    const progress = await Progress.findOne({ userId, courseId });
    
    if (!progress) return;

    // check each module
    for (let i = 0; i < course.modules.length; i++) {
      const module = course.modules[i];
      const completedInModule = progress.completedLessons.filter((cl) =>
        module.lessons.some((l: any) => l.toString() === cl.lessonId.toString())
      );

      // if module complete and badge not awarded yet
      if (completedInModule.length === module.lessons.length) {
        const existingBadge = await Badge.findOne({
          userId,
          achievementType: 'module_complete',
          relatedId: courseId,
          name: `${module.title} complete`,
        });

        if (!existingBadge) {
          // award badge
          await Badge.create({
            userId,
            type: 'badge',
            name: `${module.title} complete`,
            description: `completed all lessons in ${module.title}`,
            achievementType: 'module_complete',
            relatedId: courseId,
            iconUrl: '/icons/module-badge.png',
          });

          // create notification
          await Notification.create({
            userId,
            type: 'achievement',
            title: 'new badge earned!',
            message: `you completed ${module.title}`,
          });

          // award points
          await User.findByIdAndUpdate(userId, {
            $inc: { points: 50 },
          });
        }
      }
    }

    // check if entire course complete
    let totalLessons = 0;
    course.modules.forEach((m: any) => (totalLessons += m.lessons.length));

    if (progress.completedLessons.length === totalLessons) {
      const existingMedal = await Badge.findOne({
        userId,
        achievementType: 'course_complete',
        relatedId: courseId,
      });

      if (!existingMedal) {
        await Badge.create({
          userId,
          type: 'medal',
          name: `${course.title} master`,
          description: `completed entire ${course.title} course`,
          achievementType: 'course_complete',
          relatedId: courseId,
          iconUrl: '/icons/course-medal.png',
        });

        await Notification.create({
          userId,
          type: 'achievement',
          title: 'course completed!',
          message: `you mastered ${course.title}`,
        });

        await User.findByIdAndUpdate(userId, {
          $inc: { points: 200 },
        });
      }
    }
  } catch (error) {
    console.error('check achievement error:', error);
  }
};
