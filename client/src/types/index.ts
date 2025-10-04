export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  points: number;
  studyHours: number;
  currentStreak: number;
  longestStreak: number;
  treeLevel: number;
  enrolledCourses: string[];
}

export interface Course {
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
}

export interface CourseModule {
  title: string;
  order: number;
  lessons: string[];
}

export interface Lesson {
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
}

export interface CodeExercise {
  starterCode: string;
  hints: string[];
  expectedOutput: string;
  testCases: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Quiz {
  _id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points: number;
}

export interface Progress {
  _id: string;
  userId: string;
  courseId: string;
  completedLessons: CompletedLesson[];
  quizAttempts: QuizAttempt[];
  codeSubmissions: CodeSubmission[];
  overallProgress: number;
  currentModuleIndex: number;
}

export interface CompletedLesson {
  lessonId: string;
  completedAt: string;
  timeSpent: number;
}

export interface QuizAttempt {
  quizId: string;
  lessonId: string;
  score: number;
  answers: number[];
  attemptedAt: string;
  passed: boolean;
}

export interface CodeSubmission {
  lessonId: string;
  submittedCode: string;
  verdict: 'correct' | 'wrong' | 'partial';
  submittedAt: string;
}

export interface Badge {
  _id: string;
  userId: string;
  type: 'badge' | 'medal' | 'certificate';
  name: string;
  description: string;
  iconUrl: string;
  achievementType: string;
  earnedAt: string;
}

export interface Challenge {
  _id: string;
  challengerId: string;
  opponentId: string;
  quizId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  challengerScore?: number;
  opponentScore?: number;
  winnerId?: string;
}

export interface StudyStats {
  points: number;
  studyHours: number;
  currentStreak: number;
  longestStreak: number;
  treeLevel: number;
  totalBadges: number;
  totalMedals: number;
  totalCertificates: number;
  recentBadges: Badge[];
  recentSessions: any[];
}
