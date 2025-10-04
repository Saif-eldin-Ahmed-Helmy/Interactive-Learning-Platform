import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { sendSuccess, sendError, sendCreated } from '../utils/responses';

export const register = async (req: Request, res: Response) => {
  try {
    // check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'validation failed', errors.array());
    }

    const { name, email, password, role } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'user with this email already exists');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
    });

    return sendCreated(res, { userId: user._id, role: user.role }, 'user created successfully');
  } catch (error) {
    console.error('registration error:', error);
    return sendError(res, 500, 'failed to create user');
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'validation failed', errors.array());
    }

    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, 'invalid email or password');
    }

    // verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'invalid email or password');
    }

    // create session
    req.session.userId = user._id.toString();
    req.session.userRole = user.role;

    // return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      studyHours: user.studyHours,
      currentStreak: user.currentStreak,
      treeLevel: user.treeLevel,
    };

    return sendSuccess(res, userData, 'logged in successfully');
  } catch (error) {
    console.error('login error:', error);
    return sendError(res, 500, 'failed to login');
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('logout error:', err);
        return sendError(res, 500, 'failed to logout');
      }
      res.clearCookie('connect.sid');
      return sendSuccess(res, null, 'logged out successfully');
    });
  } catch (error) {
    console.error('logout error:', error);
    return sendError(res, 500, 'failed to logout');
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return sendError(res, 401, 'not authenticated');
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return sendError(res, 404, 'user not found');
    }

    return sendSuccess(res, user);
  } catch (error) {
    console.error('get user error:', error);
    return sendError(res, 500, 'failed to get user');
  }
};
