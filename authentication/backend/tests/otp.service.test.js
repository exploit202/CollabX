require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');
const bcrypt = require('bcrypt');

const Otp = require('../src/modules/auth/models/otp.model');
const otpService = require('../src/modules/auth/services/otp.service');

test('generateOtp creates/updates OTP and hashes it', async () => {
  const mockOtpDoc = {
    userId: 'user-id-123',
    otpHash: 'hashed-otp',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0
  };

  let savedHash = null;
  const findOneAndUpdateMock = mock.method(Otp, 'findOneAndUpdate', async (query, update, options) => {
    assert.equal(query.userId, 'user-id-123');
    savedHash = update.otpHash;
    return mockOtpDoc;
  });

  try {
    const result = await otpService.generateOtp('user-id-123');
    assert.equal(result.otpRecord, mockOtpDoc);
    assert.equal(result.plainOtp.length, 6);
    assert.ok(!isNaN(Number(result.plainOtp)));
    
    const isMatch = await bcrypt.compare(result.plainOtp, savedHash);
    assert.equal(isMatch, true);
  } finally {
    findOneAndUpdateMock.mock.restore();
  }
});

test('verifyOtp returns true and deletes OTP on correct code', async () => {
  const plainOtp = '123456';
  const hashedOtp = await bcrypt.hash(plainOtp, 10);
  const mockOtpDoc = {
    _id: 'doc-id-123',
    userId: 'user-id-123',
    otpHash: hashedOtp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0
  };

  const findOneMock = mock.method(Otp, 'findOne', async (query) => {
    assert.equal(query.userId, 'user-id-123');
    return mockOtpDoc;
  });

  let deleteCalled = false;
  const deleteOneMock = mock.method(Otp, 'deleteOne', async (query) => {
    assert.equal(query._id, 'doc-id-123');
    deleteCalled = true;
    return { deletedCount: 1 };
  });

  try {
    const success = await otpService.verifyOtp('user-id-123', plainOtp);
    assert.equal(success, true);
    assert.equal(deleteCalled, true);
  } finally {
    findOneMock.mock.restore();
    deleteOneMock.mock.restore();
  }
});

test('verifyOtp increments attempts and throws INVALID_OTP on incorrect code', async () => {
  const correctOtp = '123456';
  const incorrectOtp = '654321';
  const hashedOtp = await bcrypt.hash(correctOtp, 10);
  
  let savedAttempts = 0;
  const mockOtpDoc = {
    _id: 'doc-id-123',
    userId: 'user-id-123',
    otpHash: hashedOtp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 2,
    save: async function () {
      savedAttempts = this.attempts;
      return this;
    }
  };

  const findOneMock = mock.method(Otp, 'findOne', async () => mockOtpDoc);
  const deleteOneMock = mock.method(Otp, 'deleteOne', async () => {});

  try {
    await assert.rejects(
      () => otpService.verifyOtp('user-id-123', incorrectOtp),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'INVALID_OTP');
        assert.equal(error.message, 'Invalid OTP code.');
        return true;
      }
    );
    assert.equal(savedAttempts, 3);
  } finally {
    findOneMock.mock.restore();
    deleteOneMock.mock.restore();
  }
});

test('verifyOtp throws MAX_ATTEMPTS_EXCEEDED if attempts >= 5', async () => {
  const mockOtpDoc = {
    userId: 'user-id-123',
    otpHash: 'some-hash',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 5
  };

  const findOneMock = mock.method(Otp, 'findOne', async () => mockOtpDoc);

  try {
    await assert.rejects(
      () => otpService.verifyOtp('user-id-123', '123456'),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'MAX_ATTEMPTS_EXCEEDED');
        assert.equal(error.message, 'Maximum verification attempts exceeded.');
        return true;
      }
    );
  } finally {
    findOneMock.mock.restore();
  }
});

test('verifyOtp throws MAX_ATTEMPTS_EXCEEDED when incrementing attempts to 5', async () => {
  const correctOtp = '123456';
  const incorrectOtp = '654321';
  const hashedOtp = await bcrypt.hash(correctOtp, 10);
  
  let savedAttempts = 0;
  const mockOtpDoc = {
    userId: 'user-id-123',
    otpHash: hashedOtp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 4,
    save: async function () {
      savedAttempts = this.attempts;
      return this;
    }
  };

  const findOneMock = mock.method(Otp, 'findOne', async () => mockOtpDoc);

  try {
    await assert.rejects(
      () => otpService.verifyOtp('user-id-123', incorrectOtp),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'MAX_ATTEMPTS_EXCEEDED');
        assert.equal(error.message, 'Maximum verification attempts exceeded.');
        return true;
      }
    );
    assert.equal(savedAttempts, 5);
  } finally {
    findOneMock.mock.restore();
  }
});

test('verifyOtp throws OTP_EXPIRED if expired', async () => {
  const mockOtpDoc = {
    userId: 'user-id-123',
    otpHash: 'some-hash',
    expiresAt: new Date(Date.now() - 1000),
    attempts: 0
  };

  const findOneMock = mock.method(Otp, 'findOne', async () => mockOtpDoc);

  try {
    await assert.rejects(
      () => otpService.verifyOtp('user-id-123', '123456'),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'OTP_EXPIRED');
        assert.equal(error.message, 'OTP has expired.');
        return true;
      }
    );
  } finally {
    findOneMock.mock.restore();
  }
});

test('verifyOtp throws OTP_NOT_FOUND if record is missing', async () => {
  const findOneMock = mock.method(Otp, 'findOne', async () => null);

  try {
    await assert.rejects(
      () => otpService.verifyOtp('user-id-123', '123456'),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'OTP_NOT_FOUND');
        assert.equal(error.message, 'OTP does not exist or has expired.');
        return true;
      }
    );
  } finally {
    findOneMock.mock.restore();
  }
});

test('verifyOtp throws OTP_REQUIRED if otp input is empty or missing', async () => {
  try {
    await assert.rejects(
      () => otpService.verifyOtp('user-id-123', ''),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'OTP_REQUIRED');
        return true;
      }
    );
    await assert.rejects(
      () => otpService.verifyOtp('user-id-123', null),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'OTP_REQUIRED');
        return true;
      }
    );
  } finally {
  }
});
