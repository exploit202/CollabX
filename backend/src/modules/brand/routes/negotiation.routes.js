const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const negotiationController = require('../controllers/brandnegotiation.controller');

router.use(verifyJWT);

router.post('/', negotiationController.createNegotiation);
router.get('/', authorizeRoles('brand'), negotiationController.getBrandNegotiations);
router.get('/:id', negotiationController.getNegotiationById);
router.post('/:id/offers', negotiationController.createOffer);
router.post('/:id/accept', negotiationController.acceptOffer);
router.patch('/:id/decision', negotiationController.acceptOffer);

module.exports = router;
