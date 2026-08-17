const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const creatorCollaborationController = require('../controllers/creatorCollaboration.controller');
const creatorAnalyticsController = require('../controllers/creatorAnalytics.controller');

router.use(verifyJWT, authorizeRoles('creator'));

router.get('/', creatorCollaborationController.getCollaborations);
router.get('/:id/activity', creatorAnalyticsController.getCreatorCollaborationActivity);
router.patch('/:id/submit', creatorCollaborationController.submitContent);

module.exports = router;
