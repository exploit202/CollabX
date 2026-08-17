const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Otp = require('../../../models/otp.model');

const generateOtp = async (userId) => {
  if (!userId) {
    const error = new Error('User ID is required for OTP generation.');
    error.statusCode = 400;
    error.code = 'USER_ID_REQUIRED';
    throw error;
  }

  const plainOtp = crypto.randomInt(100000, 1000000).toString();
  const saltRounds = 10;
  const otpHash = await bcrypt.hash(plainOtp, saltRounds);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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

  if (!otpRecord) {
    const error = new Error('OTP does not exist or has expired.');
    error.statusCode = 400;
    error.code = 'OTP_NOT_FOUND';
    throw error;
  }

  if (otpRecord.attempts >= 5) {
    const error = new Error('Maximum verification attempts exceeded.');
    error.statusCode = 400;
    error.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw error;
  }

  if (new Date() > otpRecord.expiresAt) {
    const error = new Error('OTP has expired.');
    error.statusCode = 400;
    error.code = 'OTP_EXPIRED';
    throw error;
  }

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

  await Otp.deleteOne({ _id: otpRecord._id });
  return true;
};

module.exports = {
  generateOtp,
  verifyOtp
};
