require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Load JWT secrets & ENV vars
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '7d';

const User = require('../src/modules/auth/models/user.model');
const otpService = require('../src/modules/auth/services/otp.service');
const emailService = require('../src/modules/auth/services/email.service');
const creatorRouter = require('../src/modules/creator');
const errorHandler = require('../src/middleware/error.middleware');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/creator', creatorRouter);
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

const MOCK_USER_ID = '60c72b2f9b1d8e1f88c88888';

const mockUser = {
  _id: MOCK_USER_ID,
  email: 'creator-test@example.com',
  role: 'creator',
  registrationStatus: 'pending',
  isActive: true
};

test('POST /api/creator/otp/send successfully generates and sends OTP', async () => {
  const userFindByIdMock = mock.method(User, 'findById', async () => mockUser);
  const generateOtpMock = mock.method(otpService, 'generateOtp', async () => ({
    plainOtp: '123456',
    otpRecord: { userId: MOCK_USER_ID }
  }));
  const sendOtpEmailMock = mock.method(emailService, 'sendOtpEmail', async () => ({
    success: true
  }));

  const app = createTestApp();
  const server = await startServer(app);

  try {
    const signupToken = jwt.sign(
      { userId: MOCK_USER_ID, type: 'signup', registrationStatus: 'pending', role: 'creator' },
      process.env.JWT_SECRET
    );

    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/creator/otp/send`, {
      method: 'POST',
      headers: {
        'Cookie': `signupToken=${signupToken}`
      }
    });

    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.message, 'Verification code sent successfully to your registered email.');
    assert.equal(generateOtpMock.mock.callCount(), 1);
    assert.equal(sendOtpEmailMock.mock.callCount(), 1);
  } finally {
    userFindByIdMock.mock.restore();
    generateOtpMock.mock.restore();
    sendOtpEmailMock.mock.restore();
    await stopServer(server);
  }
});

test('POST /api/creator/otp/verify successfully verifies OTP', async () => {
  const userFindByIdMock = mock.method(User, 'findById', async () => mockUser);
  const verifyOtpMock = mock.method(otpService, 'verifyOtp', async () => true);

  const app = createTestApp();
  const server = await startServer(app);

  try {
    const signupToken = jwt.sign(
      { userId: MOCK_USER_ID, type: 'signup', registrationStatus: 'pending', role: 'creator' },
      process.env.JWT_SECRET
    );

    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/creator/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `signupToken=${signupToken}`
      },
      body: JSON.stringify({ otp: '123456' })
    });

    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.message, 'OTP verified successfully.');
    assert.equal(verifyOtpMock.mock.callCount(), 1);
  } finally {
    userFindByIdMock.mock.restore();
    verifyOtpMock.mock.restore();
    await stopServer(server);
  }
});

test('POST /api/creator/otp/verify returns validation error for invalid formats', async () => {
  const userFindByIdMock = mock.method(User, 'findById', async () => mockUser);
  const app = createTestApp();
  const server = await startServer(app);

  try {
    const signupToken = jwt.sign(
      { userId: MOCK_USER_ID, type: 'signup', registrationStatus: 'pending', role: 'creator' },
      process.env.JWT_SECRET
    );

    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/creator/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `signupToken=${signupToken}`
      },
      body: JSON.stringify({ otp: '123' }) // Too short
    });

    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, 'VALIDATION_ERROR');
    assert.equal(payload.error.details[0].message, 'OTP must be exactly 6 digits');
  } finally {
    userFindByIdMock.mock.restore();
    await stopServer(server);
  }
});

test('POST /api/creator/otp/verify forwards verification service errors', async () => {
  const userFindByIdMock = mock.method(User, 'findById', async () => mockUser);
  const verifyOtpMock = mock.method(otpService, 'verifyOtp', async () => {
    const error = new Error('Invalid OTP code.');
    error.statusCode = 400;
    error.code = 'INVALID_OTP';
    throw error;
  });

  const app = createTestApp();
  const server = await startServer(app);

  try {
    const signupToken = jwt.sign(
      { userId: MOCK_USER_ID, type: 'signup', registrationStatus: 'pending', role: 'creator' },
      process.env.JWT_SECRET
    );

    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/creator/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `signupToken=${signupToken}`
      },
      body: JSON.stringify({ otp: '123456' })
    });

    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, 'INVALID_OTP');
    assert.equal(payload.message, 'Invalid OTP code.');
  } finally {
    userFindByIdMock.mock.restore();
    verifyOtpMock.mock.restore();
    await stopServer(server);
  }
});
