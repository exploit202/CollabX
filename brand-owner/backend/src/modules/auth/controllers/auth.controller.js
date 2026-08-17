const authService = require('../services/auth.service');
const { successResponse } = require('../../../utils/apiResponse');

const { parseExpiresInToMs } = require('../../../utils/jwt');

/**
 * Register a new user and corresponding profile.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    return successResponse(
      res,
      201,
      'User registered successfully.',
      { user }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate existing user, set HTTP-only cookie,
 * and return safe user info.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);

    const maxAge = parseExpiresInToMs(
      process.env.JWT_EXPIRES_IN
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    return successResponse(
      res,
      200,
      'Login successful.',
      { user, token }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Change authenticated user's password.
 *
 * Settings only requires:
 * - newPassword
 * - confirmPassword
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const {
      newPassword,
      confirmPassword
    } = req.body;

    const result = await authService.changePassword(
      userId,
      newPassword,
      confirmPassword
    );

    return successResponse(
      res,
      200,
      'Password updated successfully.',
      result
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  changePassword
};