const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/auth.middleware');
const validate = require('../../../middleware/validate.middleware');
const {
  createOrder,
  verifyPayment,
  releasePayout,
  getPaymentHistory,
  savePayoutAccount,
} = require('../controllers/payment.controller');
const {
  validateCreateOrder,
  validateVerifyPayment,
  validateReleasePayout,
} = require('../validations/payment.validation');

router.use(protect);

router.post('/create-order', validate(validateCreateOrder), createOrder);
router.post('/verify', validate(validateVerifyPayment), verifyPayment);
router.post('/release-payout', validate(validateReleasePayout), releasePayout);
router.get('/history', getPaymentHistory);
router.post('/payout-account', savePayoutAccount);

module.exports = router;
