const express = require('express');
const router = express.Router();
const validateRequest = require('../../../middleware/validation.middleware');
const { verifyJWT } = require('../../../middleware/auth.middleware');
const { loginSchema } = require('../validations/login.validation');
const {
  sendResetOtpSchema,
  verifyResetOtpSchema,
  resetPasswordSchema
} = require('../validations/forgotPassword.validation');
const authController = require('../controllers/auth.controller');

router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', verifyJWT, authController.getCurrentUser);
router.post('/logout', authController.logout);

// Forgot Password Flow Routes & Aliases
router.post('/forgot-password', validateRequest(sendResetOtpSchema), authController.requestPasswordReset);
router.post('/forgot-password/send-otp', validateRequest(sendResetOtpSchema), authController.requestPasswordReset);
router.post('/forgot-password/verify-otp', validateRequest(verifyResetOtpSchema), authController.verifyPasswordResetOtp);
router.post('/verify-reset-otp', validateRequest(verifyResetOtpSchema), authController.verifyPasswordResetOtp);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

module.exports = router;
