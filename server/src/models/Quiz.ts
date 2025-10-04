import mongoose, { Schema, Model } from 'mongoose';
import { QuizDocument, QuizQuestion } from '../types';

const questionSchema = new Schema<QuizQuestion>({
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswerIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 10,
  },
}, { _id: false });

const quizSchema = new Schema<QuizDocument>(
  {
    lessonId: {
      type: String,
      ref: 'Lesson',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    passingScore: {
      type: Number,
      default: 70,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

// index for lesson-quiz relationship
quizSchema.index({ lessonId: 1 });

export const Quiz: Model<QuizDocument> = mongoose.model<QuizDocument>('Quiz', quizSchema);
