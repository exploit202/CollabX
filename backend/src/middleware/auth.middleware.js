const User = require('../models/user.model');
const { verifyAccessToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Extract token from HTTP-only cookies or Authorization Bearer header.
 */
const getTokenFromRequest = (req) => {
  if (req.cookies?.signupToken) {
    return { token: req.cookies.signupToken, source: 'cookie_signupToken' };
  }
  if (req.cookies?.token) {
    return { token: req.cookies.token, source: 'cookie_token' };
  }

  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    if (bearerToken) {
      return { token: bearerToken, source: 'header_bearer' };
    }
  }

  return { token: null, source: null };
};

const clearSignupCookie = (res) => {
  try {
    res.clearCookie('signupToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  } catch (_) {
    /* Ignore if headers sent */
  }
};

/**
 * Unified JWT Authentication Middleware reconciled with Original architecture.
 * Supports both HTTP-only cookies and Authorization: Bearer <token> headers.
 * Deterministically identifies signup session tokens via decoded.type === 'signup'.
 */
const verifyJWT = async (req, res, next) => {
  try {
    const { token, source } = getTokenFromRequest(req);

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
      if (source === 'cookie_signupToken' || req.cookies?.signupToken) {
        clearSignupCookie(res);
      }

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

    const isSignup = decoded.type === 'signup';

    const user = await User.findById(decoded.userId);

    if (!user) {
      if (isSignup || source === 'cookie_signupToken' || req.cookies?.signupToken) {
        clearSignupCookie(res);
      }

      return errorResponse(
        res,
        401,
        'User account no longer exists.',
        'USER_NOT_FOUND'
      );
    }

    if (!user.isActive) {
      if (isSignup || source === 'cookie_signupToken' || req.cookies?.signupToken) {
        clearSignupCookie(res);
      }

      return errorResponse(
        res,
        403,
        'Your account has been deactivated. Please contact support.',
        'ACCOUNT_DEACTIVATED'
      );
    }

    if (isSignup) {
      if (user.role !== 'creator' || user.registrationStatus !== 'pending') {
        clearSignupCookie(res);
        return errorResponse(
          res,
          403,
          'This signup session is no longer valid.',
          'SIGNUP_SESSION_EXPIRED'
        );
      }
    } else if (source === 'cookie_signupToken' || req.cookies?.signupToken) {
      // Clear extraneous or stale signupToken cookie if decoding a non-signup token
      clearSignupCookie(res);
    }

    // Attach user document and provide property aliases for full backward compatibility
    req.user = user;
    req.user.userId = user._id;
    req.user.id = user._id;
    req.signupSession = isSignup;

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Restrict route access to specific roles.
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

  const allowedRoles = roles.flat();
  if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
    return errorResponse(
      res,
      403,
      `User role '${req.user.role}' is not authorized to access this resource.`,
      'FORBIDDEN'
    );
  }

  return next();
};

/**
 * Optional authentication middleware: parses JWT if present, but allows unauthenticated access.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const { token } = getTokenFromRequest(req);
    if (!token) return next();
    const decoded = verifyAccessToken(token);
    if (decoded?.id || decoded?.userId) {
      const user = await User.findById(decoded.id || decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    return next();
  } catch (err) {
    return next();
  }
};

module.exports = {
  verifyJWT,
  protect: verifyJWT,
  authorizeRoles,
  authorize: authorizeRoles,
  optionalAuth
};
