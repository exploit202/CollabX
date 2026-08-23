const brandAuthService = require('../services/brandAuth.service');
const { generateOtp, verifyOtp } = require('../../auth/services/otp.service');
const { sendOtpEmail } = require('../../auth/services/email.service');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const { generateAccessToken, parseExpiresInToMs } = require('../../../utils/jwt');

const register = async (req, res, next) => {
  try {
    const user = await brandAuthService.registerBrand(req.body);
    const signupToken = generateAccessToken({
      userId: user._id || user.userId,
      email: user.email,
      role: user.role || 'brand',
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

    return successResponse(res, 201, 'Brand registered successfully.', {
      user,
      token: signupToken,
      signupToken
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
    const emailResult = await sendOtpEmail(userEmail, plainOtp, { role: 'brand' });

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
      ...(emailResult.devOtp && { devOtp: emailResult.devOtp })
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
    const updatedUser = await brandAuthService.markRegistrationCompleted(userId);

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
    const { user, token } = await brandAuthService.loginBrand(req.body);
    const maxAge = parseExpiresInToMs(process.env.JWT_EXPIRES_IN);

    res.clearCookie('signupToken');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    return successResponse(res, 200, 'Brand logged in successfully.', { user, token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  requestEmailOtp,
  verifyEmailOtp,
  login
};
