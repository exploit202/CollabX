const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const invitationController = require('../controllers/brandinvitation.controller');

router.use(verifyJWT);

router.post('/', authorizeRoles('brand'), invitationController.createInvitation);
router.get('/', authorizeRoles('brand'), invitationController.getBrandInvitations);
router.get('/:id', invitationController.getInvitationById);
router.patch('/:id/cancel', authorizeRoles('brand'), invitationController.cancelInvitation);

module.exports = router;
