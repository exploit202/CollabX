const bcrypt = require('bcrypt');
const User = require('../../../models/user.model');
const CreatorProfile = require('../../../models/creatorProfile.model');
const { generateAccessToken } = require('../../../utils/jwt');

const isHostAllowedForPlatform = (hostname, platform) => {
  const plat = platform.toLowerCase();
  const host = hostname.toLowerCase();

  if (plat === 'instagram') {
    return host === 'instagram.com' || host.endsWith('.instagram.com');
  }
  if (plat === 'youtube') {
    return host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be' || host.endsWith('.youtu.be');
  }
  if (plat === 'twitter' || plat === 'x') {
    return host === 'twitter.com' || host.endsWith('.twitter.com') || host === 'x.com' || host.endsWith('.x.com');
  }
  return false;
};

const isProfileUrlReasonablyValid = (urlObj, platform) => {
  const plat = platform.toLowerCase();
  const segments = urlObj.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return { valid: false, reason: 'URL does not contain a profile path or handle.' };

  const firstSeg = segments[0].toLowerCase();

  if (plat === 'instagram') {
    const reserved = ['about', 'developer', 'legal', 'accounts', 'explore', 'emails', 'direct', 'graphql', 'api', 'p', 'reel', 'reels', 'stories', 'static'];
    if (reserved.includes(firstSeg)) {
      return { valid: false, reason: 'URL points to an Instagram post, reel, story, or system page instead of a user profile.' };
    }
  } else if (plat === 'youtube') {
    const reserved = ['feed', 'premium', 'trending', 'shorts', 'watch', 'playlist', 'results', 'kids', 'live', 'gaming', 'sports', 'learning', 'fashion', 'podcasts', 'about', 'press', 'creators', 'ads'];
    if (reserved.includes(firstSeg)) {
      return { valid: false, reason: 'URL points to a YouTube video, playlist, or system page instead of a channel/profile.' };
    }
  } else if (plat === 'twitter' || plat === 'x') {
    const reserved = ['home', 'explore', 'notifications', 'messages', 'i', 'settings', 'search', 'tos', 'privacy', 'about', 'login', 'signup', 'compose', 'logout', 'status'];
    if (reserved.includes(firstSeg)) {
      return { valid: false, reason: 'URL points to a Tweet/post or system page instead of a profile.' };
    }
  }

  return { valid: true };
};

const normalizePlatformUrl = (platform, rawUrl) => {
  let trimmed = (rawUrl || '').trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    // Fix protocol to https
    parsed.protocol = 'https:';
    return parsed.toString();
  } catch (_) {
    return null;
  }
};

const verifyPlatformUrl = async (platform, rawUrl) => {
  const platKey = (platform || '').toLowerCase();
  if (!['youtube', 'instagram', 'twitter', 'x'].includes(platKey)) {
    return {
      verified: false,
      message: `Platform '${platform}' is not supported. Supported platforms are YouTube, Instagram, and Twitter.`
    };
  }

  const normalizedUrl = normalizePlatformUrl(platKey, rawUrl);
  if (!normalizedUrl) {
    return {
      verified: false,
      message: 'Please provide a valid profile/channel URL.'
    };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch (_) {
    return {
      verified: false,
      message: 'Invalid URL format.'
    };
  }

  // 1. Domain Check
  if (!isHostAllowedForPlatform(parsedUrl.hostname, platKey)) {
    const expectedDomain = platKey === 'youtube' ? 'youtube.com' : platKey === 'instagram' ? 'instagram.com' : 'twitter.com / x.com';
    return {
      verified: false,
      message: `Selected platform is ${platform}, but the provided link domain does not match ${expectedDomain}.`
    };
  }

  // 2. Profile Path Check
  const pathCheck = isProfileUrlReasonablyValid(parsedUrl, platKey);
  if (!pathCheck.valid) {
    return {
      verified: false,
      message: pathCheck.reason
    };
  }

  // 3. Network Accessibility Check (HEAD/GET fetch with redirect & timeout)
  let currentUrl = normalizedUrl;
  let redirectsCount = 0;
  const maxRedirects = 5;
  let isAccessible = false;

  while (redirectsCount < maxRedirects) {
    let urlObj;
    try {
      urlObj = new URL(currentUrl);
    } catch (_) {
      break;
    }

    if (!isHostAllowedForPlatform(urlObj.hostname, platKey)) {
      break;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let response;
    try {
      response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: controller.signal
      });
    } catch (err) {
      // Network timeout or connection refusal
      break;
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status >= 300 && response.status < 400) {
      let redirectUrl = response.headers.get('location');
      if (!redirectUrl) break;
      redirectUrl = new URL(redirectUrl, currentUrl).toString();
      currentUrl = redirectUrl;
      redirectsCount++;
    } else if (response.ok || response.status === 429) { // 429 rate-limiting means account page exists on server
      const finalParsed = new URL(currentUrl);
      if (isHostAllowedForPlatform(finalParsed.hostname, platKey) && isProfileUrlReasonablyValid(finalParsed, platKey).valid) {
        isAccessible = true;
      }
      break;
    } else {
      break;
    }
  }

  if (!isAccessible) {
    return {
      verified: false,
      message: `We couldn't verify this ${platform} account. Please check the link and try again.`
    };
  }

  return {
    verified: true,
    platform: platKey === 'x' ? 'twitter' : platKey,
    normalizedUrl: currentUrl
  };
};

const registerCreator = async (registrationData) => {
  const {
    fullName,
    email,
    phoneNumber,
    primaryContentNiche,
    password
  } = registrationData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email address is already registered');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  if (phoneNumber) {
    const existingCreator = await CreatorProfile.findOne({ phoneNumber });
    if (existingCreator) {
      const error = new Error('Phone number is already registered');
      error.statusCode = 409;
      error.code = 'PHONE_NUMBER_ALREADY_EXISTS';
      throw error;
    }
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: 'creator',
    isVerified: false,
    isActive: true,
    registrationStatus: 'pending'
  });

  await CreatorProfile.create({
    userId: newUser._id,
    phoneNumber: phoneNumber || '',
    niche: primaryContentNiche ? [primaryContentNiche] : []
  });

  const safeUser = newUser.toObject();
  delete safeUser.password;
  safeUser.userId = newUser._id;

  return safeUser;
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

const loginCreator = async (loginData) => {
  const { email, password } = loginData;

  const user = await User.findOne({ email }).select('+password');

  const throwAuthError = () => {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  };

  if (!user) throwAuthError();
  if (user.role !== 'creator') throwAuthError();

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throwAuthError();

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

module.exports = {
  verifyPlatformUrl,
  registerCreator,
  markRegistrationCompleted,
  loginCreator
};
