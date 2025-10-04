import mongoose, { Schema, Model } from 'mongoose';
import { BadgeDocument } from '../types';

const badgeSchema = new Schema<BadgeDocument>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['badge', 'medal', 'certificate'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    iconUrl: {
      type: String,
      default: '/icons/default-badge.png',
    },
    achievementType: {
      type: String,
      enum: ['module_complete', 'course_complete', 'track_complete', 'streak', 'challenge_win'],
      required: true,
    },
    relatedId: {
      type: String,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// indexes
badgeSchema.index({ userId: 1 });
badgeSchema.index({ type: 1 });

export const Badge: Model<BadgeDocument> = mongoose.model<BadgeDocument>('Badge', badgeSchema);
