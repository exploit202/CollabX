const Notification = require('../../brand/models/notification.model');

const getNotifications = async (userId) => {
  return Notification.find({ userId })
    .sort({ createdAt: -1 });
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    userId
  });

  if (!notification) {
    const error = new Error('Notification not found.');
    error.statusCode = 404;
    throw error;
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    userId
  });

  if (!notification) {
    const error = new Error('Notification not found.');
    error.statusCode = 404;
    throw error;
  }

  await Notification.deleteOne({
    _id: notificationId,
    userId
  });
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification
};
