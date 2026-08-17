const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth.middleware');
const settingsController = require('../controllers/creatorsettings.controller');

router.use(authenticate);

// Get notification preferences
router.get('/notifications', settingsController.getNotificationPreferences);

// Update notification preferences
router.patch('/notifications', settingsController.updateNotificationPreferences);

// Get payout settings
router.get('/payout', settingsController.getPayoutSettings);

// Update payout settings
router.patch('/payout', settingsController.updatePayoutSettings);

// Update password
router.patch('/password', settingsController.updatePassword);

module.exports = router;
