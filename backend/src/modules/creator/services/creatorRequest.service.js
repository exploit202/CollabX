const mongoose = require('mongoose');
const Invitation = require('../../../models/invitation.model');
const Negotiation = require('../../../models/negotiation.model');
const Collaboration = require('../../../models/collaboration.model');
const Campaign = require('../../../models/campaign.model');

const getCreatorRequests = async (creatorId, status) => {
  const creatorObjId = new mongoose.Types.ObjectId(creatorId);
  const query = {
    $or: [{ creatorId: creatorObjId }, { creatorId: creatorId.toString() }]
  };
  if (status) query.status = status;

  return Invitation.find(query)
    .populate('campaignId', 'title description category budget deliverables requirements deadline status brandName brandLogo')
    .populate('brandId', 'fullName email profileImage')
    .sort({ createdAt: -1 });
};

const respondToInvitation = async (invitationId, creatorId, status) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    const error = new Error(`Invitation '${invitationId}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (String(invitation.creatorId) !== String(creatorId)) {
    const error = new Error('Unauthorized access to this invitation.');
    error.statusCode = 403;
    throw error;
  }

  invitation.status = status;
  await invitation.save();

  let activeCollaboration = null;
  let negotiationRoom = null;

  if (status === 'accepted') {
    const campaignDoc = invitation.campaignId
      ? await Campaign.findById(invitation.campaignId).lean()
      : null;

    const deadlineDate = campaignDoc?.deadline
      ? new Date(campaignDoc.deadline)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const campaignTitle = invitation.campaignTitle || campaignDoc?.title || 'Active Campaign Collaboration';

    activeCollaboration = await Collaboration.create({
      campaignId: invitation.campaignId || new mongoose.Types.ObjectId(),
      campaignTitle,
      deadline: deadlineDate,
      invitationId: invitation._id,
      negotiationId: new mongoose.Types.ObjectId(),
      brandId: invitation.brandId,
      brandName: invitation.brandName,
      brandLogo: invitation.brandLogo || '',
      creatorId: invitation.creatorId,
      creatorName: invitation.creatorName,
      creatorAvatar: invitation.creatorAvatar || '',
      deliverableType: Array.isArray(invitation.deliverables)
        ? invitation.deliverables.join(', ')
        : 'Agreed Deliverables',
      agreedBudget: invitation.proposedPrice,
      agreedPrice: invitation.proposedPrice,
      status: 'active',
      stage: 'agreement_finalized',
      startDate: new Date()
    });

    try {
      const creatorNotifService = require('./creatorNotification.service');
      await creatorNotifService.createNotification({
        userId: invitation.brandId,
        senderId: creatorId,
        type: 'invitation_accepted',
        title: 'Invitation Accepted',
        message: `Creator ${invitation.creatorName} accepted your invitation for "${campaignTitle}".`,
        entityType: 'Collaboration',
        entityId: activeCollaboration._id
      });
    } catch (err) {
      console.error('Notification error on invitation accept:', err);
    }
  } else if (status === 'rejected') {
    try {
      const creatorNotifService = require('./creatorNotification.service');
      await creatorNotifService.createNotification({
        userId: invitation.brandId,
        senderId: creatorId,
        type: 'invitation_rejected',
        title: 'Invitation Declined',
        message: `Creator ${invitation.creatorName} declined your invitation for "${invitation.campaignTitle}".`,
        entityType: 'Invitation',
        entityId: invitation._id
      });
    } catch (err) {
      console.error('Notification error on invitation reject:', err);
    }
  } else if (status === 'negotiating') {
    negotiationRoom = await Negotiation.findOne({ invitationId: invitation._id });

    if (!negotiationRoom) {
      negotiationRoom = await Negotiation.create({
        invitationId: invitation._id,
        campaignId: invitation.campaignId,
        campaignName: invitation.campaignTitle,
        brandId: invitation.brandId,
        brandName: invitation.brandName,
        brandLogo: invitation.brandLogo || '',
        creatorId: invitation.creatorId,
        creatorName: invitation.creatorName,
        creatorAvatar: invitation.creatorAvatar || '',
        proposedBudget: invitation.proposedPrice,
        currentBudget: invitation.proposedPrice,
        status: 'open',
        offers: [
          {
            senderId: invitation.brandId,
            senderRole: 'brand',
            senderName: invitation.brandName,
            senderAvatar: invitation.brandLogo || '',
            message: invitation.message || 'Initial Campaign Invitation Offer',
            proposedBudget: invitation.proposedPrice,
            status: 'offered',
            isRead: false
          }
        ],
        lastActivity: new Date()
      });
    }
  }

  return {
    invitation,
    collaboration: activeCollaboration,
    negotiation: negotiationRoom
  };
};

module.exports = {
  getCreatorRequests,
  respondToInvitation
};
