const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const controller = require('../controllers/payment.controller');

router.use(verifyJWT);

router.post('/escrow', authorizeRoles('brand'), controller.initiateEscrow);
router.patch('/:id/release', authorizeRoles('brand'), controller.releaseEscrow);
router.get('/brand', authorizeRoles('brand'), controller.getBrandPayments);
router.get('/creator', authorizeRoles('creator'), controller.getCreatorPayments);
router.get('/', controller.getBrandPayments);

module.exports = router;
