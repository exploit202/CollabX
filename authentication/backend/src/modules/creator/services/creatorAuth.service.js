const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../auth/models/user.model');
const CreatorProfile = require('../models/creatorProfile.model');

/**
 * Handle Creator Registration section 1.
 *
 * @param {object} registrationData - Validated Creator registration payload.
 * @returns {Promise<object>} Safe user object without password.
 */
const registerCreator = async (registrationData) => {
  const {
    fullName,
    email,
    phoneNumber,
    primaryContentNiche,
    password
  } = registrationData;

  // 1. Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email address is already registered');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // 2. Check if phone number already exists in creator profiles
  const existingCreator = await CreatorProfile.findOne({ phoneNumber });
  if (existingCreator) {
    const error = new Error('Phone number is already registered');
    error.statusCode = 409;
    error.code = 'PHONE_NUMBER_ALREADY_EXISTS';
    throw error;
  }

  // 3. Hash password using existing bcrypt implementation
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 4. Start a Mongoose transaction for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 5. Create User document
    const [newUser] = await User.create(
      [
        {
          fullName,
          email,
          password: hashedPassword,
          role: 'creator',
          isVerified: false,
          isActive: true,
          registrationStatus: 'pending'
        }
      ],
      { session }
    );

    // 6. Create CreatorProfile document linked to the user
    await CreatorProfile.create(
      [
        {
          userId: newUser._id,
          phoneNumber,
          niche: [primaryContentNiche]
        }
      ],
      { session }
    );

    // 7. Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 8. Return safe response object
    return {
      userId: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const markRegistrationCompleted = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  if (user.role !== 'creator') {
    const error = new Error('Only creator accounts can complete registration');
    error.statusCode = 403;
    error.code = 'INVALID_USER_ROLE';
    throw error;
  }

  user.isVerified = true;
  user.registrationStatus = 'completed';

  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;

  return safeUser;
};

const updateCreatorPlatforms = async (userId, platforms) => {
  const creatorProfile = await CreatorProfile.findOne({ userId });

  if (!creatorProfile) {
    const error = new Error('Creator profile not found');
    error.statusCode = 404;
    error.code = 'CREATOR_PROFILE_NOT_FOUND';
    throw error;
  }

  const platformKeys = platforms.map((item) => (typeof item === 'string' ? item : item.platform));
  const uniqueKeys = new Set(platformKeys);
  if (uniqueKeys.size !== platformKeys.length) {
    const error = new Error('Duplicate platform entries provided');
    error.statusCode = 400;
    error.code = 'DUPLICATE_PLATFORM';
    throw error;
  }

  const normalizedPlatforms = [];
  for (const item of platforms) {
    const platform = typeof item === 'string' ? item : item.platform;
    const link = typeof item === 'object' && item.link ? item.link.trim() : '';

    if (link) {
      const isVerified = await verifyPlatformUrl(platform, link);
      if (!isVerified) {
        const error = new Error(`Platform link verification failed for ${platform}: ${link}`);
        error.statusCode = 400;
        error.code = 'UNVERIFIED_PLATFORM_LINK';
        throw error;
      }
    }

    normalizedPlatforms.push({ platform, link });
  }

  creatorProfile.platforms = normalizedPlatforms;
  await creatorProfile.save();

  const safeProfile = creatorProfile.toObject();
  delete safeProfile.__v;

  return safeProfile;
};

const isHostAllowedForPlatform = (hostname, platform) => {
  if (platform === 'instagram') {
    return hostname === 'instagram.com' || hostname.endsWith('.instagram.com');
  }
  if (platform === 'youtube') {
    return hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be' || hostname.endsWith('.youtu.be');
  }
  if (platform === 'twitter') {
    return hostname === 'twitter.com' || hostname.endsWith('.twitter.com') || hostname === 'x.com' || hostname.endsWith('.x.com');
  }
  return false;
};

const isProfileUrlReasonablyValid = (urlObj, platform) => {
  const segments = urlObj.pathname.split('/').filter(Boolean);
  
  if (platform === 'instagram') {
    if (segments.length === 0) return false;
    const reserved = ['about', 'developer', 'legal', 'accounts', 'explore', 'emails', 'direct', 'graphql', 'api', 'p', 'reel', 'reels', 'stories', 'static'];
    if (reserved.includes(segments[0].toLowerCase())) {
      return false;
    }
  } else if (platform === 'youtube') {
    if (segments.length === 0) return false;
    const reserved = ['feed', 'premium', 'trending', 'shorts', 'watch', 'playlist', 'results', 'kids', 'live', 'gaming', 'sports', 'learning', 'fashion', 'podcasts', 'about', 'press', 'creators', 'ads'];
    if (reserved.includes(segments[0].toLowerCase())) {
      return false;
    }
  } else if (platform === 'twitter') {
    if (segments.length === 0) return false;
    const reserved = ['home', 'explore', 'notifications', 'messages', 'i', 'settings', 'search', 'tos', 'privacy', 'about', 'login', 'signup', 'compose', 'logout'];
    if (reserved.includes(segments[0].toLowerCase())) {
      return false;
    }
  }
  
  return true;
};

const verifyPlatformUrl = async (platform, url) => {
  try {
    let parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    let currentUrl = url;
    let redirectsCount = 0;
    const maxRedirects = 5;
    let verified = false;

    while (redirectsCount < maxRedirects) {
      let urlObj;
      try {
        urlObj = new URL(currentUrl);
      } catch (_) {
        break;
      }

      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        break;
      }

      if (!isHostAllowedForPlatform(urlObj.hostname, platform) || !isProfileUrlReasonablyValid(urlObj, platform)) {
        break;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      let response;
      try {
        response = await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          },
          signal: controller.signal
        });
      } catch (err) {
        break;
      } finally {
        clearTimeout(timeoutId);
      }

      if (response.status >= 300 && response.status < 400) {
        let redirectUrl = response.headers.get('location');
        if (!redirectUrl) {
          break;
        }
        redirectUrl = new URL(redirectUrl, currentUrl).toString();
        currentUrl = redirectUrl;
        redirectsCount++;
      } else if (response.ok) {
        const finalUrlParsed = new URL(currentUrl);
        if (isHostAllowedForPlatform(finalUrlParsed.hostname, platform) && isProfileUrlReasonablyValid(finalUrlParsed, platform)) {
          verified = true;
        }
        break;
      } else {
        break;
      }
    }

    return verified;
  } catch (error) {
    return false;
  }
};

/**
 * Handle Creator authentication (login).
 *
 * @param {object} loginData - Validated credentials ({ email, password }).
 * @returns {Promise<object>} Object containing safe user object and generated JWT.
 */
const loginCreator = async (loginData) => {
  const { email, password } = loginData;
  const { generateToken } = require('../../../utils/jwt');

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

  // 3. Verify user role is creator
  if (user.role !== 'creator') {
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

  // 6. Generate JWT token
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
  registerCreator,
  markRegistrationCompleted,
  updateCreatorPlatforms,
  verifyPlatformUrl,
  loginCreator
};

