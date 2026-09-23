const assert = require('node:assert/strict');
const { test } = require('node:test');
const { randomUUID } = require('node:crypto');
const express = require('express');
const mongoose = require('mongoose');
const { User } = require('../dist/models/User');
const { Course } = require('../dist/models/Course');
const { register } = require('../dist/controllers/authController');
const { registerValidation } = require('../dist/middleware/validation');
const { getAllCourses, getCourseById, updateCourse } = require('../dist/controllers/courseController');
const adminRoutes = require('../dist/routes/adminRoutes').default;

const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('seed endpoints reject anonymous/non-admin requests and no longer mutate on GET', async () => {
  const app = express();
  app.use((req, _res, next) => {
    req.session = { userId: req.headers['x-test-user'], userRole: req.headers['x-test-role'] };
    next();
  });
  app.use('/admin', adminRoutes);
  const server = app.listen(0);
  try {
    const url = `http://127.0.0.1:${server.address().port}/admin`;
    for (const path of ['/courses/populate', '/seed/achievements', '/seed/quizzes']) {
      assert.equal((await fetch(url + path)).status, 404);
      assert.equal((await fetch(url + path, { method: 'POST' })).status, 401);
      assert.equal((await fetch(url + path, { method: 'POST', headers: { 'x-test-user': 'student', 'x-test-role': 'student' } })).status, 403);
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('public registration cannot assign a privileged role', async (t) => {
  t.mock.method(User, 'findOne', async () => null);
  const create = t.mock.method(User, 'create', async data => ({ _id: 'new-user', role: data.role }));
  const app = express();
  app.use(express.json());
  app.post('/register', registerValidation, register);
  const server = app.listen(0);
  try {
    const url = `http://127.0.0.1:${server.address().port}/register`;
    const account = { name: 'Student', email: 'student@example.com', password: 'test-password' };
    const send = body => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal((await send({ ...account, role: 'teacher' })).status, 400);
    assert.equal((await send({ ...account, role: 'admin' })).status, 400);
    assert.equal(create.mock.callCount(), 0);
    const created = await send(account);
    assert.equal(created.status, 201);
    assert.equal(create.mock.calls[0].arguments[0].role, 'student');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('draft course queries include only the creator or an admin', async (t) => {
  const found = [];
  t.mock.method(Course, 'find', filter => {
    found.push(filter);
    return { populate() { return this; }, sort: async () => [] };
  });
  const details = [];
  t.mock.method(Course, 'findOne', filter => {
    details.push(filter);
    return { populate() { return this; }, then: resolve => Promise.resolve(null).then(resolve) };
  });
  for (const [role, expected] of [
    ['student', { isPublished: true }],
    ['teacher', { $or: [{ isPublished: true }, { creatorId: 'user-1' }] }],
    ['admin', {}],
  ]) {
    const req = { session: { userId: 'user-1', userRole: role }, params: { id: 'course-1' } };
    await getAllCourses(req, response());
    await getCourseById(req, response());
    assert.deepEqual(found.pop(), expected);
    assert.deepEqual(details.pop(), { _id: 'course-1', ...expected });
  }
});

test('course updates ignore ownership, publication and operator fields', async (t) => {
  t.mock.method(Course, 'findById', async () => ({ creatorId: 'teacher-1' }));
  const update = t.mock.method(Course, 'findByIdAndUpdate', async (_id, changes) => changes);
  const req = { params: { id: 'course-1' }, session: { userId: 'teacher-1', userRole: 'teacher' }, body: {
    title: 'Updated title', creatorId: 'attacker', isPublished: true, enrollmentCount: 999,
    modules: [], $set: { isPublished: true },
  } };
  const res = response();
  await updateCourse(req, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(update.mock.calls[0].arguments[1], { $set: { title: 'Updated title' } });
  assert.equal(update.mock.calls[0].arguments[2].runValidators, true);
  req.body = { isPublished: true };
  assert.equal((await updateCourse(req, response())).statusCode, 400);
  assert.equal(update.mock.callCount(), 1);
});

test('MongoDB keeps draft course details private to their owner and admins', { skip: !process.env.MONGODB_TEST_URI }, async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName: 'course_access_' + randomUUID().replaceAll('-', '') });
  try {
    const creator = await User.create({ name: 'Creator', email: 'creator@example.com', password: 'test-only-password', role: 'teacher' });
    const other = await User.create({ name: 'Other', email: 'other@example.com', password: 'test-only-password', role: 'teacher' });
    const draft = await Course.create({ title: 'Draft', description: 'Private course', category: 'Science', creatorId: String(creator._id) });
    for (const [role, userId, expected] of [
      ['student', 'student-1', 404],
      ['teacher', String(other._id), 404],
      ['teacher', String(creator._id), 200],
      ['admin', 'admin-1', 200],
    ]) {
      const res = response();
      await getCourseById({ params: { id: String(draft._id) }, session: { userRole: role, userId } }, res);
      assert.equal(res.statusCode, expected);
    }
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
