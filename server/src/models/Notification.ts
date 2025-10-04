import mongoose, { Schema, Model } from 'mongoose';
import { NotificationDocument } from '../types';

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['achievement', 'reminder', 'challenge', 'course_update'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedType: {
      type: String,
      enum: ['course', 'lesson', 'challenge'],
    },
    relatedId: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// indexes for querying notifications
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification: Model<NotificationDocument> = mongoose.model<NotificationDocument>('Notification', notificationSchema);
