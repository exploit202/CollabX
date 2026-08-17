const jwt = require('jsonwebtoken');
const User = require('../modules/auth/models/user.model');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (!token) return errorResponse(res, 401, 'Authentication required. Please login.', 'NOT_AUTHENTICATED');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return errorResponse(res, 401, 'User associated with this token no longer exists.', 'USER_NOT_FOUND');
    if (!user.isActive) return errorResponse(res, 403, 'Your account has been deactivated.', 'ACCOUNT_DEACTIVATED');
    req.user = { userId: user._id, id: user._id, email: user.email, role: user.role, name: user.fullName, avatar: user.profileImage || '' };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return errorResponse(res, 401, 'Your session has expired. Please login again.', 'TOKEN_EXPIRED');
    if (error.name === 'JsonWebTokenError') return errorResponse(res, 401, 'Invalid authentication token.', 'INVALID_TOKEN');
    next(error);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || (roles.length && !roles.includes(req.user.role))) return errorResponse(res, 403, `User role '${req.user?.role || 'unknown'}' is not authorized to access this resource`, 'FORBIDDEN');
  next();
};

module.exports = { protect, authorize };
