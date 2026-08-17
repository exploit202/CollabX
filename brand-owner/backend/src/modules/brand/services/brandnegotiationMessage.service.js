const NegotiationMessage = require('../models/negotiationMessage.model');
const BrandProfile = require('../models/brandProfile.model');
const CreatorProfile = require('../../creator/models/creatorProfile.model');
const { ensureParticipant } = require('./negotiation.service');
const { createNotification } = require('../../notification/services/notification.service');

const sendMessage = async (user, data) => {
  const negotiation = await ensureParticipant(user, data.negotiationId);
  const message = await NegotiationMessage.create({
    negotiationId: data.negotiationId,
    senderId: user.userId,
    senderType: user.role === 'brand' ? 'Brand' : 'Creator',
    message: data.message,
    offerAmount: data.offerAmount
  });

  if (data.offerAmount !== undefined && data.offerAmount !== null) {
    negotiation.currentOffer = data.offerAmount;
    await negotiation.save();
  }

  const other = user.role === 'brand'
    ? await CreatorProfile.findById(negotiation.creatorId)
    : await BrandProfile.findById(negotiation.brandId);

  const otherUserId = other ? other.userId : (user.role === 'brand' ? negotiation.creatorId : negotiation.brandId);

  if (otherUserId) {
    try {
      await createNotification({
        userId: otherUserId,
        title: 'New negotiation message',
        message: 'You received a new offer or message.',
        type: 'negotiation',
        link: `/${user.role === 'brand' ? 'creator' : 'brand'}/negotiations`
      });
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
    }
  }

  return message;
};

module.exports = { sendMessage };
