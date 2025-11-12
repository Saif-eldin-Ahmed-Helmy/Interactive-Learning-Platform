import mongoose, { Schema, Model } from 'mongoose';
import { UserDocument } from '../types';

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    points: {
      type: Number,
      default: 0,
    },
    studyHours: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    lastLoginDate: {
      type: Date,
      default: null,
    },
    treeLevel: {
      type: Number,
      default: 1,
    },
    enrolledCourses: [{
      type: String,
      ref: 'Course',
    }],
  },
  {
    timestamps: true,
  }
);

// index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// don't return password in json responses
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    const { password, ...rest } = ret;
    return rest;
  },
});

export const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);
