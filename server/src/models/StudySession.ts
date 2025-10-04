import mongoose, { Schema, Model } from 'mongoose';
import { StudySessionDocument } from '../types';

const studySessionSchema = new Schema<StudySessionDocument>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    totalMinutes: {
      type: Number,
      default: 0,
    },
    lessonsCompleted: {
      type: Number,
      default: 0,
    },
    quizzesAttempted: {
      type: Number,
      default: 0,
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

// compound index for daily sessions
studySessionSchema.index({ userId: 1, sessionDate: 1 }, { unique: true });

export const StudySession: Model<StudySessionDocument> = mongoose.model<StudySessionDocument>('StudySession', studySessionSchema);
