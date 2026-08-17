const Notification = require('../models/notification.model');

const createNotification = async ({
  userId,
  title,
  message,
  type = 'system',
  relatedId = null
}) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    relatedId
  });

  console.log('==============================');
  console.log('✅ NOTIFICATION CREATED');
  console.log('Notification ID:', notification._id.toString());
  console.log('Notification userId:', notification.userId.toString());
  console.log('Notification type:', notification.type);
  console.log('Notification relatedId:', notification.relatedId?.toString());
  console.log('==============================');

  return notification;
};

const getNotifications = async (userId) => {
  return await Notification.find({ userId }).sort({
    createdAt: -1
  });
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
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId
  });

  if (!notification) {
    const error = new Error('Notification not found.');
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification
};