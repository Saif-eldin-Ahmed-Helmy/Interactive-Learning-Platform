import mongoose, { Schema, Model } from 'mongoose';
import { ChallengeDocument } from '../types';

const challengeSchema = new Schema<ChallengeDocument>(
  {
    challengerId: {
      type: String,
      ref: 'User',
      required: true,
    },
    opponentId: {
      type: String,
      ref: 'User',
      required: true,
    },
    quizId: {
      type: String,
      ref: 'Quiz',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending',
    },
    challengerScore: {
      type: Number,
    },
    opponentScore: {
      type: Number,
    },
    winnerId: {
      type: String,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: false,
  }
);

// indexes for finding user challenges
challengeSchema.index({ challengerId: 1 });
challengeSchema.index({ opponentId: 1 });
challengeSchema.index({ status: 1 });

export const Challenge: Model<ChallengeDocument> = mongoose.model<ChallengeDocument>('Challenge', challengeSchema);
