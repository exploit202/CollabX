const mongoose = require('mongoose');
const Campaign = require('../../../models/campaign.model');
const Collaboration = require('../../../models/collaboration.model');
const Payment = require('../../../models/payment.model');
const Review = require('../../../models/review.model');
const Notification = require('../../../models/notification.model');

const getBrandAnalytics = async (brandUserId) => {
  const brandObjId = new mongoose.Types.ObjectId(brandUserId);

  const [
    totalCampaigns,
    activeCampaigns,
    totalCollaborations,
    activeCollaborations,
    completedCollaborations,
    distinctCreators,
    escrowPayments,
    releasedPayments,
    brandReviews
  ] = await Promise.all([
    Campaign.countDocuments({ brandId: brandUserId }),
    Campaign.countDocuments({ brandId: brandUserId, status: 'active' }),
    Collaboration.countDocuments({ brandId: brandUserId }),
    Collaboration.countDocuments({ brandId: brandUserId, status: { $nin: ['completed', 'cancelled'] } }),
    Collaboration.countDocuments({ brandId: brandUserId, status: 'completed' }),
    Collaboration.distinct('creatorId', { brandId: brandUserId }),
    Payment.find({ brandId: brandUserId, status: 'escrowed' }).select('amount'),
    Payment.find({ brandId: brandUserId, status: 'released' }).select('amount'),
    Review.find({ reviewerId: brandUserId, reviewerRole: 'brand' }).select('rating')
  ]);

  const totalEscrowedAmount = escrowPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalReleasedAmount = releasedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalReviews = brandReviews.length;
  const totalRatingSum = brandReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
  const averageCreatorRating = totalReviews > 0 ? Math.round((totalRatingSum / totalReviews) * 10) / 10 : 0;
  const collaborationCompletionRate = totalCollaborations > 0
    ? Math.round((completedCollaborations / totalCollaborations) * 1000) / 10
    : 0;

  return {
    totalCampaigns,
    activeCampaigns,
    totalCollaborations,
    activeCollaborations,
    completedCollaborations,
    totalCreatorsWorkedWith: distinctCreators.length,
    totalEscrowedAmount,
    totalReleasedAmount,
    averageCreatorRating,
    totalReviews,
    collaborationCompletionRate
  };
};

const getCollaborationActivity = async (collaborationId, userId) => {
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

  // Fallback milestone construction if events were created prior to notifications
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
  getBrandAnalytics,
  getCollaborationActivity
};
