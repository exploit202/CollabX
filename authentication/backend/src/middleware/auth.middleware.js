const User = require('../modules/auth/models/user.model');
const { verifyAccessToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/apiResponse');

const getTokenFromRequest = (req) => req.cookies?.signupToken || req.cookies?.token;
const isSignupSessionToken = (req) => Boolean(req.cookies?.signupToken);

/**
 * Verify JWT from HTTP-only cookie, load the user, and attach to req.user.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const verifyJWT = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return errorResponse(
        res,
        401,
        'Authentication required. Please log in.',
        'AUTH_TOKEN_MISSING'
      );
    }

    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(
          res,
          401,
          'Your session has expired. Please log in again.',
          'TOKEN_EXPIRED'
        );
      }

      return errorResponse(res, 401, 'Invalid authentication token.', 'INVALID_TOKEN');
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return errorResponse(
        res,
        401,
        'User account no longer exists.',
        'USER_NOT_FOUND'
      );
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        403,
        'Your account has been deactivated. Please contact support.',
        'ACCOUNT_DEACTIVATED'
      );
    }

    if (isSignupSessionToken(req)) {
      if (decoded.type !== 'signup') {
        return errorResponse(
          res,
          401,
          'Invalid signup session.',
          'INVALID_SIGNUP_SESSION'
        );
      }

      if (user.role !== 'creator' || user.registrationStatus !== 'pending') {
        return errorResponse(
          res,
          403,
          'This signup session is no longer valid.',
          'SIGNUP_SESSION_EXPIRED'
        );
      }
    }

    req.user = user;
    req.signupSession = isSignupSessionToken(req);
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Restrict route access to one or more user roles.
 *
 * @param {...string} roles - Allowed roles (e.g. 'creator', 'brand', 'admin').
 * @returns {import('express').RequestHandler} Express middleware.
 */
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return errorResponse(
      res,
      401,
      'Authentication required. Please log in.',
      'AUTH_REQUIRED'
    );
  }

  if (!roles.includes(req.user.role)) {
    return errorResponse(
      res,
      403,
      'You do not have permission to access this resource.',
      'FORBIDDEN'
    );
  }

  return next();
};

module.exports = {
  verifyJWT,
  authorizeRoles
};
