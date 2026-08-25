const bcrypt = require('bcrypt');
const User = require('../../../models/user.model');
const Otp = require('../../../models/otp.model');
const { generateOtp, verifyOtp } = require('./otp.service');
const { sendOtpEmail } = require('./email.service');
const { generatePasswordResetToken, verifyPasswordResetToken } = require('../../../utils/jwt');

/**
 * Request password reset OTP for a given email address.
 * Prevents account enumeration by returning generic success if account not found.
 */
const requestPasswordReset = async (email) => {
  if (!email) {
    const error = new Error('Email address is required.');
    error.statusCode = 400;
    error.code = 'EMAIL_REQUIRED';
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  const genericResponse = {
    emailSent: true,
    message: 'If an account exists for this email, a verification code has been sent.'
  };

  if (!user) {
    return genericResponse;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.statusCode = 403;
    error.code = 'ACCOUNT_DEACTIVATED';
    throw error;
  }

  const { plainOtp } = await generateOtp(user._id, 'password_reset');
  const emailResult = await sendOtpEmail(user.email, plainOtp, {
    purpose: 'password_reset',
    role: user.role
  });

  if (!emailResult.success) {
    const error = new Error(emailResult.error || 'Failed to send password reset email.');
    error.statusCode = 500;
    error.code = 'EMAIL_SEND_FAILED';
    throw error;
  }

  return {
    ...genericResponse,
    ...(emailResult.devOtp && { devOtp: emailResult.devOtp })
  };
};

/**
 * Verify password reset OTP code.
 * Upon success, issues short-lived password reset token (15m).
 */
const verifyPasswordResetOtp = async (email, otp) => {
  if (!email) {
    const error = new Error('Email address is required.');
    error.statusCode = 400;
    error.code = 'EMAIL_REQUIRED';
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error('OTP does not exist or has expired.');
    error.statusCode = 400;
    error.code = 'OTP_NOT_FOUND';
    throw error;
  }

  await verifyOtp(user._id, otp, 'password_reset');

  const resetToken = generatePasswordResetToken({
    userId: user._id,
    email: user.email
  });

  return {
    verified: true,
    resetToken,
    email: user.email
  };
};

/**
 * Perform password reset using short-lived reset authorization token and new password.
 * Identifies the target user directly from the verified reset token payload (decoded.userId),
 * rather than trusting an email string provided by the client.
 * Updates password cleanly without automatically logging in the user.
 */
const performPasswordReset = async ({ password, resetToken, email }) => {
  if (!resetToken) {
    const error = new Error('Password reset authorization token is required.');
    error.statusCode = 401;
    error.code = 'RESET_TOKEN_REQUIRED';
    throw error;
  }

  // 1. Verify reset authorization token signature, expiration, and purpose ('password_reset_auth')
  const decoded = verifyPasswordResetToken(resetToken);

  // 2. Identify user directly from verified token payload
  const targetUserId = decoded.userId;
  const user = await User.findById(targetUserId).select('+password');

  if (!user) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  // 3. Optional sanity check if email parameter is also supplied by client
  if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const error = new Error('Reset token does not match the provided email address.');
    error.statusCode = 400;
    error.code = 'EMAIL_MISMATCH';
    throw error;
  }

  // 4. Hash new password using existing bcrypt mechanism
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 5. Update user password in MongoDB
  user.password = hashedPassword;
  await user.save();

  // 6. Invalidate leftover password reset OTPs for this user
  await Otp.deleteMany({ userId: user._id, purpose: 'password_reset' });

  return {
    success: true,
    message: 'Password updated successfully. Please log in with your new password.'
  };
};

module.exports = {
  requestPasswordReset,
  verifyPasswordResetOtp,
  performPasswordReset
};
