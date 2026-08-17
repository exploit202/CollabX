const Negotiation = require('../../brand/models/negotiation.model');
const { getIO } = require('../../../socket/socket.manager');

const getCreatorNegotiations = async (creatorId) => {
  return Negotiation.find({ creatorId })
    .sort({ createdAt: -1 });
};

const getNegotiationById = async (creatorId, negotiationId) => {
  return Negotiation.findOne({
    _id: negotiationId,
    creatorId
  });
};

const addOffer = async (negotiationId, sender) => {
  const negotiation = await Negotiation.findById(negotiationId);

  if (!negotiation) {
    const error = new Error('Negotiation not found.');
    error.statusCode = 404;
    throw error;
  }

  if (negotiation.status !== 'open') {
    const error = new Error(
      'Messages can only be sent in an open negotiation.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !sender.message &&
    sender.proposedBudget === undefined
  ) {
    const error = new Error(
      'Message or proposedBudget is required.'
    );
    error.statusCode = 400;
    throw error;
  }

  const isCreator =
    negotiation.creatorId &&
    negotiation.creatorId.toString() ===
      sender.senderId.toString();

  if (!isCreator) {
    const error = new Error(
      'You are not a participant in this negotiation.'
    );
    error.statusCode = 403;
    throw error;
  }

  const offer = {
    senderId: sender.senderId,
    senderRole: sender.senderRole,
    senderName: sender.senderName || 'Creator',
    senderAvatar: sender.senderAvatar || '',
    message: sender.message || '',
    proposedBudget:
      sender.proposedBudget ?? negotiation.currentBudget,
    attachmentUrl: sender.attachmentUrl || '',
    attachmentName: sender.attachmentName || '',
    attachmentType: sender.attachmentType || null,
    status: 'countered'
  };

  negotiation.offers.push(offer);

  if (sender.proposedBudget !== undefined) {
    negotiation.currentBudget = sender.proposedBudget;
  }

  negotiation.lastActivity = new Date();

  await negotiation.save();

  const io = getIO();
  const roomName = `negotiation:${negotiation._id}`;

  io.to(roomName).emit('negotiation:offer', {
    negotiationId: negotiation._id.toString(),
    offer: negotiation.offers[negotiation.offers.length - 1]
  });

  return negotiation;
};

const updateNegotiationStatus = async (
  userId,
  negotiationId,
  status
) => {
  const negotiation = await Negotiation.findById(negotiationId);

  if (!negotiation) {
    const error = new Error('Negotiation not found.');
    error.statusCode = 404;
    throw error;
  }

  const isCreator =
    negotiation.creatorId.toString() === userId.toString();

  if (!isCreator) {
    const error = new Error(
      'Only participants can update negotiation status.'
    );
    error.statusCode = 403;
    throw error;
  }

  if (!['agreed', 'rejected'].includes(status)) {
    const error = new Error('Invalid negotiation status.');
    error.statusCode = 400;
    throw error;
  }

  negotiation.status = status;
  await negotiation.save();

  return negotiation;
};

module.exports = {
  getCreatorNegotiations,
  getNegotiationById,
  addOffer,
  updateNegotiationStatus
};
