const creatorAuthService = require('../services/creatorAuth.service');
const { generateOtp, verifyOtp } = require('../../auth/services/otp.service');
const { sendOtpEmail } = require('../../auth/services/email.service');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const { generateAccessToken, parseExpiresInToMs } = require('../../../utils/jwt');
const CreatorProfile = require('../../../models/creatorProfile.model');

const register = async (req, res, next) => {
  try {
    const user = await creatorAuthService.registerCreator(req.body);

    const signupToken = generateAccessToken({
      userId: user._id || user.userId,
      email: user.email,
      role: user.role || 'creator',
      type: 'signup',
      registrationStatus: 'pending'
    });

    const maxAge = parseExpiresInToMs(process.env.SIGNUP_SESSION_EXPIRES_IN || '24h');

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    res.clearCookie('signupToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    res.cookie('signupToken', signupToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge
    });

    return successResponse(res, 201, 'Creator registered successfully.', {
      user,
      signupToken
    });
  } catch (error) {
    next(error);
  }
};

const updatePlatforms = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const { platforms } = req.body;

    const normalizedPlatforms = (platforms || []).map((item) => {
      if (typeof item === 'string') {
        return { platform: item, link: '' };
      }
      return item;
    });

    const creatorProfile = await CreatorProfile.findOneAndUpdate(
      { userId },
      { platforms: normalizedPlatforms },
      { new: true, runValidators: true }
    );

    if (!creatorProfile) {
      return errorResponse(res, 404, 'Creator profile not found.', 'PROFILE_NOT_FOUND');
    }

    return successResponse(res, 200, 'Platforms updated successfully.', {
      profile: creatorProfile
    });
  } catch (error) {
    next(error);
  }
};

const verifyPlatformUrl = async (req, res, next) => {
  try {
    const { platform, url } = req.body;
    if (!platform || !url) {
      return errorResponse(res, 400, 'Platform and URL are required.', 'INVALID_PAYLOAD');
    }

    const result = await creatorAuthService.verifyPlatformUrl(platform, url);
    if (!result.verified) {
      return errorResponse(
        res,
        400,
        result.message || `The ${platform} link could not be verified. Please check the link and try again.`,
        'VERIFICATION_FAILED'
      );
    }

    return successResponse(res, 200, 'Platform URL verified successfully.', {
      verified: true,
      platform: result.platform || platform,
      url: result.normalizedUrl || url
    });
  } catch (error) {
    next(error);
  }
};

const requestEmailOtp = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const userEmail = req.user.email;

    const { plainOtp } = await generateOtp(userId);
    const emailResult = await sendOtpEmail(userEmail, plainOtp);

    if (!emailResult.success) {
      return errorResponse(
        res,
        500,
        emailResult.error || 'Failed to send OTP email.',
        'EMAIL_SEND_FAILED'
      );
    }

    return successResponse(res, 200, `OTP sent successfully to ${userEmail}.`, {
      emailSent: true,
      recipientEmail: userEmail,
      ...(emailResult.devOtp && { devOtp: emailResult.devOtp }),
      ...(process.env.NODE_ENV === 'development' ? { devOtp: plainOtp, devNote: 'OTP logged to server console' } : {})
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmailOtp = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const { otp } = req.body;

    await verifyOtp(userId, otp);
    const updatedUser = await creatorAuthService.markRegistrationCompleted(userId);

    const fullAccessToken = generateAccessToken({
      userId: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role
    });

    const maxAge = parseExpiresInToMs(process.env.JWT_EXPIRES_IN || '7d');

    res.clearCookie('signupToken');
    res.cookie('token', fullAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    return successResponse(res, 200, 'Email verified and registration completed successfully.', {
      user: updatedUser,
      token: fullAccessToken
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await creatorAuthService.loginCreator(req.body);
    const maxAge = parseExpiresInToMs(process.env.JWT_EXPIRES_IN || '7d');

    res.clearCookie('signupToken');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    return successResponse(res, 200, 'Creator logged in successfully.', { user, token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  updatePlatforms,
  verifyPlatformUrl,
  requestEmailOtp,
  verifyEmailOtp,
  login
};
