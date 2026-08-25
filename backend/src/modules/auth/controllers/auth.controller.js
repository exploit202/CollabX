const authService = require('../services/auth.service');
const forgotPasswordService = require('../services/forgotPassword.service');
const { successResponse } = require('../../../utils/apiResponse');
const { parseExpiresInToMs } = require('../../../utils/jwt');

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    const maxAge = parseExpiresInToMs(process.env.JWT_EXPIRES_IN);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    return successResponse(res, 200, 'Login successful.', { user, token });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = authService.getCurrentUser(req.user);
    return successResponse(res, 200, 'Current user retrieved successfully.', { user });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return successResponse(res, 200, 'Logout successful.');
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService.requestPasswordReset(email);
    return successResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

const verifyPasswordResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await forgotPasswordService.verifyPasswordResetOtp(email, otp);
    return successResponse(res, 200, 'OTP verified successfully.', result);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    let authHeaderToken = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      authHeaderToken = req.headers.authorization.split(' ')[1];
    }

    const resetToken = req.body.resetToken || authHeaderToken || req.cookies?.resetToken;
    const { email, password } = req.body;

    const result = await forgotPasswordService.performPasswordReset({
      email,
      password,
      resetToken
    });

    return successResponse(res, 200, result.message, { success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getCurrentUser,
  logout,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword
};
