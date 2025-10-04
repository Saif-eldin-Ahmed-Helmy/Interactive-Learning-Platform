import { Session } from 'express-session';

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  points: number;
  studyHours: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  treeLevel: number;
  enrolledCourses: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseModule {
  title: string;
  order: number;
  lessons: string[];
}

export interface CourseDocument {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  creatorId: string;
  isPublished: boolean;
  modules: CourseModule[];
  estimatedHours: number;
  thumbnailUrl: string;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeExercise {
  starterCode: string;
  hints: string[];
  expectedOutput: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
}

export interface LessonDocument {
  _id: string;
  courseId: string;
  moduleIndex: number;
  title: string;
  description: string;
  order: number;
  contentType: 'video' | 'text' | 'code' | 'mixed';
  videoUrl?: string;
  textContent?: string;
  codeExercise?: CodeExercise;
  quizId?: string;
  estimatedMinutes: number;
  pointsReward: number;
  createdAt: Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points: number;
}

export interface QuizDocument {
  _id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
  createdAt: Date;
}

export interface CompletedLesson {
  lessonId: string;
  completedAt: Date;
  timeSpent: number;
}

export interface QuizAttempt {
  quizId: string;
  lessonId: string;
  score: number;
  answers: number[];
  attemptedAt: Date;
  passed: boolean;
}

export interface CodeSubmission {
  lessonId: string;
  submittedCode: string;
  verdict: 'correct' | 'wrong' | 'partial';
  submittedAt: Date;
}

export interface ProgressDocument {
  _id: string;
  userId: string;
  courseId: string;
  completedLessons: CompletedLesson[];
  quizAttempts: QuizAttempt[];
  codeSubmissions: CodeSubmission[];
  overallProgress: number;
  currentModuleIndex: number;
  enrolledAt: Date;
  lastAccessedAt: Date;
}

export interface BadgeDocument {
  _id: string;
  userId: string;
  type: 'badge' | 'medal' | 'certificate';
  name: string;
  description: string;
  iconUrl: string;
  achievementType: 'module_complete' | 'course_complete' | 'track_complete' | 'streak' | 'challenge_win';
  relatedId?: string;
  earnedAt: Date;
}

export interface ChallengeDocument {
  _id: string;
  challengerId: string;
  opponentId: string;
  quizId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  challengerScore?: number;
  opponentScore?: number;
  winnerId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface NotificationDocument {
  _id: string;
  userId: string;
  type: 'achievement' | 'reminder' | 'challenge' | 'course_update';
  title: string;
  message: string;
  relatedType?: 'course' | 'lesson' | 'challenge';
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface StudySessionDocument {
  _id: string;
  userId: string;
  sessionDate: Date;
  totalMinutes: number;
  lessonsCompleted: number;
  quizzesAttempted: number;
  createdAt: Date;
}

// extend express session to include user data
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    userRole?: 'student' | 'teacher' | 'admin';
  }
}
