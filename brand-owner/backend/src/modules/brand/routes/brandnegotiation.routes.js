const express = require('express');

const router = express.Router();

const { authenticate } = require('../../../middleware/auth.middleware');
const negotiationController = require('../controllers/brandnegotiation.controller');

router.use(authenticate);

// Create negotiation from an invitation
router.post(
  '/',
  negotiationController.createNegotiation
);

// Get all negotiations for logged-in Brand
router.get(
  '/',
  negotiationController.getNegotiations
);

// Send message / counter-offer
router.post(
  '/:id/offers',
  negotiationController.addOffer
);

// Get one negotiation
router.get(
  '/:id',
  negotiationController.getNegotiation
);

// Update negotiation
router.patch(
  '/:id',
  negotiationController.updateNegotiation
);

// Update negotiation status
router.patch(
  '/:id/status',
  negotiationController.updateNegotiationStatus
);


module.exports = router;