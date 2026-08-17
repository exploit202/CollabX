const jwt = require('jsonwebtoken');

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      const error = new Error('Authentication required.');
      error.data = {
        code: 'UNAUTHENTICATED'
      };

      return next(error);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    return next();
  } catch (error) {
    const authError = new Error('Your session is invalid or expired.');
    authError.data = {
      code: 'INVALID_TOKEN'
    };

    return next(authError);
  }
};

module.exports = socketAuth;