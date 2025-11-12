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

export const getNextLesson = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'unauthorized');
    }

    const progress = await Progress.findOne({ userId, courseId });
    const course = await Course.findById(courseId).populate('modules.lessons');

    if (!course) {
      return sendError(res, 404, 'course not found');
    }

    // If no progress, start with first lesson
    if (!progress || progress.completedLessons.length === 0) {
      if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
        const firstLessonId = course.modules[0].lessons[0];
        return sendSuccess(res, { 
          lessonId: firstLessonId,
          moduleIndex: 0,
          lessonIndex: 0,
        });
      }
      return sendError(res, 404, 'no lessons found in course');
    }

    // Find first incomplete lesson
    const completedLessonIds = progress.completedLessons.map(cl => cl.lessonId);
    
    for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
      const module = course.modules[moduleIndex];
      for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
        const lessonId = module.lessons[lessonIndex].toString();
        if (!completedLessonIds.includes(lessonId)) {
          return sendSuccess(res, {
            lessonId,
            moduleIndex,
            lessonIndex,
          });
        }
      }
    }

    // All lessons complete - return last lesson
    const lastModule = course.modules[course.modules.length - 1];
    const lastLessonId = lastModule.lessons[lastModule.lessons.length - 1];
    return sendSuccess(res, {
      lessonId: lastLessonId,
      moduleIndex: course.modules.length - 1,
      lessonIndex: lastModule.lessons.length - 1,
      allComplete: true,
    });
  } catch (error) {
    console.error('get next lesson error:', error);
    return sendError(res, 500, 'failed to get next lesson');
  }
};

export const updateLessonProgress = async (req: Request, res: Response) => {
  try {
    const { courseId, lessonId } = req.params;
    const { timeSpent } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'unauthorized');
    }

    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      return sendError(res, 404, 'not enrolled in this course');
    }

    // Check if already completed
    const alreadyCompleted = progress.completedLessons.some(
      cl => cl.lessonId === lessonId
    );

    if (!alreadyCompleted) {
      progress.completedLessons.push({
        lessonId,
        completedAt: new Date(),
        timeSpent: timeSpent || 0,
      });

      // Calculate overall progress
      const course = await Course.findById(courseId);
      let totalLessons = 0;
      course?.modules.forEach(m => totalLessons += m.lessons.length);
      progress.overallProgress = Math.round((progress.completedLessons.length / totalLessons) * 100);

      progress.lastAccessedAt = new Date();
      await progress.save();

      // Update user study hours
      const minutes = timeSpent || 0;
      await User.findByIdAndUpdate(userId, {
        $inc: { studyHours: minutes / 60, points: 10 },
      });

      // Check for achievements
      await checkModuleCompletion(userId, courseId, course!);
    }

    return sendSuccess(res, progress, 'lesson progress updated');
  } catch (error) {
    console.error('update lesson progress error:', error);
    return sendError(res, 500, 'failed to update lesson progress');
  }
};

// Save video progress (timestamp)
export const saveVideoProgress = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { currentTime } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'unauthorized');
    }

    if (currentTime === undefined || currentTime < 0) {
      return sendError(res, 400, 'invalid current time');
    }

    // Find progress record for this user's course containing this lesson
    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return sendError(res, 404, 'progress record not found');
    }

    // Check if video progress for this lesson already exists
    const existingIndex = progress.videoProgress.findIndex(
      vp => vp.lessonId === lessonId
    );

    if (existingIndex !== -1) {
      // Update existing
      progress.videoProgress[existingIndex].currentTime = currentTime;
      progress.videoProgress[existingIndex].lastUpdated = new Date();
    } else {
      // Add new
      progress.videoProgress.push({
        lessonId,
        currentTime,
        lastUpdated: new Date(),
      });
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    return sendSuccess(res, { currentTime, lessonId }, 'video progress saved');
  } catch (error) {
    console.error('save video progress error:', error);
    return sendError(res, 500, 'failed to save video progress');
  }
};

// Get video progress for a specific lesson
export const getVideoProgress = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return sendError(res, 401, 'unauthorized');
    }

    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return sendSuccess(res, { currentTime: 0 });
    }

    const videoProgress = progress.videoProgress.find(
      vp => vp.lessonId === lessonId
    );

    if (!videoProgress) {
      return sendSuccess(res, { currentTime: 0 });
    }

    return sendSuccess(res, {
      currentTime: videoProgress.currentTime,
      lastUpdated: videoProgress.lastUpdated,
    });
  } catch (error) {
    console.error('get video progress error:', error);
    return sendError(res, 500, 'failed to get video progress');
  }
};
