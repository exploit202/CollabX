const Invitation = require('../../brand/models/invitation.model');
const Notification = require('../../brand/models/notification.model');

const getCreatorInvitations = async (creatorId) => {
  return Invitation.find({ creatorId })
    .sort({ createdAt: -1 });
};

const getInvitationById = async (creatorId, invitationId) => {
  return Invitation.findOne({
    _id: invitationId,
    creatorId
  });
};

const respondToInvitation = async (creatorId, invitationId, status) => {
  if (!['accepted', 'rejected', 'negotiating'].includes(status)) {
    const error = new Error(`Invalid status: ${status}`);
    error.statusCode = 400;
    throw error;
  }

  const invitation = await Invitation.findOne({
    _id: invitationId,
    creatorId
  });

  if (!invitation) {
    const error = new Error('Invitation not found.');
    error.statusCode = 404;
    throw error;
  }

  invitation.status = status;
  await invitation.save();

  // Notify brand about creator's response
  const statusMessage = {
    accepted: 'accepted',
    rejected: 'declined',
    negotiating: 'opened negotiation for'
  };

  await Notification.create({
    userId: invitation.brandId,
    type: 'invitation',
    title: `Invitation ${status === 'accepted' ? 'Accepted' : status === 'rejected' ? 'Declined' : 'Negotiating'}`,
    message: `${invitation.creatorName} has ${statusMessage[status]} your invitation for ${invitation.campaignTitle}.`,
    relatedId: invitation._id
  });

  return invitation;
};

module.exports = {
  getCreatorInvitations,
  getInvitationById,
  respondToInvitation
};
