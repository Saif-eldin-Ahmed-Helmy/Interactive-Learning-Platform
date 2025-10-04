import mongoose, { Schema, Model } from 'mongoose';
import { ProgressDocument, CompletedLesson, QuizAttempt, CodeSubmission } from '../types';

const completedLessonSchema = new Schema<CompletedLesson>({
  lessonId: {
    type: String,
    ref: 'Lesson',
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const quizAttemptSchema = new Schema<QuizAttempt>({
  quizId: {
    type: String,
    ref: 'Quiz',
    required: true,
  },
  lessonId: {
    type: String,
    ref: 'Lesson',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  answers: [{
    type: Number,
  }],
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
  passed: {
    type: Boolean,
    required: true,
  },
}, { _id: false });

const codeSubmissionSchema = new Schema<CodeSubmission>({
  lessonId: {
    type: String,
    ref: 'Lesson',
    required: true,
  },
  submittedCode: {
    type: String,
    required: true,
  },
  verdict: {
    type: String,
    enum: ['correct', 'wrong', 'partial'],
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const progressSchema = new Schema<ProgressDocument>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: String,
      ref: 'Course',
      required: true,
    },
    completedLessons: [completedLessonSchema],
    quizAttempts: [quizAttemptSchema],
    codeSubmissions: [codeSubmissionSchema],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentModuleIndex: {
      type: Number,
      default: 0,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// compound index for user's course progress
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
progressSchema.index({ userId: 1 });

export const Progress: Model<ProgressDocument> = mongoose.model<ProgressDocument>('Progress', progressSchema);
