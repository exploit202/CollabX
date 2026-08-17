const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const creatorProfileController = require('../controllers/creatorProfile.controller');

router.get('/', verifyJWT, creatorProfileController.getProfile);
router.patch('/', verifyJWT, authorizeRoles('creator'), creatorProfileController.updateProfile);

module.exports = router;
