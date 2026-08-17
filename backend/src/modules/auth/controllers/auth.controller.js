const authService = require('../services/auth.service');
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

module.exports = {
  login,
  getCurrentUser,
  logout
};
