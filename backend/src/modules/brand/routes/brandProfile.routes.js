const router = require('express').Router();
const { verifyJWT } = require('../../../middleware/auth.middleware');
const controller = require('../controllers/brandProfile.controller');

router.use(verifyJWT);

router.get('/', controller.getProfile);
router.patch('/', controller.updateProfile);

module.exports = router;
