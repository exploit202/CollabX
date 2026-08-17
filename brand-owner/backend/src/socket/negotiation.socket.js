const mongoose = require('mongoose');
const Negotiation = require('../modules/brand/models/negotiation.model');

const registerNegotiationSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(
      `🔌 Socket connected: ${socket.id} | User: ${socket.user.userId} | Role: ${socket.user.role}`
    );

    socket.on('negotiation:join', async (negotiationId, callback) => {
      try {
        // Validate negotiation ID
        if (!mongoose.Types.ObjectId.isValid(negotiationId)) {
          return callback?.({
            success: false,
            message: 'Invalid negotiation ID.'
          });
        }

        // Find negotiation
        const negotiation = await Negotiation.findById(negotiationId);

        if (!negotiation) {
          return callback?.({
            success: false,
            message: 'Negotiation not found.'
          });
        }

        // Check whether the authenticated user belongs to this negotiation
        const userId = socket.user.userId.toString();

        const isBrand = negotiation.brandId.toString() === userId;
        const isCreator = negotiation.creatorId.toString() === userId;

        if (!isBrand && !isCreator) {
          return callback?.({
            success: false,
            message: 'You are not a participant in this negotiation.'
          });
        }

        // Create room name
        const roomName = `negotiation:${negotiationId}`;

        // Join room
        socket.join(roomName);

        console.log(
          `🏠 ${socket.user.role} joined ${roomName}`
        );

        return callback?.({
          success: true,
          message: 'Joined negotiation room successfully.',
          negotiationId,
          roomName
        });
      } catch (error) {
        console.error('❌ negotiation:join error:', error);

        return callback?.({
          success: false,
          message: 'Failed to join negotiation room.'
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(
        `🔌 Socket disconnected: ${socket.id}`
      );
    });
  });
};

module.exports = registerNegotiationSocket;