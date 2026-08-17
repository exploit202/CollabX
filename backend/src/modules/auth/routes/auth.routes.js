const express = require('express');
const router = express.Router();
const validateRequest = require('../../../middleware/validation.middleware');
const { verifyJWT } = require('../../../middleware/auth.middleware');
const { loginSchema } = require('../validations/login.validation');
const authController = require('../controllers/auth.controller');

router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', verifyJWT, authController.getCurrentUser);
router.post('/logout', authController.logout);

module.exports = router;
