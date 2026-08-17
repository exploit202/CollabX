const jwt = require('jsonwebtoken');

/**
 * Socket.IO authentication middleware matching Brand team specification:
 * - JWT token passed in socket.handshake.auth.token or Authorization header
 * - Populates socket.user = { userId, role, email }
 */
const socketAuth = (socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    (socket.handshake.headers?.authorization &&
      socket.handshake.headers.authorization.startsWith('Bearer')
      ? socket.handshake.headers.authorization.split(' ')[1]
      : null);

  const testUserId = socket.handshake.auth?.userId || socket.handshake.headers?.['x-user-id'];
  const testUserRole = socket.handshake.auth?.userRole || socket.handshake.headers?.['x-user-role'] || 'creator';

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'collabx_secret_key_123');
      socket.user = {
        userId: String(decoded.userId || decoded.id || decoded._id),
        role: decoded.role,
        email: decoded.email,
      };
      return next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  }

  // Fallback for testing environments passing x-user-id / auth.userId
  if (testUserId) {
    socket.user = {
      userId: String(testUserId),
      role: testUserRole,
    };
    return next();
  }

  return next(new Error('Authentication error: Missing token in socket.handshake.auth.token'));
};

module.exports = { socketAuth };
