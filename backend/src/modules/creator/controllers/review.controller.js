const reviewService = require('../services/review.service');
const { successResponse } = require('../../../utils/apiResponse');
const { verifyAccessToken } = require('../../../utils/jwt');

const getUserId = (req) => {
  if (req.user?.userId || req.user?._id || req.user?.id) {
    return req.user.userId || req.user._id || req.user.id;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = verifyAccessToken(authHeader.split(' ')[1]);
      return decoded.userId || decoded._id || decoded.id;
    } catch (_) {}
  }
  return null;
};

const getUserRole = (req) => {
  if (req.user?.role) return req.user.role;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = verifyAccessToken(authHeader.split(' ')[1]);
      return decoded.role;
    } catch (_) {}
  }
  return 'creator';
};

const getReviews = async (req, res, next) => {
  try {
    const userId = req.query.creatorId || req.query.userId || getUserId(req);
    const userRole = req.query.creatorId ? 'creator' : getUserRole(req);
    const data = await reviewService.getReviewsByUser(userId, userRole);
    return successResponse(res, 200, 'Reviews retrieved.', data);
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const reviewerUserId = getUserId(req);
    if (!reviewerUserId) {
      const error = new Error('Unauthorized review session');
      error.statusCode = 401;
      throw error;
    }
    const reviewerRole = getUserRole(req);
    const review = await reviewService.createReview(reviewerUserId, reviewerRole, req.body);
    return successResponse(res, 201, 'Review submitted successfully.', review);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  createReview
};
