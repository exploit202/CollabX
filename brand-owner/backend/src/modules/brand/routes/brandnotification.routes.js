const express = require('express');
const router = express.Router();

const { authenticate } = require('../../../middleware/auth.middleware');
const notificationController = require('../controllers/brandnotification.controller');

router.use(authenticate);

// Create notification
router.post('/', notificationController.createNotification);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;