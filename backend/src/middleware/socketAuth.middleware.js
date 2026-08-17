const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/user.model');

/**
 * Socket.IO authentication middleware.
 * Verifies JWT token passed in handshake auth or headers.
 */
const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization &&
      socket.handshake.headers.authorization.startsWith('Bearer')
        ? socket.handshake.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return next(new Error('Authentication error: Missing token'));
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return next(new Error('Authentication error: Invalid or deactivated account'));
    }

    socket.user = {
      userId: user._id,
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.fullName
    };

    return next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = { socketAuth };
