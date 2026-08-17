const express = require('express');
const router = express.Router();
const {
  authenticate,
  authorize,
} = require('../../../middleware/auth.middleware');
const creatorInvitationController = require('../controllers/creatorinvitation.controller');

router.use(authenticate, authorize('creator'));

// Get all invitations for logged-in Creator
router.get(
  '/',
  creatorInvitationController.getInvitations
);

// Get one invitation
router.get(
  '/:id',
  creatorInvitationController.getInvitation
);

// Respond to invitation (accept/reject)
router.patch(
  '/:id/respond',
  creatorInvitationController.respondToInvitation
);

module.exports = router;
