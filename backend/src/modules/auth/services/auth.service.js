const bcrypt = require('bcrypt');
const User = require('../../../models/user.model');
const { generateAccessToken } = require('../../../utils/jwt');

/**
 * Handle user authentication (login).
 * @param {object} loginData - { email, password, role }
 * @returns {Promise<{ user: object, token: string }>}
 */
const login = async (loginData) => {
  const { email, password } = loginData;

  const user = await User.findOne({ email }).select('+password');

  const throwAuthError = () => {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  };

  if (!user) {
    throwAuthError();
  }

  if (loginData.role && user.role !== loginData.role) {
    throwAuthError();
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throwAuthError();
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.statusCode = 403;
    error.code = 'ACCOUNT_DEACTIVATED';
    throw error;
  }

  const token = generateAccessToken({
    userId: user._id,
    email: user.email,
    role: user.role
  });

  user.lastLogin = new Date();
  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;

  return {
    user: safeUser,
    token
  };
};

/**
 * Return safe profile object for authenticated session.
 * @param {import('mongoose').Document} user
 * @returns {object}
 */
const getCurrentUser = (user) => ({
  id: user._id,
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  isVerified: user.isVerified,
  isActive: user.isActive,
  registrationStatus: user.registrationStatus,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

module.exports = {
  login,
  getCurrentUser
};
