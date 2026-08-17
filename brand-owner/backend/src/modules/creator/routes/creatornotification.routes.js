const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth.middleware');
const creatorNotificationController = require('../controllers/creatornotification.controller');

router.use(authenticate);

// Get all notifications
router.get('/', creatorNotificationController.getNotifications);

// Mark notification as read
router.patch('/:id/read', creatorNotificationController.markAsRead);

// Delete notification
router.delete('/:id', creatorNotificationController.deleteNotification);

module.exports = router;
