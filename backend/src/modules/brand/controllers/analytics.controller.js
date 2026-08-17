const analyticsService = require('../services/analytics.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const getBrandAnalytics = async (req, res, next) => {
  try {
    const brandUserId = getUserId(req);
    const analytics = await analyticsService.getBrandAnalytics(brandUserId);
    return successResponse(res, 200, 'Brand analytics retrieved.', analytics);
  } catch (error) {
    next(error);
  }
};

const getCollaborationActivity = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const activity = await analyticsService.getCollaborationActivity(req.params.id, userId);
    return res.status(200).json({
      success: true,
      collaborationId: activity.collaborationId,
      activities: activity.activities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBrandAnalytics,
  getCollaborationActivity
};
