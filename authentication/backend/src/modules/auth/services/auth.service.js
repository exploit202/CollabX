const bcrypt = require('bcrypt');
const User = require('../models/user.model');

const { generateToken } = require('../../../utils/jwt');

/**
 * Handle user authentication (login).
 *
 * @param {object} loginData - Validated credentials ({ email, password }).
 * @returns {Promise<object>} Object containing safe user object and generated JWT.
 */
const login = async (loginData) => {
  const { email, password } = loginData;

  // 1. Find user by email and explicitly retrieve password field (marked select: false)
  const user = await User.findOne({ email }).select('+password');

  // Generic authentication error message helper
  const throwAuthError = () => {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  };

  // 2. If user does not exist, throw generic error
  if (!user) {
    throwAuthError();
  }

  // Check if expected role matches user role if role was provided
  if (loginData.role && user.role !== loginData.role) {
    throwAuthError();
  }

  // 3. Compare password using bcrypt
  const isMatch = await bcrypt.compare(password, user.password);

  // 4. If password doesn't match, throw exact same generic error
  if (!isMatch) {
    throwAuthError();
  }

  // 5. Check if user account is active
  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.statusCode = 403;
    error.code = 'ACCOUNT_DEACTIVATED';
    throw error;
  }

  // 6. Generate JWT token
  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role
  });

  // 7. Update user's lastLogin timestamp
  user.lastLogin = new Date();
  await user.save();

  // 8. Return safe user data and the token
  const safeUser = user.toObject();
  delete safeUser.password;

  return {
    user: safeUser,
    token
  };
};

/**
 * Return safe current-user fields for the authenticated session.
 *
 * @param {import('mongoose').Document} user - Authenticated user document from verifyJWT.
 * @returns {object} Safe user profile fields.
 */
const getCurrentUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  isVerified: user.isVerified,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

module.exports = {
  login,
  getCurrentUser
};
