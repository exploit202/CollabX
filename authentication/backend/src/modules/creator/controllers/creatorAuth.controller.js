const creatorAuthService = require('../services/creatorAuth.service');
const { successResponse } = require('../../../utils/apiResponse');
const { generateAccessToken, parseExpiresInToMs } = require('../../../utils/jwt');

/**
 * Handle creator registration requests.
 * Delegates all business logic to the Creator Registration service.
 */
const register = async (req, res, next) => {
  try {
    const result = await creatorAuthService.registerCreator(req.body);

    const signupToken = generateAccessToken({
      userId: result.userId,
      email: result.email,
      role: result.role,
      type: 'signup',
      registrationStatus: 'pending'
    });

    res.clearCookie('token');
    res.cookie('signupToken', signupToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: parseExpiresInToMs(process.env.SIGNUP_SESSION_EXPIRES_IN || '24h')
    });

    return successResponse(res, 201, 'Creator registered successfully.', { user: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle creator platform updates.
 * Delegates all business logic to the creator service.
 */
const updatePlatforms = async (req, res, next) => {
  try {
    const result = await creatorAuthService.updateCreatorPlatforms(req.user._id, req.body.platforms);
    return successResponse(res, 200, 'Creator platforms updated successfully.', { profile: result });
  } catch (error) {
    next(error);
  }
};

const verifyPlatformUrl = async (req, res, next) => {
  try {
    const { platform, url } = req.body;
    const verified = await creatorAuthService.verifyPlatformUrl(platform, url);
    return successResponse(res, 200, 'Platform URL verification complete.', { verified });
  } catch (error) {
    next(error);
  }
};

const requestOtp = async (req, res, next) => {
  try {
    const otpService = require('../../auth/services/otp.service');
    const emailService = require('../../auth/services/email.service');

    const userId = req.user._id;
    const email = req.user.email;

    // Call OTP generation service
    const { plainOtp } = await otpService.generateOtp(userId);

    // Call Email sending service
    const emailResult = await emailService.sendOtpEmail(email, plainOtp);

    if (!emailResult.success) {
      const error = new Error(emailResult.error || 'Failed to send OTP email.');
      error.statusCode = 500;
      error.code = 'EMAIL_SEND_FAILED';
      throw error;
    }

    return successResponse(res, 200, 'Verification code sent successfully to your registered email.');
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const otpService = require('../../auth/services/otp.service');

    const userId = req.user._id;
    const { otp } = req.body;

    // Call OTP verification service
    await otpService.verifyOtp(userId, otp);

    return successResponse(res, 200, 'OTP verified successfully.');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await creatorAuthService.loginCreator(req.body);
    const maxAge = parseExpiresInToMs(process.env.JWT_EXPIRES_IN);

    res.clearCookie('signupToken');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    return successResponse(res, 200, 'Creator logged in successfully.', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  updatePlatforms,
  verifyPlatformUrl,
  requestOtp,
  verifyOtp,
  login
};

