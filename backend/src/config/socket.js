const { Server } = require('socket.io');

let io = null;

/**
 * Initializes Socket.IO server on the single HTTP server instance.
 * @param {import('http').Server} server
 * @returns {Server}
 */
const initSocket = (server) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  return io;
};

/**
 * Returns active Socket.IO server instance.
 * @returns {Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
