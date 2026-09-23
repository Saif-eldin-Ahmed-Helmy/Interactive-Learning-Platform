const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const { User } = require('../dist/models/User');
const { Lesson } = require('../dist/models/Lesson');
const { Quiz } = require('../dist/models/Quiz');
const { Progress } = require('../dist/models/Progress');
const { Challenge } = require('../dist/models/Challenge');
const { Notification } = require('../dist/models/Notification');
const { submitQuizAttempt } = require('../dist/controllers/quizController');
const { submitChallengeResult } = require('../dist/controllers/challengeController');
const response = () => ({ statusCode: 200, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; } });

test('quiz rewards roll back on failure and concurrent passes reward once', { skip: !process.env.MONGODB_TEST_URI }, async t => {
  await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName: 'learning_test_' + randomUUID().replaceAll('-', '') });
  try {
    await Promise.all([User.init(), Progress.init(), Quiz.init(), Challenge.init(), Notification.init()]);
    const user = await User.create({ name: 'Student', email: 'student@example.com', password: 'test-only-password' });
    const opponent = await User.create({ name: 'Opponent', email: 'opponent@example.com', password: 'test-only-password' });
    const lesson = await Lesson.create({ courseId: 'course', moduleIndex: 0, order: 0, title: 'Lesson', description: 'Test', contentType: 'text' });
    const quiz = await Quiz.create({ lessonId: String(lesson._id), title: 'Quiz', questions: [{ question: '1+1?', options: ['2', '3'], correctAnswerIndex: 0, explanation: 'Addition', points: 10 }] });
    await Progress.create({ userId: String(user._id), courseId: 'course' });
    const req = { params: { quizId: String(quiz._id) }, session: { userId: String(user._id) }, body: { lessonId: String(lesson._id), courseId: 'course', answers: [0] } };
    const failing = t.mock.method(User, 'findByIdAndUpdate', async () => { throw Error('simulated write failure'); });
    const failed = response(); await submitQuizAttempt(req, failed); assert.equal(failed.statusCode, 500);
    assert.equal((await Progress.findOne({ userId: String(user._id) })).quizAttempts.length, 0);
    failing.mock.restore();
    const results = await Promise.all(Array.from({ length: 8 }, async () => { const res = response(); await submitQuizAttempt(req, res); return res; }));
    assert.ok(results.every(r => r.statusCode === 200));
    assert.equal((await User.findById(user._id)).points, 10);
    assert.equal((await Progress.findOne({ userId: String(user._id) })).quizAttempts.length, 8);
    const challenge = await Challenge.create({ challengerId: String(user._id), opponentId: String(opponent._id), quizId: String(quiz._id), status: 'accepted' });
    const attempts = [[user, [0]], [opponent, [1]]].map(async ([player, answers]) => {
      const res = response(); await submitChallengeResult({ params: { id: String(challenge._id) }, session: { userId: String(player._id) }, body: { answers } }, res); return res;
    });
    assert.ok((await Promise.all(attempts)).every(r => r.statusCode === 200));
    assert.equal((await Challenge.findById(challenge._id)).status, 'completed');
    assert.equal((await User.findById(user._id)).points, 40);
    assert.equal(await Notification.countDocuments(), 2);
  } finally {
    await mongoose.connection.dropDatabase(); await mongoose.disconnect();
  }
});
