import { Request, Response } from 'express';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Lesson } from '../models/Lesson';
import { Badge } from '../models/Badge';
import { Progress } from '../models/Progress';
import { Achievement } from '../models/Achievement';
import { sendSuccess, sendError } from '../utils/responses';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, users);
  } catch (error) {
    console.error('get users error:', error);
    return sendError(res, 500, 'failed to fetch users');
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return sendError(res, 400, 'search query is required');
    }

    const searchRegex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    })
    .select('-password')
    .limit(20)
    .sort({ createdAt: -1 });

    return sendSuccess(res, users);
  } catch (error) {
    console.error('search users error:', error);
    return sendError(res, 500, 'failed to search users');
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return sendError(res, 400, 'invalid role');
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');

    if (!user) {
      return sendError(res, 404, 'user not found');
    }

    return sendSuccess(res, user, 'user role updated');
  } catch (error) {
    console.error('update role error:', error);
    return sendError(res, 500, 'failed to update role');
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) {
      if (!['student', 'teacher', 'admin'].includes(role)) {
        return sendError(res, 400, 'invalid role');
      }
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');

    if (!user) {
      return sendError(res, 404, 'user not found');
    }

    return sendSuccess(res, user, 'user updated successfully');
  } catch (error) {
    console.error('update user error:', error);
    return sendError(res, 500, 'failed to update user');
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return sendError(res, 404, 'user not found');
    }

    // cleanup user data
    await Progress.deleteMany({ userId: id });
    await Badge.deleteMany({ userId: id });

    return sendSuccess(res, null, 'user deleted successfully');
  } catch (error) {
    console.error('delete user error:', error);
    return sendError(res, 500, 'failed to delete user');
  }
};

export const getPendingCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find({ isPublished: false })
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, courses);
  } catch (error) {
    console.error('get pending courses error:', error);
    return sendError(res, 500, 'failed to fetch pending courses');
  }
};

export const approveCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(id, { isPublished: true }, { new: true });

    if (!course) {
      return sendError(res, 404, 'course not found');
    }

    return sendSuccess(res, course, 'course approved');
  } catch (error) {
    console.error('approve course error:', error);
    return sendError(res, 500, 'failed to approve course');
  }
};

export const getPlatformAnalytics = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalBadgesAwarded = await Badge.countDocuments();

    const analytics = {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
      publishedCourses,
      pendingCourses: totalCourses - publishedCourses,
      totalBadgesAwarded,
    };

    return sendSuccess(res, analytics);
  } catch (error) {
    console.error('get analytics error:', error);
    return sendError(res, 500, 'failed to fetch analytics');
  }
};

export const populateCourses = async (req: Request, res: Response) => {
  try {
    const adminId = req.session.userId;

    // Check if courses already exist
    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0) {
      return sendError(res, 400, 'courses already exist - use this only on empty database');
    }

    // HTML Course
    const htmlCourse = await Course.create({
      title: 'Complete HTML Mastery',
      description: 'Learn HTML from scratch and build amazing web pages. This comprehensive course covers everything from basic tags to advanced HTML5 features.',
      category: 'Web Development',
      difficulty: 'beginner',
      creatorId: adminId,
      isPublished: true,
      estimatedHours: 8,
      thumbnailUrl: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=500',
      enrollmentCount: 0,
      modules: [],
    });

    // HTML Module 1
    const htmlLesson1_1 = await Lesson.create({
      courseId: htmlCourse._id,
      moduleIndex: 0,
      title: 'Introduction to HTML',
      description: 'Understanding what HTML is and how it works',
      order: 1,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
      estimatedMinutes: 15,
      pointsReward: 10,
    });

    const htmlLesson1_2 = await Lesson.create({
      courseId: htmlCourse._id,
      moduleIndex: 0,
      title: 'HTML Document Structure',
      description: 'Learn about the basic structure of an HTML document',
      order: 2,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=salY_Sm6mv4',
      estimatedMinutes: 20,
      pointsReward: 15,
    });

    const htmlLesson1_3 = await Lesson.create({
      courseId: htmlCourse._id,
      moduleIndex: 0,
      title: 'HTML Tags and Elements',
      description: 'Understanding HTML tags, elements, and attributes',
      order: 3,
      contentType: 'mixed',
      videoUrl: 'https://www.youtube.com/watch?v=MDLn5-zSQQI',
      estimatedMinutes: 25,
      pointsReward: 15,
      codeExercise: {
        starterCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Page</title>\n</head>\n<body>\n  <!-- Create a heading and a paragraph here -->\n  \n</body>\n</html>',
        hints: [
          'Use <h1> tag for the heading',
          'Use <p> tag for the paragraph',
          'Make sure to close all tags properly',
        ],
        expectedOutput: '<h1>Welcome to HTML</h1><p>This is my first paragraph.</p>',
        testCases: [
          {
            input: 'Check for h1 tag',
            expectedOutput: 'Must contain an h1 heading',
          },
          {
            input: 'Check for p tag',
            expectedOutput: 'Must contain a paragraph',
          },
        ],
      },
    });

    // HTML Module 2
    const htmlLesson2_1 = await Lesson.create({
      courseId: htmlCourse._id,
      moduleIndex: 1,
      title: 'Text Formatting',
      description: 'Learn how to format text with HTML',
      order: 1,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=kX3TfdUqpuU',
      estimatedMinutes: 20,
      pointsReward: 15,
    });

    const htmlLesson2_2 = await Lesson.create({
      courseId: htmlCourse._id,
      moduleIndex: 1,
      title: 'Links and Images',
      description: 'Adding links and images to your web pages',
      order: 2,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=PlxWf493en4',
      estimatedMinutes: 30,
      pointsReward: 20,
    });

    const htmlLesson2_3 = await Lesson.create({
      courseId: htmlCourse._id,
      moduleIndex: 1,
      title: 'Lists and Tables',
      description: 'Creating organized content with lists and tables',
      order: 3,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=Wm6CUkswsNw',
      estimatedMinutes: 25,
      pointsReward: 20,
    });

    // Update HTML course with modules
    htmlCourse.modules = [
      {
        title: 'HTML Basics',
        order: 1,
        lessons: [htmlLesson1_1._id.toString(), htmlLesson1_2._id.toString(), htmlLesson1_3._id.toString()],
      },
      {
        title: 'HTML Content',
        order: 2,
        lessons: [htmlLesson2_1._id.toString(), htmlLesson2_2._id.toString(), htmlLesson2_3._id.toString()],
      },
    ];
    await htmlCourse.save();

    // CSS Course
    const cssCourse = await Course.create({
      title: 'CSS Styling Fundamentals',
      description: 'Master CSS and create beautiful, responsive designs. Learn selectors, layouts, animations, and modern CSS techniques.',
      category: 'Web Development',
      difficulty: 'beginner',
      creatorId: adminId,
      isPublished: true,
      estimatedHours: 10,
      thumbnailUrl: 'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=500',
      enrollmentCount: 0,
      modules: [],
    });

    // CSS Module 1
    const cssLesson1_1 = await Lesson.create({
      courseId: cssCourse._id,
      moduleIndex: 0,
      title: 'Introduction to CSS',
      description: 'What is CSS and why do we need it?',
      order: 1,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
      estimatedMinutes: 15,
      pointsReward: 10,
    });

    const cssLesson1_2 = await Lesson.create({
      courseId: cssCourse._id,
      moduleIndex: 0,
      title: 'CSS Selectors',
      description: 'Learn how to target HTML elements with CSS selectors',
      order: 2,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=l1mER1bV0N0',
      estimatedMinutes: 25,
      pointsReward: 15,
    });

    const cssLesson1_3 = await Lesson.create({
      courseId: cssCourse._id,
      moduleIndex: 0,
      title: 'Colors and Typography',
      description: 'Styling text and using colors in CSS',
      order: 3,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=Z4pCqK-V_Wo',
      estimatedMinutes: 30,
      pointsReward: 20,
    });

    // CSS Module 2
    const cssLesson2_1 = await Lesson.create({
      courseId: cssCourse._id,
      moduleIndex: 1,
      title: 'Box Model',
      description: 'Understanding the CSS box model',
      order: 1,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=rIO5326FgPE',
      estimatedMinutes: 20,
      pointsReward: 15,
    });

    const cssLesson2_2 = await Lesson.create({
      courseId: cssCourse._id,
      moduleIndex: 1,
      title: 'Flexbox Layout',
      description: 'Creating flexible layouts with CSS Flexbox',
      order: 2,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=fYq5PXgSsbE',
      estimatedMinutes: 35,
      pointsReward: 25,
    });

    const cssLesson2_3 = await Lesson.create({
      courseId: cssCourse._id,
      moduleIndex: 1,
      title: 'Responsive Design',
      description: 'Making your websites work on all devices',
      order: 3,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=srvUrASNj0s',
      estimatedMinutes: 30,
      pointsReward: 25,
    });

    // Update CSS course with modules
    cssCourse.modules = [
      {
        title: 'CSS Fundamentals',
        order: 1,
        lessons: [cssLesson1_1._id.toString(), cssLesson1_2._id.toString(), cssLesson1_3._id.toString()],
      },
      {
        title: 'CSS Layout',
        order: 2,
        lessons: [cssLesson2_1._id.toString(), cssLesson2_2._id.toString(), cssLesson2_3._id.toString()],
      },
    ];
    await cssCourse.save();

    // JavaScript Course
    const jsCourse = await Course.create({
      title: 'JavaScript Programming Essentials',
      description: 'Become a JavaScript developer! Learn programming fundamentals, DOM manipulation, and modern ES6+ features.',
      category: 'Programming',
      difficulty: 'intermediate',
      creatorId: adminId,
      isPublished: true,
      estimatedHours: 15,
      thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500',
      enrollmentCount: 0,
      modules: [],
    });

    // JS Module 1
    const jsLesson1_1 = await Lesson.create({
      courseId: jsCourse._id,
      moduleIndex: 0,
      title: 'JavaScript Introduction',
      description: 'Getting started with JavaScript programming',
      order: 1,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
      estimatedMinutes: 20,
      pointsReward: 15,
    });

    const jsLesson1_2 = await Lesson.create({
      courseId: jsCourse._id,
      moduleIndex: 0,
      title: 'Variables and Data Types',
      description: 'Understanding JavaScript variables and data types',
      order: 2,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=9emXNzqCKyg',
      estimatedMinutes: 25,
      pointsReward: 20,
    });

    const jsLesson1_3 = await Lesson.create({
      courseId: jsCourse._id,
      moduleIndex: 0,
      title: 'Operators and Expressions',
      description: 'Working with JavaScript operators',
      order: 3,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=FZzyij43A54',
      estimatedMinutes: 20,
      pointsReward: 15,
    });

    // JS Module 2
    const jsLesson2_1 = await Lesson.create({
      courseId: jsCourse._id,
      moduleIndex: 1,
      title: 'Functions',
      description: 'Creating and using functions in JavaScript',
      order: 1,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=gigtS_5KOqo',
      estimatedMinutes: 30,
      pointsReward: 25,
    });

    const jsLesson2_2 = await Lesson.create({
      courseId: jsCourse._id,
      moduleIndex: 1,
      title: 'Arrays and Objects',
      description: 'Working with complex data structures',
      order: 2,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=oigfaZ5ApsM',
      estimatedMinutes: 35,
      pointsReward: 25,
    });

    const jsLesson2_3 = await Lesson.create({
      courseId: jsCourse._id,
      moduleIndex: 1,
      title: 'DOM Manipulation',
      description: 'Interacting with web pages using JavaScript',
      order: 3,
      contentType: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=y17RuWkWdn8',
      estimatedMinutes: 40,
      pointsReward: 30,
    });

    // Update JS course with modules
    jsCourse.modules = [
      {
        title: 'JavaScript Basics',
        order: 1,
        lessons: [jsLesson1_1._id.toString(), jsLesson1_2._id.toString(), jsLesson1_3._id.toString()],
      },
      {
        title: 'Advanced Concepts',
        order: 2,
        lessons: [jsLesson2_1._id.toString(), jsLesson2_2._id.toString(), jsLesson2_3._id.toString()],
      },
    ];
    await jsCourse.save();

    return sendSuccess(res, {
      coursesCreated: 3,
      lessonsCreated: 18,
      courses: [htmlCourse, cssCourse, jsCourse],
    }, 'database populated successfully');
  } catch (error) {
    console.error('populate courses error:', error);
    return sendError(res, 500, 'failed to populate courses');
  }
};

/**
 * Seed default achievements/badges for the platform
 * POST /api/admin/seed/achievements
 */
export const seedAchievements = async (req: Request, res: Response) => {
  try {
    // Check if achievements already exist
    const existingCount = await Achievement.countDocuments();
    if (existingCount > 0) {
      return sendError(res, 400, 'Achievements already seeded. Delete existing achievements first.');
    }

    const achievements = [
      // HTML Mastery
      {
        name: 'HTML Beginner',
        description: 'Complete your first HTML lesson',
        iconUrl: '🎯',
        category: 'html',
        requirement: { type: 'lesson_complete', value: 1 },
        points: 10,
      },
      {
        name: 'Structure Master',
        description: 'Complete all HTML basics lessons',
        iconUrl: '🏗️',
        category: 'html',
        requirement: { type: 'lesson_count', value: 5 },
        points: 25,
      },
      {
        name: 'Semantic Wizard',
        description: 'Master semantic HTML',
        iconUrl: '📝',
        category: 'html',
        requirement: { type: 'course_complete', value: 1 },
        points: 50,
      },

      // CSS Styling
      {
        name: 'CSS Novice',
        description: 'Complete your first CSS lesson',
        iconUrl: '🎨',
        category: 'css',
        requirement: { type: 'lesson_complete', value: 1 },
        points: 10,
      },
      {
        name: 'Layout Expert',
        description: 'Master flexbox and grid layouts',
        iconUrl: '📐',
        category: 'css',
        requirement: { type: 'lesson_count', value: 5 },
        points: 25,
      },
      {
        name: 'Animation Pro',
        description: 'Create stunning CSS animations',
        iconUrl: '✨',
        category: 'css',
        requirement: { type: 'course_complete', value: 1 },
        points: 50,
      },

      // JavaScript Power
      {
        name: 'JS Starter',
        description: 'Write your first JavaScript code',
        iconUrl: '⚡',
        category: 'javascript',
        requirement: { type: 'lesson_complete', value: 1 },
        points: 10,
      },
      {
        name: 'Function Master',
        description: 'Master functions and scope',
        iconUrl: '🔧',
        category: 'javascript',
        requirement: { type: 'lesson_count', value: 3 },
        points: 20,
      },
      {
        name: 'DOM Manipulator',
        description: 'Control the DOM like a pro',
        iconUrl: '🎭',
        category: 'javascript',
        requirement: { type: 'lesson_count', value: 5 },
        points: 30,
      },
      {
        name: 'Async Hero',
        description: 'Master promises and async/await',
        iconUrl: '🚀',
        category: 'javascript',
        requirement: { type: 'course_complete', value: 1 },
        points: 50,
      },

      // React Journey
      {
        name: 'React Beginner',
        description: 'Create your first React component',
        iconUrl: '⚛️',
        category: 'react',
        requirement: { type: 'lesson_complete', value: 1 },
        points: 15,
      },
      {
        name: 'Hook Master',
        description: 'Master React hooks',
        iconUrl: '🪝',
        category: 'react',
        requirement: { type: 'lesson_count', value: 5 },
        points: 30,
      },
      {
        name: 'State Manager',
        description: 'Master state management',
        iconUrl: '🔄',
        category: 'react',
        requirement: { type: 'lesson_count', value: 8 },
        points: 40,
      },
      {
        name: 'React Pro',
        description: 'Complete React course',
        iconUrl: '🏆',
        category: 'react',
        requirement: { type: 'course_complete', value: 1 },
        points: 100,
      },

      // Milestone Achievements
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        iconUrl: '👣',
        category: 'milestone',
        requirement: { type: 'lesson_count', value: 1 },
        points: 5,
      },
      {
        name: 'Course Conqueror',
        description: 'Complete your first course',
        iconUrl: '🎓',
        category: 'milestone',
        requirement: { type: 'course_count', value: 1 },
        points: 50,
      },
      {
        name: 'Knowledge Seeker',
        description: 'Complete 3 courses',
        iconUrl: '📚',
        category: 'milestone',
        requirement: { type: 'course_count', value: 3 },
        points: 150,
      },
      {
        name: 'Web Dev Master',
        description: 'Complete all available courses',
        iconUrl: '👑',
        category: 'milestone',
        requirement: { type: 'all_courses', value: 1 },
        points: 500,
      },

      // Streak Achievements
      {
        name: 'Consistent Learner',
        description: 'Maintain a 7-day learning streak',
        iconUrl: '🔥',
        category: 'streak',
        requirement: { type: 'streak', value: 7 },
        points: 30,
      },
      {
        name: 'Dedicated Student',
        description: 'Maintain a 30-day learning streak',
        iconUrl: '💪',
        category: 'streak',
        requirement: { type: 'streak', value: 30 },
        points: 100,
      },
    ];

    const createdAchievements = await Achievement.insertMany(achievements);

    return sendSuccess(res, {
      achievementsCreated: createdAchievements.length,
      achievements: createdAchievements,
    }, 'Achievements seeded successfully');
  } catch (error) {
    console.error('seed achievements error:', error);
    return sendError(res, 500, 'Failed to seed achievements');
  }
};

/**
 * Populate quizzes for all lessons
 * POST /api/admin/seed/quizzes
 */
export const populateQuizzes = async (req: Request, res: Response) => {
  try {
    const Quiz = require('../models/Quiz').Quiz;
    
    // Check if quizzes already exist
    const existingQuizzes = await Quiz.countDocuments();
    if (existingQuizzes > 0) {
      // Quizzes exist, let's update lessons with existing quiz IDs
      const quizzes = await Quiz.find();
      let lessonsUpdated = 0;
      
      for (const quiz of quizzes) {
        const updated = await Lesson.findByIdAndUpdate(
          quiz.lessonId,
          { quizId: quiz._id.toString() },
          { new: true }
        );
        if (updated) lessonsUpdated++;
      }
      
      return sendSuccess(res, {
        message: 'Quizzes already exist',
        quizzesFound: quizzes.length,
        lessonsUpdated,
      }, 'Lessons updated with existing quiz IDs');
    }

    // Get all lessons
    const lessons = await Lesson.find();
    if (lessons.length === 0) {
      return sendError(res, 400, 'No lessons found. Please populate courses first.');
    }

    const quizzes = [];

    // Create quizzes for each lesson
    for (const lesson of lessons) {
      const course = await Course.findById(lesson.courseId);
      if (!course) continue;

      const courseTitle = course.title.toLowerCase();
      let questions: Array<{
        question: string;
        options: string[];
        correctAnswerIndex: number;
        explanation: string;
        points: number;
      }> = [];

      // HTML Course Quizzes
      if (courseTitle.includes('html')) {
        if (lesson.title.toLowerCase().includes('introduction')) {
          questions = [
            {
              question: 'What does HTML stand for?',
              options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
              correctAnswerIndex: 0,
              explanation: 'HTML stands for Hyper Text Markup Language, which is the standard language for creating web pages.',
              points: 10,
            },
            {
              question: 'What is the purpose of HTML?',
              options: ['To style web pages', 'To structure web content', 'To add interactivity', 'To store data'],
              correctAnswerIndex: 1,
              explanation: 'HTML is used to structure web content by defining elements like headings, paragraphs, links, and more.',
              points: 10,
            },
            {
              question: 'Which symbol is used to denote HTML tags?',
              options: ['Parentheses ()', 'Curly braces {}', 'Angle brackets <>', 'Square brackets []'],
              correctAnswerIndex: 2,
              explanation: 'HTML tags are denoted using angle brackets, like <html>, <head>, and <body>.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('structure')) {
          questions = [
            {
              question: 'Which tag defines the root of an HTML document?',
              options: ['<body>', '<html>', '<head>', '<root>'],
              correctAnswerIndex: 1,
              explanation: 'The <html> tag is the root element that contains all other HTML elements.',
              points: 10,
            },
            {
              question: 'Where do you place metadata in an HTML document?',
              options: ['<body>', '<footer>', '<head>', '<meta>'],
              correctAnswerIndex: 2,
              explanation: 'Metadata like title, charset, and links to stylesheets are placed in the <head> section.',
              points: 10,
            },
            {
              question: 'What is the purpose of the DOCTYPE declaration?',
              options: ['To define the document type and version', 'To import external files', 'To create a header', 'To style the page'],
              correctAnswerIndex: 0,
              explanation: 'The DOCTYPE declaration tells the browser what version of HTML the page is written in.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('tags')) {
          questions = [
            {
              question: 'What is an HTML attribute?',
              options: ['A closing tag', 'Additional information about an element', 'A type of element', 'A comment'],
              correctAnswerIndex: 1,
              explanation: 'Attributes provide additional information about HTML elements, like id, class, or src.',
              points: 10,
            },
            {
              question: 'Which tag creates a paragraph?',
              options: ['<para>', '<p>', '<paragraph>', '<text>'],
              correctAnswerIndex: 1,
              explanation: 'The <p> tag is used to define a paragraph in HTML.',
              points: 10,
            },
            {
              question: 'How do you create a comment in HTML?',
              options: ['// comment', '/* comment */', '<!-- comment -->', '# comment'],
              correctAnswerIndex: 2,
              explanation: 'HTML comments are written using <!-- comment --> syntax.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('formatting')) {
          questions = [
            {
              question: 'Which tag makes text bold?',
              options: ['<b> or <strong>', '<bold>', '<i>', '<em>'],
              correctAnswerIndex: 0,
              explanation: 'Both <b> and <strong> make text bold, with <strong> indicating semantic importance.',
              points: 10,
            },
            {
              question: 'What is the difference between <strong> and <b>?',
              options: ['No difference', '<strong> has semantic meaning', '<b> is deprecated', '<strong> is italics'],
              correctAnswerIndex: 1,
              explanation: '<strong> indicates that the text is important, while <b> is just for visual boldness.',
              points: 10,
            },
            {
              question: 'Which tag is used for line breaks?',
              options: ['<break>', '<lb>', '<br>', '<newline>'],
              correctAnswerIndex: 2,
              explanation: 'The <br> tag creates a line break in HTML.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('links')) {
          questions = [
            {
              question: 'Which attribute specifies the URL in an anchor tag?',
              options: ['link', 'url', 'href', 'src'],
              correctAnswerIndex: 2,
              explanation: 'The href attribute in <a> tag specifies the URL the link points to.',
              points: 10,
            },
            {
              question: 'Which attribute specifies the image source?',
              options: ['href', 'link', 'src', 'url'],
              correctAnswerIndex: 2,
              explanation: 'The src attribute in <img> tag specifies the path to the image file.',
              points: 10,
            },
            {
              question: 'How do you open a link in a new tab?',
              options: ['target="_blank"', 'newtab="true"', 'window="new"', 'open="tab"'],
              correctAnswerIndex: 0,
              explanation: 'The target="_blank" attribute opens the link in a new browser tab.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('lists')) {
          questions = [
            {
              question: 'Which tag creates an unordered list?',
              options: ['<ol>', '<ul>', '<list>', '<ulist>'],
              correctAnswerIndex: 1,
              explanation: 'The <ul> tag creates an unordered (bulleted) list.',
              points: 10,
            },
            {
              question: 'Which tag creates a table row?',
              options: ['<row>', '<tr>', '<td>', '<table-row>'],
              correctAnswerIndex: 1,
              explanation: 'The <tr> tag defines a table row.',
              points: 10,
            },
            {
              question: 'What does <th> stand for?',
              options: ['Table height', 'Table header', 'Table holder', 'Text header'],
              correctAnswerIndex: 1,
              explanation: 'The <th> tag defines a header cell in a table.',
              points: 10,
            },
          ];
        }
      }
      // CSS Course Quizzes
      else if (courseTitle.includes('css')) {
        if (lesson.title.toLowerCase().includes('introduction')) {
          questions = [
            {
              question: 'What does CSS stand for?',
              options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets'],
              correctAnswerIndex: 1,
              explanation: 'CSS stands for Cascading Style Sheets, used to style HTML documents.',
              points: 10,
            },
            {
              question: 'Where should CSS be placed in an HTML document?',
              options: ['In the <body>', 'In the <head>', 'At the end', 'In a separate file only'],
              correctAnswerIndex: 1,
              explanation: 'CSS is typically placed in the <head> section or in an external file linked from there.',
              points: 10,
            },
            {
              question: 'Which symbol is used to denote a class selector?',
              options: ['#', '.', '*', '@'],
              correctAnswerIndex: 1,
              explanation: 'A period (.) is used to select elements by their class attribute.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('selectors')) {
          questions = [
            {
              question: 'Which symbol is used for an ID selector?',
              options: ['.', '#', '*', '@'],
              correctAnswerIndex: 1,
              explanation: 'A hash (#) is used to select elements by their ID attribute.',
              points: 10,
            },
            {
              question: 'What does the * selector do?',
              options: ['Selects all elements', 'Selects important elements', 'Selects nothing', 'Creates a comment'],
              correctAnswerIndex: 0,
              explanation: 'The universal selector (*) targets all elements on the page.',
              points: 10,
            },
            {
              question: 'How do you select all <p> elements inside a <div>?',
              options: ['div + p', 'div > p', 'div p', 'div.p'],
              correctAnswerIndex: 2,
              explanation: 'The descendant selector (div p) selects all <p> elements inside a <div>.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('colors')) {
          questions = [
            {
              question: 'Which property changes text color?',
              options: ['font-color', 'text-color', 'color', 'foreground-color'],
              correctAnswerIndex: 2,
              explanation: 'The color property is used to set the text color.',
              points: 10,
            },
            {
              question: 'Which property sets font size?',
              options: ['text-size', 'font-size', 'size', 'text-style'],
              correctAnswerIndex: 1,
              explanation: 'The font-size property controls the size of the text.',
              points: 10,
            },
            {
              question: 'What is the correct format for an RGB color?',
              options: ['rgb(255, 255, 255)', 'rgb(#ffffff)', 'rgb(100%)', 'rgb:255,255,255'],
              correctAnswerIndex: 0,
              explanation: 'RGB colors are specified using rgb(red, green, blue) with values from 0-255.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('box model')) {
          questions = [
            {
              question: 'What are the four parts of the CSS box model?',
              options: ['Content, border, margin, style', 'Content, padding, border, margin', 'Width, height, padding, margin', 'Header, body, footer, sidebar'],
              correctAnswerIndex: 1,
              explanation: 'The box model consists of content, padding, border, and margin.',
              points: 10,
            },
            {
              question: 'Which property adds space inside an element?',
              options: ['margin', 'padding', 'border', 'spacing'],
              correctAnswerIndex: 1,
              explanation: 'Padding adds space inside an element, between the content and border.',
              points: 10,
            },
            {
              question: 'Which property adds space outside an element?',
              options: ['padding', 'margin', 'border', 'spacing'],
              correctAnswerIndex: 1,
              explanation: 'Margin adds space outside an element, creating distance from other elements.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('flexbox')) {
          questions = [
            {
              question: 'Which property makes an element a flex container?',
              options: ['display: flex', 'flex: true', 'layout: flex', 'flexbox: on'],
              correctAnswerIndex: 0,
              explanation: 'Setting display: flex on an element makes it a flex container.',
              points: 10,
            },
            {
              question: 'What does justify-content do?',
              options: ['Aligns items vertically', 'Aligns items horizontally', 'Sets flex direction', 'Changes item size'],
              correctAnswerIndex: 1,
              explanation: 'justify-content aligns flex items along the main axis (usually horizontally).',
              points: 10,
            },
            {
              question: 'What does align-items do?',
              options: ['Aligns items horizontally', 'Aligns items vertically', 'Sets item order', 'Changes flex direction'],
              correctAnswerIndex: 1,
              explanation: 'align-items aligns flex items along the cross axis (usually vertically).',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('responsive')) {
          questions = [
            {
              question: 'What is a media query used for?',
              options: ['Adding images', 'Responsive design', 'Database queries', 'Video playback'],
              correctAnswerIndex: 1,
              explanation: 'Media queries allow you to apply different styles based on device characteristics.',
              points: 10,
            },
            {
              question: 'What unit is relative to viewport width?',
              options: ['px', 'em', 'vw', 'pt'],
              correctAnswerIndex: 2,
              explanation: 'vw (viewport width) is relative to 1% of the viewport width.',
              points: 10,
            },
            {
              question: 'What is mobile-first design?',
              options: ['Designing for mobile devices first', 'Mobile phones only', 'Desktop first, then mobile', 'Tablet-focused design'],
              correctAnswerIndex: 0,
              explanation: 'Mobile-first means designing for mobile devices first, then adding features for larger screens.',
              points: 10,
            },
          ];
        }
      }
      // JavaScript Course Quizzes
      else if (courseTitle.includes('javascript')) {
        if (lesson.title.toLowerCase().includes('introduction')) {
          questions = [
            {
              question: 'What is JavaScript used for?',
              options: ['Styling web pages', 'Structuring content', 'Adding interactivity', 'Database management'],
              correctAnswerIndex: 2,
              explanation: 'JavaScript is primarily used to add interactivity and dynamic behavior to web pages.',
              points: 10,
            },
            {
              question: 'Where can JavaScript be placed in HTML?',
              options: ['In <head> only', 'In <body> only', 'In both <head> and <body>', 'In <script> only'],
              correctAnswerIndex: 2,
              explanation: 'JavaScript can be placed in both <head> and <body>, or in external files.',
              points: 10,
            },
            {
              question: 'How do you declare a variable in JavaScript?',
              options: ['var, let, or const', 'variable x', 'dim x', 'int x'],
              correctAnswerIndex: 0,
              explanation: 'Variables can be declared using var, let, or const keywords.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('variables')) {
          questions = [
            {
              question: 'What is the difference between let and const?',
              options: ['No difference', 'let is reassignable, const is not', 'const is faster', 'let is deprecated'],
              correctAnswerIndex: 1,
              explanation: 'let allows reassignment, while const creates a constant that cannot be reassigned.',
              points: 10,
            },
            {
              question: 'Which data type is "Hello"?',
              options: ['Number', 'String', 'Boolean', 'Object'],
              correctAnswerIndex: 1,
              explanation: 'Text enclosed in quotes is a String data type.',
              points: 10,
            },
            {
              question: 'What is the result of typeof null?',
              options: ['"null"', '"undefined"', '"object"', '"empty"'],
              correctAnswerIndex: 2,
              explanation: 'typeof null returns "object", which is a known quirk in JavaScript.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('operators')) {
          questions = [
            {
              question: 'What does === mean?',
              options: ['Assignment', 'Strict equality', 'Loose equality', 'Not equal'],
              correctAnswerIndex: 1,
              explanation: '=== checks for strict equality (value and type must match).',
              points: 10,
            },
            {
              question: 'What is the result of 5 + "5"?',
              options: ['10', '"55"', 'Error', '"10"'],
              correctAnswerIndex: 1,
              explanation: 'JavaScript converts the number to a string and concatenates them, resulting in "55".',
              points: 10,
            },
            {
              question: 'What does the ++ operator do?',
              options: ['Adds two numbers', 'Increments by 1', 'Multiplies by 2', 'Concatenates strings'],
              correctAnswerIndex: 1,
              explanation: 'The ++ operator increments a number by 1.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('functions')) {
          questions = [
            {
              question: 'How do you define a function in JavaScript?',
              options: ['function myFunc() {}', 'def myFunc():', 'func myFunc() {}', 'function:myFunc()'],
              correctAnswerIndex: 0,
              explanation: 'Functions are defined using the function keyword followed by the function name.',
              points: 10,
            },
            {
              question: 'What is an arrow function?',
              options: ['A special loop', 'A shorthand function syntax', 'A function pointer', 'A type of variable'],
              correctAnswerIndex: 1,
              explanation: 'Arrow functions (=>) provide a shorter syntax for writing functions.',
              points: 10,
            },
            {
              question: 'What does a function return by default?',
              options: ['null', '0', 'undefined', 'false'],
              correctAnswerIndex: 2,
              explanation: 'If no return statement is specified, a function returns undefined.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('arrays')) {
          questions = [
            {
              question: 'How do you create an array?',
              options: ['let arr = []', 'let arr = ()', 'let arr = {}', 'let arr = <>'],
              correctAnswerIndex: 0,
              explanation: 'Arrays are created using square brackets [].',
              points: 10,
            },
            {
              question: 'How do you access the first element of an array?',
              options: ['arr[0]', 'arr[1]', 'arr.first()', 'arr.get(0)'],
              correctAnswerIndex: 0,
              explanation: 'Arrays are zero-indexed, so the first element is at index 0.',
              points: 10,
            },
            {
              question: 'Which method adds an element to the end of an array?',
              options: ['add()', 'append()', 'push()', 'insert()'],
              correctAnswerIndex: 2,
              explanation: 'The push() method adds elements to the end of an array.',
              points: 10,
            },
          ];
        } else if (lesson.title.toLowerCase().includes('dom')) {
          questions = [
            {
              question: 'What does DOM stand for?',
              options: ['Document Object Model', 'Data Object Manager', 'Digital Operations Module', 'Document Oriented Markup'],
              correctAnswerIndex: 0,
              explanation: 'DOM stands for Document Object Model, representing the HTML structure as objects.',
              points: 10,
            },
            {
              question: 'How do you select an element by ID?',
              options: ['document.querySelector("#id")', 'document.getElementById("id")', 'Both are correct', 'document.getElement("id")'],
              correctAnswerIndex: 2,
              explanation: 'Both document.getElementById() and document.querySelector() can select elements by ID.',
              points: 10,
            },
            {
              question: 'How do you change an element\'s text content?',
              options: ['element.text = "..."', 'element.textContent = "..."', 'element.setText("...")', 'element.value = "..."'],
              correctAnswerIndex: 1,
              explanation: 'The textContent property is used to get or set the text content of an element.',
              points: 10,
            },
          ];
        }
      }

      // Only create quiz if we have questions
      if (questions.length > 0) {
        const quiz = {
          lessonId: lesson._id.toString(),
          title: `${lesson.title} Quiz`,
          passingScore: 70,
          questions,
        };
        quizzes.push(quiz);
      }
    }

    // Insert all quizzes
    const createdQuizzes = await Quiz.insertMany(quizzes);

    // Update lessons with their quizIds
    let lessonsUpdated = 0;
    for (const createdQuiz of createdQuizzes) {
      const updated = await Lesson.findByIdAndUpdate(
        createdQuiz.lessonId,
        { quizId: createdQuiz._id.toString() },
        { new: true }
      );
      if (updated) lessonsUpdated++;
    }

    return sendSuccess(res, {
      quizzesCreated: createdQuizzes.length,
      lessonsUpdated,
      totalLessons: lessons.length,
      quizzes: createdQuizzes,
    }, 'Quizzes populated successfully');
  } catch (error) {
    console.error('populate quizzes error:', error);
    return sendError(res, 500, 'Failed to populate quizzes');
  }
};

/**
 * Sync quiz IDs to lessons (in case they got out of sync)
 * POST /api/admin/sync/quiz-ids
 */
export const syncQuizIdsToLessons = async (req: Request, res: Response) => {
  try {
    const Quiz = require('../models/Quiz').Quiz;
    
    const quizzes = await Quiz.find();
    
    if (quizzes.length === 0) {
      return sendError(res, 404, 'No quizzes found. Please populate quizzes first.');
    }
    
    let lessonsUpdated = 0;
    let lessonsMissing = 0;
    
    for (const quiz of quizzes) {
      const lesson = await Lesson.findById(quiz.lessonId);
      
      if (!lesson) {
        lessonsMissing++;
        continue;
      }
      
      // Update lesson with quizId
      lesson.quizId = quiz._id.toString();
      await lesson.save();
      lessonsUpdated++;
    }
    
    return sendSuccess(res, {
      quizzesFound: quizzes.length,
      lessonsUpdated,
      lessonsMissing,
    }, 'Quiz IDs synced to lessons successfully');
  } catch (error) {
    console.error('sync quiz ids error:', error);
    return sendError(res, 500, 'Failed to sync quiz IDs');
  }
};
