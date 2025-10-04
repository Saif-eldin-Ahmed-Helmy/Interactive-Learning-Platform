import { Request, Response } from 'express';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Badge } from '../models/Badge';
import { Progress } from '../models/Progress';
import { sendSuccess, sendError } from '../utils/responses';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, users);
  } catch (error) {
    console.error('get users error:', error);
    return sendError(res, 500, 'failed to fetch users');
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return sendError(res, 400, 'invalid role');
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');

    if (!user) {
      return sendError(res, 404, 'user not found');
    }

    return sendSuccess(res, user, 'user role updated');
  } catch (error) {
    console.error('update role error:', error);
    return sendError(res, 500, 'failed to update role');
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return sendError(res, 404, 'user not found');
    }

    // cleanup user data
    await Progress.deleteMany({ userId: id });
    await Badge.deleteMany({ userId: id });

    return sendSuccess(res, null, 'user deleted successfully');
  } catch (error) {
    console.error('delete user error:', error);
    return sendError(res, 500, 'failed to delete user');
  }
};

export const getPendingCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find({ isPublished: false })
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, courses);
  } catch (error) {
    console.error('get pending courses error:', error);
    return sendError(res, 500, 'failed to fetch pending courses');
  }
};

export const approveCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(id, { isPublished: true }, { new: true });

    if (!course) {
      return sendError(res, 404, 'course not found');
    }

    return sendSuccess(res, course, 'course approved');
  } catch (error) {
    console.error('approve course error:', error);
    return sendError(res, 500, 'failed to approve course');
  }
};

export const getPlatformAnalytics = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalBadgesAwarded = await Badge.countDocuments();

    const analytics = {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      publishedCourses,
      pendingCourses: totalCourses - publishedCourses,
      totalBadgesAwarded,
    };

    return sendSuccess(res, analytics);
  } catch (error) {
    console.error('get analytics error:', error);
    return sendError(res, 500, 'failed to fetch analytics');
  }
};
