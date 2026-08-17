const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const controller = require('../controllers/activeCollaboration.controller');
const analyticsController = require('../controllers/analytics.controller');

router.use(verifyJWT);

router.get('/', authorizeRoles('brand'), controller.getCollaborations);
router.get('/:id/activity', analyticsController.getCollaborationActivity);
router.get('/:id', controller.getCollaborationById);
router.patch('/:id/revision', authorizeRoles('brand'), controller.requestRevision);
router.patch('/:id/approve', authorizeRoles('brand'), controller.approveCollaboration);
router.patch('/:id/complete', controller.completeCollaboration);

module.exports = router;
