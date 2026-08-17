const mongoose = require('mongoose');

const Invitation = require('../../../models/invitation.model');
const Negotiation = require('../../../models/negotiation.model');
const Collaboration = require('../../../models/collaboration.model');
const CreatorProfile = require('../../../models/creatorProfile.model');

const getCreatorDashboard = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Invalid user ID');
    error.statusCode = 400;
    throw error;
  }

  const creatorObjId = new mongoose.Types.ObjectId(userId);

  const [
    pendingInvitations,
    completedCollaborations,
    activeCollaborations,
    openNegotiations,
    recentRequests,
    recentNegotiations,
    recentCollaborations,
    profile
  ] = await Promise.all([
    Invitation.countDocuments({
      $or: [{ creatorId: creatorObjId }, { creatorId: userId.toString() }],
      status: 'pending'
    }),
    Collaboration.find({
      $or: [{ creatorId: creatorObjId }, { creatorId: userId.toString() }],
      status: 'completed'
    }).select('agreedBudget agreedPrice'),
    Collaboration.find({
      $or: [{ creatorId: creatorObjId }, { creatorId: userId.toString() }],
      status: { $nin: ['completed', 'cancelled'] }
    }).sort({ updatedAt: -1 }).limit(5).lean(),
    Negotiation.countDocuments({
      $or: [{ creatorId: creatorObjId }, { creatorId: userId.toString() }],
      status: 'open'
    }),
    Invitation.find({
      $or: [{ creatorId: creatorObjId }, { creatorId: userId.toString() }]
    }).sort({ createdAt: -1 }).limit(5).lean(),
    Negotiation.find({
      $or: [{ creatorId: creatorObjId }, { creatorId: userId.toString() }]
    }).sort({ lastActivity: -1, updatedAt: -1 }).limit(5).lean(),
    Collaboration.find({
      $or: [{ creatorId: creatorObjId }, { creatorId: userId.toString() }]
    }).sort({ updatedAt: -1 }).limit(5).lean(),
    CreatorProfile.findOne({ userId: creatorObjId }).lean()
  ]);

  const totalEarnings = completedCollaborations.reduce(
    (sum, col) => sum + Number(col.agreedBudget || col.agreedPrice || 0),
    0
  );

  return {
    stats: {
      totalEarnings,
      brandInvitations: pendingInvitations,
      activeCampaigns: activeCollaborations.length,
      openNegotiations,
      profileViews: 0
    },
    profile,
    recentRequests,
    recentNegotiations,
    activeCollaborations: recentCollaborations
  };
};

module.exports = {
  getCreatorDashboard
};
