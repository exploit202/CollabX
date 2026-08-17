const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../auth/models/user.model');
const BrandProfile = require('../models/brandProfile.model');
const { generateToken } = require('../../../utils/jwt');

/**
 * Handle Brand Registration using the existing project transaction and error conventions.
 *
 * @param {object} registrationData - Validated Brand Registration payload.
 * @returns {Promise<object>} Safe user object without the password.
 */
const registerBrand = async (registrationData) => {
  const {
    companyName,
    workEmail,
    password,
    industryType,
    aboutBrand
  } = registrationData;

  // 1. Check if work email already exists
  const existingUser = await User.findOne({ email: workEmail });
  if (existingUser) {
    const error = new Error('Work email address is already registered');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // 2. Hash password using existing bcrypt implementation
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 3. Start a Mongoose session for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 4. Create User document
    const [newUser] = await User.create(
      [
        {
          fullName: companyName,
          email: workEmail,
          password: hashedPassword,
          role: 'brand',
          isVerified: false,
          isActive: true
        }
      ],
      { session }
    );

    // 5. Create BrandProfile document linked to the user
    await BrandProfile.create(
      [
        {
          userId: newUser._id,
          companyName,
          industry: industryType || '',
          aboutBrand: aboutBrand || ''
        }
      ],
      { session }
    );

    // 6. Commit transaction
    await session.commitTransaction();
    session.endSession();

    const safeUser = newUser.toObject();
    delete safeUser.password;
    return safeUser;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Handle Brand Owner authentication (login).
 *
 * @param {object} loginData - Validated credentials ({ email, password }).
 * @returns {Promise<object>} Object containing safe user object and generated JWT.
 */
const loginBrand = async (loginData) => {
  const { email, password } = loginData;

  // 1. Find user by email and retrieve password field
  const user = await User.findOne({ email }).select('+password');

  const throwAuthError = () => {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  };

  // 2. If user not found, throw generic auth error
  if (!user) {
    throwAuthError();
  }

  // 3. Verify user role is brand
  if (user.role !== 'brand') {
    throwAuthError();
  }

  // 4. Compare password using bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
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

  // 6. Generate JWT token using existing JWT configuration
  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role
  });

  // 7. Update lastLogin
  user.lastLogin = new Date();
  await user.save();

  // 8. Return safe user object without password
  const safeUser = user.toObject();
  delete safeUser.password;

  return {
    user: safeUser,
    token
  };
};

module.exports = {
  registerBrand,
  loginBrand
};

