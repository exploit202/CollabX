const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const CreatorProfile = require('../../creator/models/creatorProfile.model');
const BrandProfile = require('../../brand/models/brandProfile.model');

const { generateToken } = require('../../../utils/jwt');

/**
 * Handle user and corresponding profile registration inside a database transaction.
 *
 * @param {object} registerData - Validated payload from request validation middleware.
 * @returns {Promise<object>} Safe user document without password.
 */
const register = async (registerData) => {
  const {
    fullName,
    email,
    password,
    role,
    profileImage,
    // Creator specific
    bio,
    niche,
    followers,
    engagementRate,
    portfolio,
    // Brand specific
    companyName,
    industry,
    aboutBrand,
    companyLogo,
    website,
    // Common profile fields
    location,
    socialLinks
  } = registerData;

  // 1. Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email address is already registered');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // 2. Hash password securely
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 3. Start a Mongoose session for atomicity (transactions)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 4. Create User document
    const [newUser] = await User.create(
      [
        {
          fullName,
          email,
          password: hashedPassword,
          role,
          profileImage: profileImage || null,
          isVerified: false,
          isActive: true
        }
      ],
      { session }
    );

    // 5. Create Profile document based on User's role
    if (role === 'creator') {
      await CreatorProfile.create(
        [
          {
            userId: newUser._id,
            bio: bio || '',
            niche: niche || [],
            followers: followers || 0,
            engagementRate: engagementRate || 0.0,
            portfolio: portfolio || [],
            location: location || {},
            socialLinks: {
              instagram: socialLinks?.instagram || null,
              youtube: socialLinks?.youtube || null,
              tiktok: socialLinks?.tiktok || null,
              twitter: socialLinks?.twitter || null,
              facebook: socialLinks?.facebook || null
            }
          }
        ],
        { session }
      );
    } else if (role === 'brand') {
      await BrandProfile.create(
        [
          {
            userId: newUser._id,
            companyName,
            industry: industry || '',
            aboutBrand: aboutBrand || '',
            companyLogo: companyLogo || null,
            website: website || null,
            location: location || {},
            socialLinks: {
              instagram: socialLinks?.instagram || null,
              linkedin: socialLinks?.linkedin || null,
              twitter: socialLinks?.twitter || null,
              facebook: socialLinks?.facebook || null
            }
          }
        ],
        { session }
      );
    }

    // 6. Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // 7. Retrieve the user representation without the password field
    const safeUser = newUser.toObject();
    delete safeUser.password;

    return safeUser;
  } catch (error) {
    // Abort transaction in case of any failures
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

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

module.exports = {
  register,
  login
};
