import mongoose, { Schema, Model, Document } from 'mongoose';

interface AchievementDocument extends Document {
  name: string;
  description: string;
  iconUrl: string;
  category: string;
  requirement: {
    type: string;
    value: number;
  };
  points: number;
  createdAt: Date;
}

const achievementSchema = new Schema<AchievementDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    iconUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['html', 'css', 'javascript', 'react', 'milestone', 'streak', 'general'],
      required: true,
    },
    requirement: {
      type: {
        type: String,
        enum: [
          'lesson_complete',
          'lesson_count',
          'course_complete',
          'course_count',
          'all_courses',
          'streak',
          'quiz_pass',
          'code_submit',
        ],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
    points: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

// indexes
achievementSchema.index({ category: 1 });
achievementSchema.index({ 'requirement.type': 1 });

export const Achievement: Model<AchievementDocument> = mongoose.model<AchievementDocument>(
  'Achievement',
  achievementSchema
);
