const mongoose = require('mongoose');
const Collaboration = require('../../../models/collaboration.model');
const Payment = require('../../../models/payment.model');
const Review = require('../../../models/review.model');
const CreatorProfile = require('../../../models/creatorProfile.model');
const Notification = require('../../../models/notification.model');

const getCreatorAnalytics = async (creatorUserId) => {
  const [
    totalCollaborations,
    activeCollaborations,
    completedCollaborations,
    distinctBrands,
    escrowPayments,
    releasedPayments,
    creatorProfile,
    creatorReviews
  ] = await Promise.all([
    Collaboration.countDocuments({ creatorId: creatorUserId }),
    Collaboration.countDocuments({ creatorId: creatorUserId, status: { $nin: ['completed', 'cancelled'] } }),
    Collaboration.countDocuments({ creatorId: creatorUserId, status: 'completed' }),
    Collaboration.distinct('brandId', { creatorId: creatorUserId }),
    Payment.find({ creatorId: creatorUserId, status: 'escrowed' }).select('amount'),
    Payment.find({ creatorId: creatorUserId, status: 'released' }).select('amount'),
    CreatorProfile.findOne({ userId: creatorUserId }).lean(),
    Review.find({ creatorId: creatorUserId, reviewerRole: 'brand' }).select('rating')
  ]);

  const totalEscrowedAmount = escrowPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalReleasedEarnings = releasedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalReviews = creatorReviews.length > 0 ? creatorReviews.length : (creatorProfile?.totalReviews || 0);
  const totalRatingSum = creatorReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
  const averageRating = totalReviews > 0
    ? Math.round((totalRatingSum / totalReviews) * 10) / 10
    : (creatorProfile?.rating || 0);
  const collaborationCompletionRate = totalCollaborations > 0
    ? Math.round((completedCollaborations / totalCollaborations) * 1000) / 10
    : 0;

  return {
    totalCollaborations,
    activeCollaborations,
    completedCollaborations,
    totalBrandsWorkedWith: distinctBrands.length,
    totalEscrowedAmount,
    totalReleasedEarnings,
    averageRating,
    totalReviews,
    collaborationCompletionRate
  };
};

const getCreatorCollaborationActivity = async (collaborationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(collaborationId)) {
    const error = new Error('Invalid collaboration ID');
    error.statusCode = 400;
    throw error;
  }

  const collaboration = await Collaboration.findById(collaborationId);
  if (!collaboration) {
    const error = new Error('Collaboration not found');
    error.statusCode = 404;
    throw error;
  }

  const isBrand = String(collaboration.brandId?._id || collaboration.brandId) === String(userId);
  const isCreator = String(collaboration.creatorId?._id || collaboration.creatorId) === String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error('You do not have permission to view activity for this collaboration.');
    error.statusCode = 403;
    throw error;
  }

  const notifications = await Notification.find({
    $or: [{ entityId: collaboration._id }, { relatedId: collaboration._id }]
  }).sort({ createdAt: 1 }).lean();

  const activities = notifications.map((n) => ({
    type: n.type,
    title: n.title,
    description: n.message,
    createdAt: n.createdAt
  }));

  // Fallback milestone construction
  if (activities.length === 0) {
    if (collaboration.createdAt) {
      activities.push({
        type: 'collaboration_invitation',
        title: 'Collaboration Initialized',
        description: `Collaboration between ${collaboration.brandName} and ${collaboration.creatorName} started.`,
        createdAt: collaboration.createdAt
      });
    }
    if (collaboration.submissionDate || ['content_submitted', 'brand_approved', 'completed'].includes(collaboration.status)) {
      activities.push({
        type: 'content_submitted',
        title: 'Content Submitted',
        description: `${collaboration.creatorName} submitted content deliverables.`,
        createdAt: collaboration.updatedAt || collaboration.createdAt
      });
    }
    if (collaboration.approvedAt || ['brand_approved', 'completed'].includes(collaboration.status)) {
      activities.push({
        type: 'content_approved',
        title: 'Content Approved',
        description: `${collaboration.brandName} approved the deliverables.`,
        createdAt: collaboration.approvedAt || collaboration.updatedAt
      });
    }
    if (collaboration.completedAt || collaboration.status === 'completed') {
      activities.push({
        type: 'collaboration_completed',
        title: 'Collaboration Completed',
        description: `Collaboration for ${collaboration.campaignTitle} marked completed.`,
        createdAt: collaboration.completedAt || collaboration.updatedAt
      });
    }
  }

  return {
    collaborationId: collaboration._id,
    activities
  };
};

module.exports = {
  getCreatorAnalytics,
  getCreatorCollaborationActivity
};
