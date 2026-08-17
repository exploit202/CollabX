// const express = require('express');
// const router = express.Router();
// const { protect } = require('../../../middleware/auth.middleware');
// const validate = require('../../../middleware/validate.middleware');
// const {
//   getNegotiations,
//   getNegotiationById,
//   sendCounterOffer,
//   acceptNegotiation,
//   rejectNegotiation,
//   markAsRead,
// } = require('../controllers/creatorNegotiation.controller');
// const {
//   validateSendCounterOffer,
//   validateRejectNegotiation,
// } = require('../validations/creatorNegotiation.validation');

// router.use(protect);

// // 1. Get List of Negotiations
// router.get('/', getNegotiations);

// // 2. Get Single Negotiation Room Details
// router.get('/:id', getNegotiationById);

// // 3. Send Counter Offer / Message (Supports POST & PATCH, /counter & /offer)
// router.post('/:id/counter', validate(validateSendCounterOffer), sendCounterOffer);
// router.patch('/:id/counter', validate(validateSendCounterOffer), sendCounterOffer);
// router.post('/:id/offer', validate(validateSendCounterOffer), sendCounterOffer);

// // 4. Accept Negotiation (Supports /accept & /finalize)
// router.post('/:id/accept', acceptNegotiation);
// router.post('/:id/finalize', acceptNegotiation);
// router.patch('/:id/finalize', acceptNegotiation);

// // 5. Reject Negotiation (Supports /reject)
// router.post('/:id/reject', validate(validateRejectNegotiation), rejectNegotiation);
// router.patch('/:id/reject', validate(validateRejectNegotiation), rejectNegotiation);

// // 6. Mark Messages as Read
// router.patch('/:id/read', markAsRead);
// router.post('/:id/read', markAsRead);

// module.exports = router;


const express = require('express');
const router = express.Router();

const { protect } = require('../../../middleware/auth.middleware');
const validate = require('../middleware/validateCreator.middleware');

const {
  getNegotiations,
  getNegotiationById,
  sendCounterOffer,
  acceptNegotiation,
  rejectNegotiation,
  markAsRead
} = require('../controllers/creatorNegotiation.controller');

const {
  validateSendCounterOffer,
  validateRejectNegotiation
} = require('../validations/creatorNegotiation.validation');

router.use(protect);

router.get('/', getNegotiations);

router.get('/:id', getNegotiationById);

router.post(
  '/:id/counter',
  validate(validateSendCounterOffer),
  sendCounterOffer
);

router.patch(
  '/:id/counter',
  validate(validateSendCounterOffer),
  sendCounterOffer
);

router.post(
  '/:id/offer',
  validate(validateSendCounterOffer),
  sendCounterOffer
);

router.post('/:id/accept', acceptNegotiation);
router.post('/:id/finalize', acceptNegotiation);
router.patch('/:id/finalize', acceptNegotiation);

router.post(
  '/:id/reject',
  validate(validateRejectNegotiation),
  rejectNegotiation
);

router.patch(
  '/:id/reject',
  validate(validateRejectNegotiation),
  rejectNegotiation
);

router.patch('/:id/read', markAsRead);
router.post('/:id/read', markAsRead);

module.exports = router;