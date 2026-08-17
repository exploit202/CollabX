const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const creatorNegotiationController = require('../controllers/creatorNegotiation.controller');

router.use(verifyJWT, authorizeRoles('creator'));

router.get('/', creatorNegotiationController.getNegotiations);
router.post('/:id/offers', creatorNegotiationController.counterOffer);
router.post('/:id/accept', creatorNegotiationController.acceptOffer);
router.patch('/:id/decision', creatorNegotiationController.acceptOffer);

module.exports = router;
