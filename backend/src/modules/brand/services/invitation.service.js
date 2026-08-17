const Invitation = require('../../../models/invitation.model');
const Campaign = require('../../../models/campaign.model');
const User = require('../../../models/user.model');
const Pricing = require('../../../models/pricing.model');
const notificationService = require('./notification.service');

const createInvitation = async ({
  campaignId,
  brandId,
  creatorId,
  proposedPrice,
  deliverables,
  message,
  expiresAt
}) => {
  // 1. Validate Proposed Price / Offered Budget
  const numBudget = Number(proposedPrice);
  if (isNaN(numBudget) || numBudget <= 0) {
    const error = new Error('Offered budget must be a positive number greater than 0.');
    error.statusCode = 400;
    error.code = 'INVALID_BUDGET';
    throw error;
  }

  // 2. Validate Campaign exists and belongs to authenticated Brand
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    const error = new Error('Selected campaign not found.');
    error.statusCode = 404;
    error.code = 'CAMPAIGN_NOT_FOUND';
    throw error;
  }

  if (String(campaign.brandId) !== String(brandId)) {
    const error = new Error('You can only send invitations for your own campaigns.');
    error.statusCode = 403;
    error.code = 'CAMPAIGN_ACCESS_DENIED';
    throw error;
  }

  if (campaign.status === 'completed' || campaign.status === 'cancelled') {
    const error = new Error(`Cannot send invitation for a ${campaign.status} campaign.`);
    error.statusCode = 400;
    error.code = 'CAMPAIGN_NOT_ACTIVE';
    throw error;
  }

  // 3. Validate Creator exists and has Creator role
  const creator = await User.findOne({
    _id: creatorId,
    role: 'creator',
    isActive: true
  });

  if (!creator) {
    const error = new Error('Target creator profile not found or inactive.');
    error.statusCode = 404;
    error.code = 'CREATOR_NOT_FOUND';
    throw error;
  }

  // 4. Validate Brand user
  const brandUser = await User.findById(brandId);
  const brandName = brandUser?.fullName || campaign.brandName || 'Brand';
  const brandLogo = brandUser?.profileImage || campaign.brandLogo || campaign.brandImage || '';

  // 5. Validate Creator Deliverables / Packages
  const creatorPackages = await Pricing.find({ creatorId: creator._id, isActive: true });
  let finalDeliverables = [];

  if (Array.isArray(deliverables) && deliverables.length > 0) {
    finalDeliverables = deliverables.map((d) => String(d).trim()).filter(Boolean);
  } else if (creatorPackages.length > 0) {
    finalDeliverables = [creatorPackages[0].title || creatorPackages[0].deliverableType || 'Deliverable Package'];
  } else {
    finalDeliverables = ['Custom Deliverable Package'];
  }

  // 6. Check Duplicate Active Invitation
  const existingInvitation = await Invitation.findOne({
    campaignId,
    creatorId: creator._id,
    status: { $in: ['pending', 'negotiating'] }
  });

  if (existingInvitation) {
    const error = new Error('An active invitation already exists for this creator and campaign.');
    error.statusCode = 409;
    error.code = 'INVITATION_ALREADY_EXISTS';
    throw error;
  }

  // 7. Persist Invitation
  const invitation = await Invitation.create({
    campaignId,
    campaignTitle: campaign.title,
    brandId,
    brandName,
    brandLogo,
    creatorId: creator._id,
    creatorName: creator.fullName,
    creatorAvatar: creator.profileImage || '',
    proposedPrice: numBudget,
    deliverables: finalDeliverables,
    message: message ? String(message).trim() : `Hi ${creator.fullName}, we would love to collaborate with you on our upcoming campaign!`,
    status: 'pending',
    sentDate: new Date(),
    expiresAt: expiresAt ? new Date(expiresAt) : null
  });

  // Increment campaign counts
  await Campaign.findByIdAndUpdate(campaignId, {
    $inc: { applicationsCount: 1, invitationsCount: 1 }
  });

  // 8. Create Notification for Creator
  try {
    await notificationService.createNotification({
      userId: creator._id,
      senderId: brandId,
      type: 'collaboration_invitation',
      title: 'New Campaign Invitation',
      message: `${brandName} invited you to collaborate on campaign "${campaign.title}" for ₹${numBudget.toLocaleString('en-IN')}.`,
      entityType: 'Invitation',
      entityId: invitation._id
    });
  } catch (err) {
    console.error('Notification error on invitation creation:', err);
  }

  return invitation;
};

const getBrandInvitations = async (brandId, filters = {}) => {
  const query = { brandId };
  if (filters.status) query.status = filters.status;
  if (filters.campaignId) query.campaignId = filters.campaignId;

  return Invitation.find(query)
    .populate('campaignId', 'title description category budget deadline status')
    .populate('creatorId', 'fullName email profileImage')
    .sort({ createdAt: -1 })
    .lean();
};

const getInvitationById = async (invitationId, userId) => {
  const invitation = await Invitation.findById(invitationId)
    .populate('campaignId', 'title description category budget deliverables requirements deadline status brandName brandLogo')
    .populate('brandId', 'fullName email profileImage')
    .populate('creatorId', 'fullName email profileImage')
    .lean();

  if (!invitation) {
    const error = new Error('Invitation not found');
    error.statusCode = 404;
    error.code = 'INVITATION_NOT_FOUND';
    throw error;
  }

  const isBrand = String(invitation.brandId?._id || invitation.brandId) === String(userId);
  const isCreator = String(invitation.creatorId?._id || invitation.creatorId) === String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error('You do not have access to this invitation');
    error.statusCode = 403;
    error.code = 'INVITATION_ACCESS_DENIED';
    throw error;
  }

  return invitation;
};

const cancelInvitation = async ({ invitationId, brandId }) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    const error = new Error('Invitation not found');
    error.statusCode = 404;
    error.code = 'INVITATION_NOT_FOUND';
    throw error;
  }

  if (String(invitation.brandId) !== String(brandId)) {
    const error = new Error("Only the invitation's brand can cancel it");
    error.statusCode = 403;
    error.code = 'INVITATION_CANCEL_DENIED';
    throw error;
  }

  if (!['pending', 'negotiating'].includes(invitation.status)) {
    const error = new Error('This invitation cannot be cancelled');
    error.statusCode = 400;
    error.code = 'INVITATION_NOT_CANCELLABLE';
    throw error;
  }

  invitation.status = 'cancelled';
  await invitation.save();

  return invitation;
};

module.exports = {
  createInvitation,
  getBrandInvitations,
  getInvitationById,
  cancelInvitation
};
