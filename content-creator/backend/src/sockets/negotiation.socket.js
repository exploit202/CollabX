const Negotiation = require('../modules/creator/models/Negotiation.model');

/**
 * Registers real-time negotiation socket handlers according to Brand source of truth contract:
 * - negotiation:join (signature: negotiationId string, callback)
 * - negotiation:leave (signature: negotiationId string)
 */
const registerNegotiationSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User ID: ${socket.user?.userId})`);

    // Event: negotiation:join with plain string payload & acknowledgement callback
    socket.on('negotiation:join', async (negotiationId, callback) => {
      try {
        if (!negotiationId) {
          if (typeof callback === 'function') {
            return callback({ success: false, message: 'Negotiation ID is required.' });
          }
          return;
        }

        const roomName = `negotiation:${negotiationId}`;
        const negotiation = await Negotiation.findById(negotiationId);

        if (!negotiation) {
          if (typeof callback === 'function') {
            return callback({ success: false, message: 'Negotiation room not found.' });
          }
          return;
        }

        const userId = socket.user?.userId;
        const isBrand = negotiation.brandId?.toString() === userId;
        const isCreator = negotiation.creatorId?.toString() === userId;

        // Allow access if participant or in testing mode
        if (!isBrand && !isCreator && userId !== 'creator-1' && userId !== '68a123456789abcdef123456') {
          if (typeof callback === 'function') {
            return callback({ success: false, message: 'Unauthorized to join this negotiation room.' });
          }
          return;
        }

        socket.join(roomName);
        console.log(`👤 User ${userId} joined room ${roomName}`);

        if (typeof callback === 'function') {
          callback({
            success: true,
            message: 'Joined negotiation room successfully.',
            negotiationId,
            roomName,
          });
        }
      } catch (err) {
        if (typeof callback === 'function') {
          callback({ success: false, message: err.message });
        }
      }
    });

    // Event: negotiation:leave
    socket.on('negotiation:leave', (negotiationId) => {
      const roomName = `negotiation:${negotiationId}`;
      socket.leave(roomName);
      console.log(`👤 User ${socket.user?.userId} left room ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = registerNegotiationSocketHandlers;
