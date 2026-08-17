const creatorAnalyticsService = require('../services/creatorAnalytics.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const getCreatorAnalytics = async (req, res, next) => {
  try {
    const creatorUserId = getUserId(req);
    const analytics = await creatorAnalyticsService.getCreatorAnalytics(creatorUserId);
    return successResponse(res, 200, 'Creator analytics retrieved.', analytics);
  } catch (error) {
    next(error);
  }
};

const getCreatorCollaborationActivity = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const activity = await creatorAnalyticsService.getCreatorCollaborationActivity(req.params.id, userId);
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
  getCreatorAnalytics,
  getCreatorCollaborationActivity
};
