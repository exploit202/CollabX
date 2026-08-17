const mongoose = require('mongoose');
const Notification = require('../models/Notification.model');

const validateUserId = (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Invalid user ID');
    error.statusCode = 400;
    throw error;
  }
};

const getCreatorNotifications = async (userId, options = {}) => {
  validateUserId(userId);

  const page = Math.max(Number(options.page) || 1, 1);
  const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { userId: new mongoose.Types.ObjectId(userId) };

  if (options.unreadOnly === true) filter.read = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      read: false,
    }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUnreadNotificationCount = async (userId) => {
  validateUserId(userId);

  return Notification.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    read: false,
  });
};

const markNotificationAsRead = async (notificationId, userId) => {
  validateUserId(userId);

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    const error = new Error('Invalid notification ID');
    error.statusCode = 400;
    throw error;
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      userId: new mongoose.Types.ObjectId(userId),
    },
    { $set: { read: true } },
    { new: true }
  ).lean();

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

const markAllNotificationsAsRead = async (userId) => {
  validateUserId(userId);

  const result = await Notification.updateMany(
    {
      userId: new mongoose.Types.ObjectId(userId),
      read: false,
    },
    { $set: { read: true } }
  );

  return { modifiedCount: result.modifiedCount || 0 };
};

module.exports = {
  getCreatorNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
