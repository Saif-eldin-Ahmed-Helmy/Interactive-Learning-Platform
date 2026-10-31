import { createHash } from 'crypto';

export const demoId = (name: string) => createHash('sha256').update('college-demo:' + name).digest('hex').slice(0, 24);
export const demoLearners = [
  { key: 'saif', name: 'Saif eldin Ahmed Helmy', email: 'saif@demo.example.test' },
  { key: 'maaly', name: 'Maaly Samir elsaied', email: 'maaly@demo.example.test' },
];

const topics = [
  { key: 'html', title: 'HTML Essentials', image: 'html.jpg', hours: 12, difficulty: 'beginner',
    description: 'Build meaningful web pages with headings, links, images and accessible forms.',
    modules: ['HTML Foundations', 'Content and Forms'], video: 'UB1O30fR-EE',
    lessons: ['Your First HTML Page', 'Headings and Paragraphs', 'Links and Images', 'Forms and Labels'],
    question: 'Which element represents the main heading?', options: ['<p>', '<h1>', '<img>', '<input>'], correct: 1 },
  { key: 'css', title: 'CSS and Responsive Layouts', image: 'CSS.jpg', hours: 9, difficulty: 'beginner',
    description: 'Style your pages and build layouts that adapt to phones, tablets and laptops.',
    modules: ['Styling Foundations', 'Responsive Layout'], video: 'yfoY53QXEnI',
    lessons: ['Selectors and Colors', 'The Box Model', 'Flexbox Layout', 'Responsive Design'],
    question: 'Which property changes the text color?', options: ['padding', 'display', 'color', 'margin'], correct: 2 },
  { key: 'javascript', title: 'JavaScript Fundamentals', image: 'js.jpg', hours: 15, difficulty: 'intermediate',
    description: 'Add interaction with variables, functions, arrays and browser events.',
    modules: ['Language Foundations', 'Browser Interaction'], video: 'W6NZfCO5SIk',
    lessons: ['Variables and Types', 'Functions', 'Arrays and Objects', 'DOM Events'],
    question: 'Which keyword declares a variable that can be reassigned?', options: ['let', 'const', 'return', 'import'], correct: 0 },
  { key: 'react', title: 'React Components and State', image: 'react.jpg', hours: 33, difficulty: 'intermediate',
    description: 'Compose reusable interfaces and connect user actions to state and API data.',
    modules: ['Component Foundations', 'Interactive Components'], video: 'w7ejDZ8SWv8',
    lessons: ['Components and JSX', 'Props', 'State and Events', 'Effects and API Data'],
    question: 'Which Hook stores a value that affects the interface?', options: ['useRef', 'useState', 'useNavigate', 'useParams'], correct: 1 },
];

export const demoCourses = topics.map(topic => {
  const courseId = demoId(topic.key);
  const lessons = topic.lessons.map((title, index) => ({
    _id: demoId(topic.key + '-lesson-' + index), courseId, title,
    description: `Learn ${title.toLowerCase()}, then try the exercise and a short knowledge check.`,
    moduleIndex: Math.floor(index / 2), order: index % 2 + 1, contentType: 'mixed',
    videoUrl: 'https://www.youtube.com/watch?v=' + topic.video,
    estimatedMinutes: 15 + index * 5, pointsReward: 10,
    quizId: demoId(topic.key + '-quiz-' + index),
    codeExercise: {
      starterCode: '<!DOCTYPE html>\n<html lang="en">\n<head>\n<style>body { font-family: sans-serif; padding: 24px; } h1 { color: #1478d4; }</style>\n</head>\n<body>\n  <!-- Edit the heading below -->\n  <h1>My first page</h1>\n  <p>I am practicing frontend development.</p>\n</body>\n</html>',
      hints: ['Find the h1 element.', 'Replace My first page with Hello, learner!'],
      expectedOutput: 'Hello, learner!', testCases: [],
    },
  }));
  return {
    course: { _id: courseId, title: topic.title, description: topic.description,
      category: topic.key === 'javascript' ? 'JavaScript' : topic.key.toUpperCase(),
      difficulty: topic.difficulty, estimatedHours: topic.hours, thumbnailUrl: '/Images/' + topic.image,
      creatorId: demoId('teacher'), isPublished: true, enrollmentCount: topic.key === 'html' || topic.key === 'css' ? 2 : 0,
      modules: topic.modules.map((title, index) => ({ title, order: index + 1, lessons: lessons.slice(index * 2, index * 2 + 2).map(lesson => lesson._id) })) },
    lessons,
    quizzes: lessons.map(lesson => ({ _id: lesson.quizId, lessonId: lesson._id, title: lesson.title + ' Quiz', passingScore: 70,
      questions: [{ question: topic.question, options: topic.options, correctAnswerIndex: topic.correct,
        explanation: topic.options[topic.correct] + ' is the correct choice.', points: 10 },
      { question: 'What is the purpose of practicing after a lesson?', options: ['Skip the lesson', 'Apply what you learned', 'Change your account role', 'Delete the course'],
        correctAnswerIndex: 1, explanation: 'Practice lets you apply a concept yourself.', points: 10 }] })),
  };
});

export const demoAchievements = [
  { name: 'First Steps', description: 'Complete your first lesson.', iconUrl: '🌱', category: 'milestone', type: 'lesson_count', value: 1 },
  { name: 'Learning Momentum', description: 'Complete five lessons.', iconUrl: '🚀', category: 'milestone', type: 'lesson_count', value: 5 },
  { name: 'Course Finisher', description: 'Complete your first course.', iconUrl: '🏆', category: 'general', type: 'course_count', value: 1 },
  { name: 'Three Day Streak', description: 'Return to learn on three days.', iconUrl: '🔥', category: 'streak', type: 'streak', value: 3 },
  { name: 'A Week of Learning', description: 'Reach a seven day learning streak.', iconUrl: '⭐', category: 'streak', type: 'streak', value: 7 },
  { name: 'Ten Lessons', description: 'Complete ten lessons across your courses.', iconUrl: '📚', category: 'milestone', type: 'lesson_count', value: 10 },
];
