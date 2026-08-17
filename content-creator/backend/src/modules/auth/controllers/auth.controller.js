const authService = require('../services/auth.service');
const { successResponse } = require('../../../utils/apiResponse');

const { parseExpiresInToMs } = require('../../../utils/jwt');

/**
 * Register a new user and corresponding profile.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return successResponse(res, 201, 'User registered successfully.', { user });
  } catch (error) {
    next(error); // Delegated to global error handler
  }
};

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

module.exports = {
  register,
  login
};
