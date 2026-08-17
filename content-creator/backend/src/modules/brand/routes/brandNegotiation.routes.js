const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/auth.middleware');
const validate = require('../../../middleware/validate.middleware');
const { validateAttachment } = require('../../../middleware/upload.middleware');
const {
  getBrandNegotiations,
  getBrandNegotiationById,
  addBrandCounterOffer,
  finalizeBrandAgreement,
} = require('../controllers/brandNegotiation.controller');
const {
  validateAddCounterOffer,
  validateFinalizeAgreement,
} = require('../../creator/validations/creatorNegotiation.validation');

router.use(protect);

router.get('/', getBrandNegotiations);
router.get('/:id', getBrandNegotiationById);
router.post('/:id/counter', validateAttachment, validate(validateAddCounterOffer), addBrandCounterOffer);
router.patch('/:id/counter', validateAttachment, validate(validateAddCounterOffer), addBrandCounterOffer);
router.post('/:id/finalize', validate(validateFinalizeAgreement), finalizeBrandAgreement);
router.patch('/:id/finalize', validate(validateFinalizeAgreement), finalizeBrandAgreement);

module.exports = router;
