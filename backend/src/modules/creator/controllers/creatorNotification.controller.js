const notificationService = require('../services/creatorNotification.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const getNotifications = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const notifications = await notificationService.getNotifications(userId);
    return successResponse(res, 200, 'Creator notifications retrieved.', notifications);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const notification = await notificationService.markAsRead(req.params.id, userId);
    return successResponse(res, 200, 'Notification marked as read.', notification);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
