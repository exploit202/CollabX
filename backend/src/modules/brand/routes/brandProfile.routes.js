const router = require('express').Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const { handleProfileImageUpload } = require('../../../middleware/upload.middleware');
const controller = require('../controllers/brandProfile.controller');

router.use(verifyJWT);

router.get('/', controller.getProfile);
router.patch('/', controller.updateProfile);

router.post('/upload-image', authorizeRoles('brand'), handleProfileImageUpload, controller.uploadProfileImage);
router.post('/image', authorizeRoles('brand'), handleProfileImageUpload, controller.uploadProfileImage);
router.post('/avatar', authorizeRoles('brand'), handleProfileImageUpload, controller.uploadProfileImage);

module.exports = router;
