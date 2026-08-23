const mongoose = require('mongoose');
const Negotiation = require('../../../models/negotiation.model');
const User = require('../../../models/user.model');
const brandNegotiationService = require('../../brand/services/negotiation.service');

const getCreatorNegotiations = async (creatorId, filters = {}) => {
  const creatorObjId = new mongoose.Types.ObjectId(creatorId);
  const query = {
    $or: [{ creatorId: creatorObjId }, { creatorId: creatorId.toString() }]
  };
  if (filters.status) query.status = filters.status;

  return Negotiation.find(query)
    .populate('campaignId', 'title category budget deadline status')
    .populate('brandId', 'fullName email profileImage')
    .sort({ lastActivity: -1 });
};

const sendCounterOffer = async ({ negotiationId, creatorId, message, proposedBudget, proposedPrice, notes }) => {
  let negotiation = await Negotiation.findById(negotiationId);

  if (!negotiation) {
    negotiation = await Negotiation.findOne({ invitationId: negotiationId });
  }

  if (!negotiation) {
    const error = new Error('Negotiation not found');
    error.statusCode = 404;
    throw error;
  }

  if (String(negotiation.creatorId) !== String(creatorId)) {
    const error = new Error('You do not have permission to participate in this negotiation');
    error.statusCode = 403;
    throw error;
  }

  if (negotiation.status === 'agreed') {
    const error = new Error('Negotiation has already been accepted and finalized');
    error.statusCode = 400;
    error.code = 'NEGOTIATION_ALREADY_AGREED';
    throw error;
  }

  const user = await User.findById(creatorId).select('fullName profileImage role');
  const finalBudget = Number(proposedBudget || proposedPrice || 0);
  const finalMessage = message || notes || `Counter offer submitted for ₹${finalBudget.toLocaleString('en-IN')}.`;

  const newOffer = {
    senderId: user._id,
    senderRole: 'creator',
    senderName: user.fullName,
    senderAvatar: user.profileImage || '',
    message: finalMessage,
    proposedBudget: finalBudget,
    status: 'offered',
    isRead: false
  };

  negotiation.offers.push(newOffer);
  negotiation.currentBudget = finalBudget;
  negotiation.lastActivity = new Date();

  await negotiation.save();

  try {
    const notificationService = require('../../brand/services/notification.service');
    await notificationService.createNotification({
      userId: negotiation.brandId,
      senderId: creatorId,
      type: 'offer_received',
      title: 'Counter Offer Received',
      message: `Creator ${user.fullName} submitted a counter offer of ₹${finalBudget.toLocaleString('en-IN')} for "${negotiation.campaignName}".`,
      entityId: negotiation._id
    });
    await notificationService.createNotification({
      userId: creatorId,
      senderId: negotiation.brandId,
      type: 'negotiation',
      title: 'Counter Offer Sent',
      message: `You submitted a counter offer of ₹${finalBudget.toLocaleString('en-IN')} to "${negotiation.brandName}".`,
      entityId: negotiation._id
    });
  } catch (err) {
    console.error('Notification error on counter offer:', err);
  }

  return negotiation;
};

const acceptOffer = async ({ negotiationId, creatorId, offerId }) => {
  return brandNegotiationService.acceptOffer({
    negotiationId,
    userId: creatorId,
    offerId
  });
};

module.exports = {
  getCreatorNegotiations,
  sendCounterOffer,
  acceptOffer
};
