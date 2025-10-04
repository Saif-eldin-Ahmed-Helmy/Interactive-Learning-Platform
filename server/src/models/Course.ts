import mongoose, { Schema, Model } from 'mongoose';
import { CourseDocument, CourseModule } from '../types';

const moduleSchema = new Schema<CourseModule>({
  title: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  lessons: [{
    type: String,
    ref: 'Lesson',
  }],
}, { _id: false });

const courseSchema = new Schema<CourseDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    creatorId: {
      type: String,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    modules: [moduleSchema],
    estimatedHours: {
      type: Number,
      default: 0,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// indexes for faster queries
courseSchema.index({ creatorId: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ difficulty: 1 });

export const Course: Model<CourseDocument> = mongoose.model<CourseDocument>('Course', courseSchema);
