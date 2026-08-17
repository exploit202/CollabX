const mongoose = require('mongoose');
const Review = require('../../../models/review.model');
const Collaboration = require('../../../models/collaboration.model');
const CreatorProfile = require('../../../models/creatorProfile.model');
const User = require('../../../models/user.model');

/**
 * Retrieves dynamic reputation metrics and reviews received by a user (Creator or Brand).
 */
const getReviewsByUser = async (userId, userRole = 'creator') => {
  if (!userId) {
    return {
      reviews: [],
      total: 0,
      average: 0,
      distribution: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 }))
    };
  }

  const userObjId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  // Filter reviews RECEIVED by this user (reviewedUserId === userObjId)
  const query = {
    $or: [
      { reviewedUserId: userObjId },
      { reviewedUserId: userId.toString() }
    ]
  };

  const dbReviews = await Review.find(query)
    .populate('reviewerId', 'fullName email profileImage avatar companyName role')
    .populate('collaborationId', 'campaignTitle agreedBudget agreedPrice status')
    .sort({ createdAt: -1 });

  const total = dbReviews.length;
  const totalRating = dbReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const average = total > 0 ? Math.round((totalRating / total) * 10) / 10 : 0;

  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: dbReviews.filter((r) => r.rating === rating).length
  }));

  const formattedReviews = dbReviews.map((r) => {
    const reviewer = r.reviewerId || {};
    const collab = r.collaborationId || {};
    const reviewerName = reviewer.fullName || reviewer.companyName || 'Collaborator';
    const reviewerAvatar = reviewer.profileImage || reviewer.avatar || null;
    const campaignTitle = collab.campaignTitle || 'Brand Campaign';
    const formattedDate = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : 'Recent';

    return {
      _id: r._id,
      id: r._id,
      collaborationId: r.collaborationId?._id || r.collaborationId,
      reviewerId: reviewer._id || r.reviewerId,
      reviewerName,
      reviewerAvatar,
      reviewerRole: r.reviewerRole,
      campaignTitle,
      rating: r.rating,
      comment: r.review,
      review: r.review,
      date: formattedDate,
      createdAt: r.createdAt
    };
  });

  return {
    reviews: formattedReviews,
    total,
    average,
    distribution
  };
};

/**
 * Alias helper for getReviewsByCreator
 */
const getReviewsByCreator = async (creatorId) => {
  const result = await getReviewsByUser(creatorId, 'creator');
  return result.reviews;
};

/**
 * Creates a two-way review for a completed or approved collaboration.
 */
const createReview = async (reviewerUserId, reviewerRole, { collaborationId, rating, review }) => {
  if (!collaborationId) {
    const error = new Error('Collaboration ID is required.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Rating Integer Range Validation (1 to 5)
  const numRating = Number(rating);
  if (
    rating === null ||
    rating === undefined ||
    isNaN(numRating) ||
    !Number.isInteger(numRating) ||
    numRating < 1 ||
    numRating > 5
  ) {
    const error = new Error('Rating must be an integer between 1 and 5.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Review Text Validation
  if (!review || typeof review !== 'string' || !review.trim()) {
    const error = new Error('Review text is required.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Collaboration Existence & Stage Check
  const collaboration = await Collaboration.findById(collaborationId);
  if (!collaboration) {
    const error = new Error('Collaboration not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!['completed', 'brand_approved'].includes(collaboration.status)) {
    const error = new Error(`Reviews can only be submitted after collaboration is completed. Current status: '${collaboration.status}'.`);
    error.statusCode = 400;
    throw error;
  }

  // 4. Participant & Role Validation
  const brandUserId = String(collaboration.brandId?._id || collaboration.brandId);
  const creatorUserId = String(collaboration.creatorId?._id || collaboration.creatorId);
  const callerId = String(reviewerUserId);

  const isBrand = callerId === brandUserId;
  const isCreator = callerId === creatorUserId;

  if (!isBrand && !isCreator) {
    const error = new Error('You do not have permission to review this collaboration.');
    error.statusCode = 403;
    throw error;
  }

  const actualReviewerRole = isBrand ? 'brand' : 'creator';
  const reviewedUserId = isBrand ? creatorUserId : brandUserId;
  const targetCreatorId = creatorUserId;

  // 5. Self-Review Prevention
  if (callerId === String(reviewedUserId)) {
    const error = new Error('Reviewer cannot review themselves.');
    error.statusCode = 400;
    throw error;
  }

  // 6. Duplicate Review Check per collaboration and reviewer
  const existingReview = await Review.findOne({
    collaborationId: collaboration._id,
    reviewerId: callerId
  });

  if (existingReview) {
    const error = new Error('You have already submitted a review for this collaboration.');
    error.statusCode = 400;
    throw error;
  }

  // 7. Create Review Record in MongoDB
  const newReview = await Review.create({
    collaborationId: collaboration._id,
    reviewerId: callerId,
    reviewerRole: actualReviewerRole,
    reviewedUserId,
    creatorId: targetCreatorId,
    rating: numRating,
    review: review.trim()
  });

  // 8. Aggregate Reputation for Recipient
  if (isBrand) {
    // Creator received review from Brand
    const targetObjId = mongoose.Types.ObjectId.isValid(creatorUserId)
      ? new mongoose.Types.ObjectId(creatorUserId)
      : creatorUserId;

    const creatorReviews = await Review.find({
      $or: [{ reviewedUserId: targetObjId }, { reviewedUserId: creatorUserId.toString() }],
      reviewerRole: 'brand'
    });

    const count = creatorReviews.length;
    const totalRating = creatorReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = count > 0 ? Math.round((totalRating / count) * 10) / 10 : 0;

    await CreatorProfile.findOneAndUpdate(
      { $or: [{ userId: targetObjId }, { userId: creatorUserId.toString() }] },
      { rating: avgRating, totalReviews: count }
    );
  } else {
    // Brand received review from Creator
    const targetObjId = mongoose.Types.ObjectId.isValid(brandUserId)
      ? new mongoose.Types.ObjectId(brandUserId)
      : brandUserId;

    const brandReviews = await Review.find({
      $or: [{ reviewedUserId: targetObjId }, { reviewedUserId: brandUserId.toString() }],
      reviewerRole: 'creator'
    });

    const count = brandReviews.length;
    const totalRating = brandReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = count > 0 ? Math.round((totalRating / count) * 10) / 10 : 0;

    await User.findByIdAndUpdate(
      brandUserId,
      { rating: avgRating, totalReviews: count }
    );
  }

  // 9. Dispatch Review Received Notification
  try {
    const creatorNotifService = require('./creatorNotification.service');
    await creatorNotifService.createNotification({
      userId: reviewedUserId,
      senderId: callerId,
      type: 'review_received',
      title: 'New Review Received',
      message: `You received a ${numRating}-star review for your completed collaboration!`,
      entityType: 'Review',
      entityId: newReview._id
    });
  } catch (err) {
    console.error('Notification error on review submission:', err);
  }

  return newReview;
};

module.exports = {
  getReviewsByUser,
  getReviewsByCreator,
  createReview
};
