const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const creatorRequestController = require('../controllers/creatorRequest.controller');

router.use(verifyJWT, authorizeRoles('creator'));

router.get('/', creatorRequestController.getRequests);
router.patch('/:id/respond', creatorRequestController.respond);

module.exports = router;
