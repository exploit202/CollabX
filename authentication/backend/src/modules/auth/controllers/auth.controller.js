const authService = require('../services/auth.service');
const { successResponse } = require('../../../utils/apiResponse');

const { parseExpiresInToMs } = require('../../../utils/jwt');

/**
 * Authenticate existing user, set HTTP-only cookie, and return safe user info.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);

    // Compute maxAge for cookie from JWT expiration configuration
    const maxAge = parseExpiresInToMs(process.env.JWT_EXPIRES_IN);

    // Store JWT securely in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    return successResponse(res, 200, 'Login successful.', { user });
  } catch (error) {
    next(error); // Delegated to global error handler
  }
};

/**
 * Return the currently authenticated user's safe profile fields.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = authService.getCurrentUser(req.user);
    return successResponse(res, 200, 'Current user retrieved successfully.', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear the HTTP-only auth cookie and end the client session.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
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
