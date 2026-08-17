const notificationService = require('../services/creatornotification.service');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully.',
      data: {
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: {
        notification
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification
};
