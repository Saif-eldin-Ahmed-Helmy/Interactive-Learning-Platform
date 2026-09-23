const assert = require('node:assert/strict');
const { test } = require('node:test');
const { gradeQuiz } = require('../dist/utils/gradeQuiz');
const mongoose = require('mongoose');
const { Quiz } = require('../dist/models/Quiz');
const { Lesson } = require('../dist/models/Lesson');
const { Progress } = require('../dist/models/Progress');
const { User } = require('../dist/models/User');
const { Challenge } = require('../dist/models/Challenge');
const { submitQuizAttempt } = require('../dist/controllers/quizController');
const { submitChallengeResult } = require('../dist/controllers/challengeController');
const questions = [
  { question: 'A', options: ['a', 'b'], correctAnswerIndex: 0, points: 10 },
  { question: 'B', options: ['a', 'b'], correctAnswerIndex: 1, points: 30 },
];
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('wrong and unanswered responses score zero; weighted scores determine passing', () => {
  assert.deepEqual(gradeQuiz(questions, [1, -1], 70), { score: 0, totalPoints: 40, percentage: 0, passed: false });
  assert.deepEqual(gradeQuiz(questions, [1, 1], 70), { score: 30, totalPoints: 40, percentage: 75, passed: true });
  assert.equal(gradeQuiz(questions, [0, 0], 70).passed, false);
  for (const answers of [[], [0], [0, 1, 2], [0, '1'], [0, 2], [0, -2]]) {
    assert.throws(() => gradeQuiz(questions, answers, 70));
  }
});

test('quiz submission rejects a course mismatch and does not reward repeat passes', async (t) => {
  t.mock.method(mongoose.connection, 'transaction', async callback => callback(undefined));
  t.mock.method(Quiz, 'findById', async () => ({ lessonId: 'lesson', questions, passingScore: 70 }));
  t.mock.method(Lesson, 'findById', async () => ({ _id: 'lesson', courseId: 'course' }));
  const rewards = t.mock.method(User, 'findByIdAndUpdate', async () => ({}));
  const writes = [];
  t.mock.method(Progress, 'findOne', async () => ({ _id: 'progress' }));
  t.mock.method(Progress, 'findOneAndUpdate', async (filter, update) => {
    assert.deepEqual(filter.quizAttempts, { $not: { $elemMatch: { quizId: 'quiz', passed: true } } });
    assert.equal(update.$push.quizAttempts.score, 40);
    return null; // A passing attempt already exists (including a concurrent winner).
  });
  t.mock.method(Progress, 'updateOne', async (_filter, update) => writes.push(update));
  const req = { params: { quizId: 'quiz' }, session: { userId: 'student' }, body: { answers: [0, 1], lessonId: 'lesson', courseId: 'wrong' } };
  let res = response();
  await submitQuizAttempt(req, res);
  assert.equal(res.statusCode, 400);
  req.body.courseId = 'course'; res = response();
  await submitQuizAttempt(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(writes.length, 1);
  assert.equal(rewards.mock.callCount(), 0);
});

test('challenge scoring ignores a forged score and grades stored quiz answers', async (t) => {
  t.mock.method(mongoose.connection, 'transaction', async callback => callback(undefined));
  t.mock.method(Challenge, 'findOne', async () => ({ challengerId: 'student', opponentId: 'opponent', quizId: 'quiz' }));
  t.mock.method(Quiz, 'findById', async () => ({ questions, passingScore: 70 }));
  let savedScore;
  t.mock.method(Challenge, 'findOneAndUpdate', async (_filter, update) => {
    savedScore = update.challengerScore;
    return { challengerScore: savedScore };
  });
  const res = response();
  await submitChallengeResult({ params: { id: 'challenge' }, session: { userId: 'student' }, body: { score: 100, answers: [1, 0] } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(savedScore, 0);
});
