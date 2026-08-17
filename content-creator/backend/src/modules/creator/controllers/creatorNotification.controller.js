const {
  getCreatorNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require('../services/creatorNotification.service');

const getUserId = (req) => req.user?.userId || req.user?._id;

const getNotifications = async (req, res, next) => {
  try {
    const data = await getCreatorNotifications(getUserId(req), {
      page: req.query.page,
      limit: req.query.limit,
      unreadOnly: req.query.unreadOnly === 'true',
    });

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await getUnreadNotificationCount(getUserId(req));

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await markNotificationAsRead(
      req.params.id,
      getUserId(req)
    );

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await markAllNotificationsAsRead(getUserId(req));

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
