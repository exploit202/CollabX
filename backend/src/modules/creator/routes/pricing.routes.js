const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const pricingController = require('../controllers/pricing.controller');

router.get('/', pricingController.getPricing);
router.post('/', verifyJWT, authorizeRoles('creator'), pricingController.createPricing);
router.patch('/:id', verifyJWT, authorizeRoles('creator'), pricingController.updatePricing);
router.delete('/:id', verifyJWT, authorizeRoles('creator'), pricingController.deletePricing);

module.exports = router;
