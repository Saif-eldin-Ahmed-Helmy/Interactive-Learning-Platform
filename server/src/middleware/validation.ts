import { body } from 'express-validator';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('email').isEmail().normalizeEmail().withMessage('valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher']).withMessage('role must be student or teacher'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('valid email is required'),
  body('password').notEmpty().withMessage('password is required'),
];

export const courseValidation = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('category').trim().notEmpty().withMessage('category is required'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('invalid difficulty level'),
];

export const lessonValidation = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('contentType').isIn(['video', 'text', 'code', 'mixed']).withMessage('invalid content type'),
];

export const quizValidation = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('questions').isArray({ min: 1 }).withMessage('at least one question is required'),
];
