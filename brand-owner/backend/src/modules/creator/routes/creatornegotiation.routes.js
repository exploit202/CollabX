const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth.middleware');
const creatorNegotiationController = require('../controllers/creatornegotiation.controller');

router.use(authenticate);

// Get all negotiations for logged-in Creator
router.get(
  '/',
  creatorNegotiationController.getNegotiations
);

// Get one negotiation
router.get(
  '/:id',
  creatorNegotiationController.getNegotiation
);

// Add counter offer to negotiation
router.post(
  '/:id/offers',
  creatorNegotiationController.addOffer
);

// Update negotiation status
router.patch(
  '/:id/status',
  creatorNegotiationController.updateNegotiationStatus
);

module.exports = router;
