const Negotiation = require('../../../models/negotiation.model');
const Invitation = require('../../../models/invitation.model');
const Campaign = require('../../../models/campaign.model');
const User = require('../../../models/user.model');
const Collaboration = require('../../../models/collaboration.model');

const createNegotiationFromInvitation = async ({ invitationId, userId }) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    const error = new Error('Invitation not found');
    error.statusCode = 404;
    error.code = 'INVITATION_NOT_FOUND';
    throw error;
  }

  if (String(invitation.creatorId) !== String(userId) && String(invitation.brandId) !== String(userId)) {
    const error = new Error('Only participants can start negotiation');
    error.statusCode = 403;
    error.code = 'NEGOTIATION_ACCESS_DENIED';
    throw error;
  }

  let negotiation = await Negotiation.findOne({ invitationId: invitation._id });
  if (negotiation) return negotiation;

  const campaign = await Campaign.findById(invitation.campaignId);

  negotiation = await Negotiation.create({
    invitationId: invitation._id,
    campaignId: invitation.campaignId,
    campaignName: invitation.campaignTitle || campaign?.title || 'Campaign',
    brandId: invitation.brandId,
    brandName: invitation.brandName,
    brandLogo: invitation.brandLogo || '',
    creatorId: invitation.creatorId,
    creatorName: invitation.creatorName,
    creatorAvatar: invitation.creatorAvatar || '',
    proposedBudget: invitation.proposedPrice || 0,
    currentBudget: invitation.proposedPrice || 0,
    status: 'open',
    offers: [
      {
        senderId: invitation.brandId,
        senderRole: 'brand',
        senderName: invitation.brandName,
        senderAvatar: invitation.brandLogo || '',
        message: invitation.message || 'Initial campaign offer',
        proposedBudget: invitation.proposedPrice || 0,
        status: 'offered'
      }
    ],
    lastActivity: new Date()
  });

  invitation.status = 'negotiating';
  await invitation.save();

  return negotiation;
};

const getNegotiationById = async ({ negotiationId, userId }) => {
  let negotiation = await Negotiation.findById(negotiationId).lean();

  if (!negotiation) {
    negotiation = await Negotiation.findOne({ invitationId: negotiationId }).lean();
  }

  if (!negotiation) {
    const error = new Error('Negotiation not found');
    error.statusCode = 404;
    error.code = 'NEGOTIATION_NOT_FOUND';
    throw error;
  }

  const isBrand = String(negotiation.brandId) === String(userId);
  const isCreator = String(negotiation.creatorId) === String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error('You do not have access to this negotiation');
    error.statusCode = 403;
    error.code = 'NEGOTIATION_ACCESS_DENIED';
    throw error;
  }

  return negotiation;
};

const getBrandNegotiations = async (brandId, filters = {}) => {
  const query = { brandId };
  if (filters.status) query.status = filters.status;

  return Negotiation.find(query)
    .populate('campaignId', 'title category budget deadline status')
    .populate('creatorId', 'fullName email profileImage')
    .sort({ lastActivity: -1 })
    .lean();
};

const createOffer = async ({
  negotiationId,
  userId,
  message,
  notes,
  proposedBudget,
  proposedPrice
}) => {
  let negotiation = await Negotiation.findById(negotiationId);

  if (!negotiation) {
    negotiation = await Negotiation.findOne({ invitationId: negotiationId });
  }

  if (!negotiation) {
    const error = new Error('Negotiation not found');
    error.statusCode = 404;
    error.code = 'NEGOTIATION_NOT_FOUND';
    throw error;
  }

  const isBrand = String(negotiation.brandId) === String(userId);
  const isCreator = String(negotiation.creatorId) === String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error('You do not have access to this negotiation');
    error.statusCode = 403;
    error.code = 'NEGOTIATION_ACCESS_DENIED';
    throw error;
  }

  if (negotiation.status === 'agreed') {
    const error = new Error('Negotiation has already been accepted and finalized');
    error.statusCode = 400;
    error.code = 'NEGOTIATION_ALREADY_AGREED';
    throw error;
  }

  const user = await User.findById(userId).select('fullName profileImage role');
  const finalBudget = Number(proposedBudget || proposedPrice || 0);
  const finalMessage = message || notes || `Offer submitted for $${finalBudget}.`;

  const newOffer = {
    senderId: user._id,
    senderRole: isBrand ? 'brand' : 'creator',
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
    const recipientId = isBrand ? negotiation.creatorId : negotiation.brandId;
    const notificationService = require('./notification.service');
    await notificationService.createNotification({
      userId: recipientId,
      senderId: userId,
      type: 'offer_received',
      title: 'New Offer Received',
      message: `${user.fullName} submitted an offer of $${finalBudget} for "${negotiation.campaignName}".`,
      entityId: negotiation._id
    });
  } catch (err) {
    console.error('Notification error on offer creation:', err);
  }

  return negotiation;
};

const acceptOffer = async ({ negotiationId, userId, offerId = null }) => {
  let negotiation = await Negotiation.findById(negotiationId);
  if (!negotiation) {
    negotiation = await Negotiation.findOne({ invitationId: negotiationId });
  }

  if (!negotiation) {
    const error = new Error('Negotiation not found');
    error.statusCode = 404;
    error.code = 'NEGOTIATION_NOT_FOUND';
    throw error;
  }

  const isBrand = String(negotiation.brandId) === String(userId);
  const isCreator = String(negotiation.creatorId) === String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error('You do not have access to this negotiation');
    error.statusCode = 403;
    error.code = 'NEGOTIATION_ACCESS_DENIED';
    throw error;
  }

  // Idempotency: if negotiation is already agreed, return existing negotiation
  if (negotiation.status === 'agreed') {
    let collaboration = await Collaboration.findOne({
      $or: [{ invitationId: negotiation.invitationId }, { negotiationId: negotiation._id }]
    });
    return { negotiation, collaboration };
  }

  // Find target offer to accept
  let offer = null;
  if (offerId) {
    offer = negotiation.offers.id(offerId);
  }
  if (!offer && negotiation.offers && negotiation.offers.length > 0) {
    offer = negotiation.offers[negotiation.offers.length - 1];
  }

  if (!offer) {
    const error = new Error('No valid offer found to accept');
    error.statusCode = 404;
    error.code = 'OFFER_NOT_FOUND';
    throw error;
  }

  // Stale Offer / Self Acceptance Protection: Only the recipient can accept an offer
  if (String(offer.senderId) === String(userId)) {
    const error = new Error('You cannot accept your own offer');
    error.statusCode = 400;
    error.code = 'OWN_OFFER';
    throw error;
  }

  const user = await User.findById(userId).select('fullName profileImage role');
  const agreedPrice = Number(offer.proposedBudget || negotiation.currentBudget || 0);

  // Mark offer status as accepted
  offer.status = 'accepted';

  // Mark all other non-accepted offers as declined
  negotiation.offers.forEach((item) => {
    if (String(item._id) !== String(offer._id) && ['offered', 'countered'].includes(item.status)) {
      item.status = 'declined';
    }
  });

  // Push acceptance event message into negotiation history
  const roleName = isBrand ? 'Brand' : 'Creator';
  negotiation.offers.push({
    senderId: user._id,
    senderRole: isBrand ? 'brand' : 'creator',
    senderName: user.fullName,
    senderAvatar: user.profileImage || '',
    message: `${roleName} ${user.fullName} accepted the $${agreedPrice} offer.`,
    proposedBudget: agreedPrice,
    status: 'accepted',
    isRead: false
  });

  negotiation.agreedBudget = agreedPrice;
  negotiation.currentBudget = agreedPrice;
  negotiation.status = 'agreed';
  negotiation.lastActivity = new Date();

  await negotiation.save();

  // Update linked Invitation status to 'accepted'
  if (negotiation.invitationId) {
    await Invitation.findByIdAndUpdate(negotiation.invitationId, {
      status: 'accepted',
      proposedPrice: agreedPrice
    });
  }

  // Create or Update active Collaboration
  let collaboration = await Collaboration.findOne({
    $or: [{ invitationId: negotiation.invitationId }, { negotiationId: negotiation._id }]
  });

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 14);

  if (!collaboration) {
    collaboration = await Collaboration.create({
      campaignId: negotiation.campaignId,
      campaignTitle: negotiation.campaignName,
      invitationId: negotiation.invitationId,
      negotiationId: negotiation._id,
      brandId: negotiation.brandId,
      brandName: negotiation.brandName,
      brandLogo: negotiation.brandLogo || '',
      creatorId: negotiation.creatorId,
      creatorName: negotiation.creatorName,
      creatorAvatar: negotiation.creatorAvatar || '',
      deliverableType: 'Agreed Deliverables',
      agreedBudget: agreedPrice,
      agreedPrice: agreedPrice,
      status: 'active',
      stage: 'agreement_finalized',
      startDate: new Date(),
      deadline: deadlineDate
    });
  } else {
    collaboration.agreedBudget = agreedPrice;
    collaboration.agreedPrice = agreedPrice;
    collaboration.status = 'active';
    collaboration.stage = 'agreement_finalized';
    await collaboration.save();
  }

  // Trigger Notification to the other participant
  try {
    const recipientId = isBrand ? negotiation.creatorId : negotiation.brandId;
    const notificationService = require('./notification.service');
    await notificationService.createNotification({
      userId: recipientId,
      senderId: userId,
      type: 'invitation_accepted',
      title: 'Offer Accepted & Collaboration Activated',
      message: `${roleName} ${user.fullName} accepted the $${agreedPrice} offer for campaign "${negotiation.campaignName}".`,
      entityId: collaboration._id
    });
  } catch (err) {
    console.error('Notification error on offer accept:', err);
  }

  return { negotiation, collaboration };
};

module.exports = {
  createNegotiationFromInvitation,
  getNegotiationById,
  getBrandNegotiations,
  createOffer,
  acceptOffer
};
