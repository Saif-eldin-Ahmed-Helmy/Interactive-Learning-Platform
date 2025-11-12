import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { Progress } from '../models/Progress';
import { sendSuccess, sendError, sendCreated } from '../utils/responses';

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    // students see only published courses, teachers/admins see all
    const filter = req.session.userRole === 'student' ? { isPublished: true } : {};
    
    const courses = await Course.find(filter)
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, courses);
  } catch (error) {
    console.error('get courses error:', error);
    return sendError(res, 500, 'failed to fetch courses');
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('creatorId', 'name email')
      .populate('modules.lessons');

    if (!course) {
      return sendError(res, 404, 'course not found');
    }

    return sendSuccess(res, course);
  } catch (error) {
    console.error('get course error:', error);
    return sendError(res, 500, 'failed to fetch course');
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'validation failed', errors.array());
    }

    const { title, description, category, difficulty, estimatedHours } = req.body;
    const creatorId = req.session.userId;

    const course = await Course.create({
      title,
      description,
      category,
      difficulty,
      estimatedHours: estimatedHours || 0,
      creatorId,
      modules: [],
    });

    return sendCreated(res, course, 'course created successfully');
  } catch (error) {
    console.error('create course error:', error);
    return sendError(res, 500, 'failed to create course');
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;
    const userRole = req.session.userRole;

    const course = await Course.findById(id);
    
    if (!course) {
      return sendError(res, 404, 'course not found');
    }

    // only creator or admin can update
    if (course.creatorId.toString() !== userId && userRole !== 'admin') {
      return sendError(res, 403, 'not authorized to update this course');
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, req.body, { new: true });

    return sendSuccess(res, updatedCourse, 'course updated successfully');
  } catch (error) {
    console.error('update course error:', error);
    return sendError(res, 500, 'failed to update course');
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndDelete(id);
    
    if (!course) {
      return sendError(res, 404, 'course not found');
    }

    return sendSuccess(res, null, 'course deleted successfully');
  } catch (error) {
    console.error('delete course error:', error);
    return sendError(res, 500, 'failed to delete course');
  }
};

export const enrollInCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const course = await Course.findById(id);
    
    if (!course) {
      return sendError(res, 404, 'course not found');
    }

    if (!course.isPublished) {
      return sendError(res, 400, 'cannot enroll in unpublished course');
    }

    // check if already enrolled
    const existingProgress = await Progress.findOne({ userId, courseId: id });
    if (existingProgress) {
      return sendError(res, 409, 'already enrolled in this course');
    }

    // create progress record
    await Progress.create({
      userId,
      courseId: id,
      completedLessons: [],
      quizAttempts: [],
      codeSubmissions: [],
      overallProgress: 0,
    });

    // add to user's enrolled courses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: id },
    });

    // increment enrollment count
    await Course.findByIdAndUpdate(id, {
      $inc: { enrollmentCount: 1 },
    });

    return sendSuccess(res, null, 'enrolled successfully');
  } catch (error) {
    console.error('enroll error:', error);
    return sendError(res, 500, 'failed to enroll in course');
  }
};

export const unenrollFromCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const course = await Course.findById(id);
    
    if (!course) {
      return sendError(res, 404, 'course not found');
    }

    // check if enrolled
    const existingProgress = await Progress.findOne({ userId, courseId: id });
    if (!existingProgress) {
      return sendError(res, 404, 'not enrolled in this course');
    }

    // delete progress record
    await Progress.findOneAndDelete({ userId, courseId: id });

    // remove from user's enrolled courses
    await User.findByIdAndUpdate(userId, {
      $pull: { enrolledCourses: id },
    });

    // decrement enrollment count
    await Course.findByIdAndUpdate(id, {
      $inc: { enrollmentCount: -1 },
    });

    return sendSuccess(res, null, 'unenrolled successfully');
  } catch (error) {
    console.error('unenroll error:', error);
    return sendError(res, 500, 'failed to unenroll from course');
  }
};

export const getEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    const user = await User.findById(userId).populate('enrolledCourses');
    
    if (!user) {
      return sendError(res, 404, 'user not found');
    }

    return sendSuccess(res, user.enrolledCourses);
  } catch (error) {
    console.error('get enrolled courses error:', error);
    return sendError(res, 500, 'failed to fetch enrolled courses');
  }
};
