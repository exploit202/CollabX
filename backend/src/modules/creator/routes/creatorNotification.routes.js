const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../../../middleware/auth.middleware');
const controller = require('../controllers/creatorNotification.controller');

router.use(verifyJWT);

router.get('/', controller.getNotifications);
router.patch('/read-all', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);

module.exports = router;
