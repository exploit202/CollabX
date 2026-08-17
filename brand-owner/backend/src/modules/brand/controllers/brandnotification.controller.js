const mongoose = require('mongoose');
const notificationService = require('../services/brandnotification.service');

const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.body);

    return res.status(201).json({
      success: true,
      message: 'Notification created successfully.',
      data: {
        notification
      }
    });
  } catch (error) {
    next(error);
  }
};

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID.'
      });
    }

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID.'
      });
    }
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
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification
};