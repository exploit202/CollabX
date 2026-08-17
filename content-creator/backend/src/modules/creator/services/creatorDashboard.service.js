const mongoose = require('mongoose');

const Invitation = require('../models/Invitation.model');
const Negotiation = require('../models/Negotiation.model');
const Collaboration = require('../models/Collaboration.model');
const CreatorProfile = require('../models/creatorProfile.model');

const validateUserId = (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Invalid user ID');
    error.statusCode = 400;
    throw error;
  }
};

const getCreatorDashboard = async (userId) => {
  validateUserId(userId);

  const creatorId = new mongoose.Types.ObjectId(userId);

  const [
    pendingInvitations,
    completedCollaborations,
    activeCollaborations,
    openNegotiations,
    recentRequests,
    recentNegotiations,
    recentCollaborations,
    profile,
  ] = await Promise.all([
    Invitation.countDocuments({
      creatorId,
      status: 'pending',
    }),

    Collaboration.find({
      creatorId: userId,
      stage: 'completed',
    }).select('agreedPrice'),

    Collaboration.find({
      creatorId: userId,
      stage: { $ne: 'completed' },
    }).sort({ updatedAt: -1 }).limit(5).lean(),

    Negotiation.countDocuments({
      creatorId,
      status: 'open',
    }),

    Invitation.find({
      creatorId,
    }).sort({ createdAt: -1 }).limit(5).lean(),

    Negotiation.find({
      creatorId,
    }).sort({ lastActivity: -1, updatedAt: -1 }).limit(5).lean(),

    Collaboration.find({
      creatorId: userId,
    }).sort({ updatedAt: -1 }).limit(5).lean(),

    CreatorProfile.findOne({ userId: creatorId }).lean(),
  ]);

  const totalEarnings = completedCollaborations.reduce(
    (sum, collaboration) => sum + Number(collaboration.agreedPrice || 0),
    0
  );

  return {
    stats: {
      totalEarnings,
      brandInvitations: pendingInvitations,
      activeCampaigns: activeCollaborations.length,
      openNegotiations,
      profileViews: 0,
    },
    profile,
    recentRequests,
    recentNegotiations,
    activeCollaborations: recentCollaborations,
  };
};

module.exports = {
  getCreatorDashboard,
};
