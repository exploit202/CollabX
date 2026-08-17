const express = require('express');

const router = express.Router();

const {
  authenticate,
  authorize,
} = require('../../../middleware/auth.middleware');

const brandInvitationController = require('../controllers/brandinvitation.controller');

router.use(authenticate, authorize('brand'));

// Create invitation
router.post(
  '/',
  brandInvitationController.createInvitation
);

// Get all invitations for logged-in Brand
router.get(
  '/',
  brandInvitationController.getInvitations
);

// Get one invitation
router.get(
  '/:id',
  brandInvitationController.getInvitation
);

// Cancel invitation
router.patch(
  '/:id/cancel',
  brandInvitationController.cancelInvitation
);

module.exports = router;