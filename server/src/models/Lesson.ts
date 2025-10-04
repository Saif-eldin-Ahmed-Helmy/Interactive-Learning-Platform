import mongoose, { Schema, Model } from 'mongoose';
import { LessonDocument, CodeExercise } from '../types';

const codeExerciseSchema = new Schema<CodeExercise>({
  starterCode: {
    type: String,
    required: true,
  },
  hints: [{
    type: String,
  }],
  expectedOutput: {
    type: String,
    required: true,
  },
  testCases: [{
    input: String,
    expectedOutput: String,
  }],
}, { _id: false });

const lessonSchema = new Schema<LessonDocument>(
  {
    courseId: {
      type: String,
      ref: 'Course',
      required: true,
    },
    moduleIndex: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['video', 'text', 'code', 'mixed'],
      required: true,
    },
    videoUrl: {
      type: String,
    },
    textContent: {
      type: String,
    },
    codeExercise: codeExerciseSchema,
    quizId: {
      type: String,
      ref: 'Quiz',
    },
    estimatedMinutes: {
      type: Number,
      default: 10,
    },
    pointsReward: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

// indexes for queries
lessonSchema.index({ courseId: 1 });
lessonSchema.index({ order: 1 });

export const Lesson: Model<LessonDocument> = mongoose.model<LessonDocument>('Lesson', lessonSchema);
