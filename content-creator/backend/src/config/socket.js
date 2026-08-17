const { Server } = require('socket.io');

let io = null;

/**
 * Initializes Socket.IO server with Express HTTP server
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  return io;
};

/**
 * Gets active Socket.IO server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
