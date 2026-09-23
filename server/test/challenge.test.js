const assert = require('node:assert/strict');
const { test } = require('node:test');
const { Challenge } = require('../dist/models/Challenge');
const { acceptChallenge, submitChallengeResult } = require('../dist/controllers/challengeController');

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('only the pending challenge opponent can accept', async () => {
  const original = Challenge.findOneAndUpdate;
  try {
    Challenge.findOneAndUpdate = async (filter) => {
      assert.deepEqual(filter, { _id: 'challenge', opponentId: 'opponent', status: 'pending' });
      return null;
    };
    const res = response();
    await acceptChallenge({ params: { id: 'challenge' }, session: { userId: 'opponent' } }, res);
    assert.equal(res.statusCode, 404);
  } finally {
    Challenge.findOneAndUpdate = original;
  }
});

test('a nonparticipant cannot submit a challenge result', async () => {
  const original = Challenge.findOne;
  try {
    Challenge.findOne = async (filter) => {
      assert.deepEqual(filter, {
        _id: 'challenge', status: 'accepted',
        $or: [{ challengerId: 'stranger' }, { opponentId: 'stranger' }],
      });
      return null;
    };
    const res = response();
    await submitChallengeResult({ params: { id: 'challenge' }, body: { score: 50 }, session: { userId: 'stranger' } }, res);
    assert.equal(res.statusCode, 404);
  } finally {
    Challenge.findOne = original;
  }
});
