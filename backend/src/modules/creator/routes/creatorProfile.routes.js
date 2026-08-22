const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const { handleProfileImageUpload } = require('../../../middleware/upload.middleware');
const creatorProfileController = require('../controllers/creatorProfile.controller');

router.get('/', verifyJWT, creatorProfileController.getProfile);
router.patch('/', verifyJWT, authorizeRoles('creator'), creatorProfileController.updateProfile);

router.post('/upload-image', verifyJWT, authorizeRoles('creator'), handleProfileImageUpload, creatorProfileController.uploadProfileImage);
router.post('/image', verifyJWT, authorizeRoles('creator'), handleProfileImageUpload, creatorProfileController.uploadProfileImage);
router.post('/avatar', verifyJWT, authorizeRoles('creator'), handleProfileImageUpload, creatorProfileController.uploadProfileImage);

module.exports = router;
