const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Lesson } = require('../dist/models/Lesson');
const { Progress } = require('../dist/models/Progress');
const { getVideoProgress, saveVideoProgress, updateLessonProgress } = require('../dist/controllers/progressController');
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('video progress reads and writes are scoped to the lesson course', async (t) => {
  t.mock.method(Lesson, 'findById', async () => ({ courseId: 'course-b' }));
  const queries = [];
  let saves = 0;
  t.mock.method(Progress, 'findOne', async (query) => {
    queries.push(query);
    return { videoProgress: [], save: async () => { saves++; } };
  });
  const req = { params: { lessonId: 'lesson-b' }, session: { userId: 'student' }, body: { currentTime: 12 } };
  await getVideoProgress(req, response());
  await saveVideoProgress(req, response());
  assert.deepEqual(queries, [ { userId: 'student', courseId: 'course-b' }, { userId: 'student', courseId: 'course-b' } ]);
  assert.equal(saves, 1);
});

test('progress rejects a mismatched lesson and invalid playback time without writing', async (t) => {
  t.mock.method(Lesson, 'findById', async () => ({ courseId: 'course-b' }));
  const writes = t.mock.method(Progress, 'findOne', async () => { throw Error('must not query'); });
  const req = { params: { lessonId: 'lesson-b', courseId: 'course-a' }, session: { userId: 'student' }, body: {} };
  let res = response();
  await updateLessonProgress(req, res);
  assert.equal(res.statusCode, 400);
  for (const currentTime of ['12', -1, Infinity]) {
    res = response(); req.body = { currentTime };
    await saveVideoProgress(req, res);
    assert.equal(res.statusCode, 400);
  }
  assert.equal(writes.mock.callCount(), 0);
});
