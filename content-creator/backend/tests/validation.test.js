const test = require('node:test');
const assert = require('node:assert/strict');
const { z } = require('zod');

const validateRequest = require('../src/middleware/validation.middleware');

test('validateRequest passes valid request data through', () => {
  const schema = z.object({
    name: z.string().min(2)
  });

  const req = {
    body: { name: 'Ada' }
  };

  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  validateRequest(schema)(req, res, next);

  assert.equal(nextCalled, true);
  assert.deepEqual(req.body, { name: 'Ada' });
  assert.equal(res.statusCode, null);
});

test('validateRequest returns standardized validation errors', () => {
  const schema = z.object({
    name: z.string().min(2)
  });

  const req = {
    body: { name: 'A' }
  };

  const res = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  validateRequest(schema)(req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.error.code, 'VALIDATION_ERROR');
  assert.ok(Array.isArray(res.payload.error.details));
  assert.equal(res.payload.error.details[0].field, 'name');
});
