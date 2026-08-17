const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth.middleware');
const settingsController = require('../controllers/brandsettings.controller');

router.use(authenticate);

// Get notification preferences
router.get('/notifications', settingsController.getNotificationPreferences);

// Update notification preferences
router.patch('/notifications', settingsController.updateNotificationPreferences);

// Update password
router.patch('/password', settingsController.updatePassword);

module.exports = router;
