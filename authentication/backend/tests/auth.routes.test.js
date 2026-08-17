const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cookieParser = require('cookie-parser');

const authRouter = require('../src/modules/auth/routes/auth.routes');
const errorHandler = require('../src/middleware/error.middleware');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRouter);
  app.use(errorHandler);
  return app;
};

const startServer = async (app) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  return server;
};

const stopServer = async (server) => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
};

test('GET /api/auth/me returns 401 when no auth cookie is present', async () => {
  const app = createTestApp();
  const server = await startServer(app);

  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/me`);
    const payload = await response.json();

    assert.equal(response.status, 401);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, 'AUTH_TOKEN_MISSING');
  } finally {
    await stopServer(server);
  }
});

test('POST /api/auth/logout clears the auth cookie and returns success', async () => {
  const app = createTestApp();
  const server = await startServer(app);

  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/logout`, {
      method: 'POST'
    });
    const payload = await response.json();
    const setCookieHeader = response.headers.get('set-cookie') || '';

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.match(setCookieHeader, /token=/);
    assert.match(setCookieHeader, /Expires=/i);
  } finally {
    await stopServer(server);
  }
});
