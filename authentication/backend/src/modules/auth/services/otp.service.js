const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Otp = require('../models/otp.model');

/**
 * Generate a cryptographically secure 6-digit OTP and hash it.
 * Updates or inserts the OTP record for the user.
 * 
 * @param {string} userId - User reference ID.
 * @returns {Promise<object>} Contains plain OTP and generated OTP record.
 */
const generateOtp = async (userId) => {
  if (!userId) {
    const error = new Error('User ID is required for OTP generation.');
    error.statusCode = 400;
    error.code = 'USER_ID_REQUIRED';
    throw error;
  }

  // 1. Generate 6-digit secure random integer
  const plainOtp = crypto.randomInt(100000, 1000000).toString();

  // 2. Hash the OTP using bcrypt (salt rounds: 10)
  const saltRounds = 10;
  const otpHash = await bcrypt.hash(plainOtp, saltRounds);

  // 3. Set expiration time to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 4. Update or insert the OTP record
  const otpRecord = await Otp.findOneAndUpdate(
    { userId },
    {
      otpHash,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
      createdAt: new Date()
    },
    { upsert: true, new: true, runValidators: true }
  );

  return {
    plainOtp,
    otpRecord
  };
};

/**
 * Verify a user's OTP code.
 * Increments attempts on failure. Deletes/invalidates the OTP record on success.
 * 
 * @param {string} userId - User reference ID.
 * @param {string} otp - The plain OTP entered by the user.
 * @returns {Promise<boolean>} Resolves to true on successful verification.
 */
const verifyOtp = async (userId, otp) => {
  if (!userId) {
    const error = new Error('User ID is required for OTP verification.');
    error.statusCode = 400;
    error.code = 'USER_ID_REQUIRED';
    throw error;
  }

  if (!otp || typeof otp !== 'string' || otp.trim().length === 0) {
    const error = new Error('OTP code is required.');
    error.statusCode = 400;
    error.code = 'OTP_REQUIRED';
    throw error;
  }

  const otpRecord = await Otp.findOne({ userId });

  // Missing OTP check
  if (!otpRecord) {
    const error = new Error('OTP does not exist or has expired.');
    error.statusCode = 400;
    error.code = 'OTP_NOT_FOUND';
    throw error;
  }

  // Check attempts first before checking match/expiry
  if (otpRecord.attempts >= 5) {
    const error = new Error('Maximum verification attempts exceeded.');
    error.statusCode = 400;
    error.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw error;
  }

  // Check expiration (in case TTL index hasn't run yet)
  if (new Date() > otpRecord.expiresAt) {
    const error = new Error('OTP has expired.');
    error.statusCode = 400;
    error.code = 'OTP_EXPIRED';
    throw error;
  }

  // Match comparison
  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);

  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    if (otpRecord.attempts >= 5) {
      const error = new Error('Maximum verification attempts exceeded.');
      error.statusCode = 400;
      error.code = 'MAX_ATTEMPTS_EXCEEDED';
      throw error;
    }

    const error = new Error('Invalid OTP code.');
    error.statusCode = 400;
    error.code = 'INVALID_OTP';
    throw error;
  }

  // Remove/invalidate OTP on success
  await Otp.deleteOne({ _id: otpRecord._id });

  return true;
};

module.exports = {
  generateOtp,
  verifyOtp
};
