import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Lesson } from '../models/Lesson';
import { Quiz } from '../models/Quiz';
import { Progress } from '../models/Progress';
import { Achievement } from '../models/Achievement';
import { Badge } from '../models/Badge';
import { demoId, demoLearners, demoCourses, demoAchievements } from './data';

export async function seedDemo(uri: string, credentials?: Record<string, string>) {
  await mongoose.connect(uri);
  try {
    const database = mongoose.connection.db?.databaseName;
    if (database !== 'learning-platform-demo' && !database?.startsWith('learning_test_')) {
      throw new Error('Demo seeding is restricted to the dedicated demo or test database.');
    }
    await Promise.all([User.init(), Course.init(), Lesson.init(), Quiz.init(), Progress.init(), Achievement.init()]);
    const password = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
    await User.updateOne({ _id: demoId('teacher') }, { $setOnInsert: {
      name: 'Demo Instructor', email: 'instructor@demo.example.test', role: 'teacher', password,
    } }, { upsert: true });
    for (const content of demoCourses) {
      const { _id, enrollmentCount, ...course } = content.course;
      await Course.updateOne({ _id }, { $set: course, $setOnInsert: { enrollmentCount } }, { upsert: true });
      for (const { _id, ...lesson } of content.lessons) await Lesson.updateOne({ _id }, { $set: lesson }, { upsert: true });
      for (const { _id, ...quiz } of content.quizzes) await Quiz.updateOne({ _id }, { $set: quiz }, { upsert: true });
    }
    for (const item of demoAchievements) {
      const { type, value, ...fields } = item;
      await Achievement.updateOne({ name: item.name }, { $setOnInsert: { ...fields, requirement: { type, value }, points: 20 } }, { upsert: true });
    }
    for (const learner of demoLearners) {
      const userId = demoId(learner.key);
      const learnerPassword = credentials?.[learner.key] ? await bcrypt.hash(credentials[learner.key], 10) : password;
      await User.updateOne({ _id: userId }, { $setOnInsert: {
        name: learner.name, email: learner.email, password: learnerPassword, role: 'student',
        points: learner.key === 'saif' ? 120 : 260, studyHours: learner.key === 'saif' ? 1.5 : 3,
        currentStreak: 3, longestStreak: 5, treeLevel: learner.key === 'saif' ? 2 : 3,
        lastLoginDate: new Date(), enrolledCourses: demoCourses.slice(0, 2).map(content => content.course._id),
      } }, { upsert: true });
      if (credentials?.[learner.key]) await User.updateOne({ _id: userId }, { $set: { password: learnerPassword } });
      const user = await User.findById(userId);
      for (const [index, content] of demoCourses.slice(0, 2).entries()) {
        if (!user?.enrolledCourses.includes(content.course._id)) continue;
        const count = learner.key === 'saif' ? (index === 0 ? 0 : 2) : (index === 0 ? 2 : 4);
        await Progress.updateOne({ userId, courseId: content.course._id }, { $setOnInsert: {
          completedLessons: content.lessons.slice(0, count).map(lesson => ({ lessonId: lesson._id, completedAt: new Date(), timeSpent: lesson.estimatedMinutes })),
          overallProgress: count * 25, quizAttempts: [], videoProgress: [],
        } }, { upsert: true });
      }
      await Badge.updateOne({ userId, name: 'Three Day Streak' }, { $setOnInsert: {
        userId, name: 'Three Day Streak', description: 'Learned on three days in a row.',
        type: 'badge', achievementType: 'streak', iconUrl: '🔥',
      } }, { upsert: true });
    }
    console.log('Demo content ready: 4 courses, 16 lessons, 16 quizzes and 2 learners. Existing progress is preserved.');
  } finally { await mongoose.disconnect(); }
}
