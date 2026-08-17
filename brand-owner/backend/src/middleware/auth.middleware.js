const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  const token = req.cookies?.token || (header?.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) {
    const error = new Error('Authentication is required.');
    error.statusCode = 401;
    error.code = 'UNAUTHENTICATED';
    return next(error);
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (_) {
    const error = new Error('Your session is invalid or expired.');
    error.statusCode = 401;
    error.code = 'INVALID_TOKEN';
    return next(error);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    const error = new Error('You do not have permission to perform this action.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    return next(error);
  }
  return next();
};

module.exports = { authenticate, authorize };
