const centralNotificationService = require('../../../services/notification.service');

module.exports = {
  createNotification: centralNotificationService.createNotification,
  getNotifications: centralNotificationService.getNotifications,
  markAsRead: centralNotificationService.markAsRead,
  markAllAsRead: centralNotificationService.markAllAsRead,
  NOTIF_TYPE_PREFERENCE_MAP: centralNotificationService.NOTIF_TYPE_PREFERENCE_MAP
};
