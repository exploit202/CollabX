const express = require('express');
const router = express.Router();
const validateRequest = require('../../../middleware/validation.middleware');
const { verifyJWT } = require('../../../middleware/auth.middleware');
const {
  brandRegistrationSchema,
  brandOtpVerifySchema
} = require('../validations/brandRegistration.validation');
const brandAuthController = require('../controllers/brandAuth.controller');
const { loginSchema } = require('../../auth/validations/login.validation');

const authController = require('../../auth/controllers/auth.controller');
const {
  sendResetOtpSchema,
  verifyResetOtpSchema,
  resetPasswordSchema
} = require('../../auth/validations/forgotPassword.validation');

router.post('/register', validateRequest(brandRegistrationSchema), brandAuthController.register);
router.post('/login', validateRequest(loginSchema), brandAuthController.login);
router.post('/otp/send', verifyJWT, brandAuthController.requestEmailOtp);
router.post('/otp/verify', verifyJWT, validateRequest(brandOtpVerifySchema), brandAuthController.verifyEmailOtp);

// Forgot Password Aliases
router.post('/forgot-password', validateRequest(sendResetOtpSchema), authController.requestPasswordReset);
router.post('/forgot-password/send-otp', validateRequest(sendResetOtpSchema), authController.requestPasswordReset);
router.post('/forgot-password/verify-otp', validateRequest(verifyResetOtpSchema), authController.verifyPasswordResetOtp);
router.post('/verify-reset-otp', validateRequest(verifyResetOtpSchema), authController.verifyPasswordResetOtp);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

module.exports = router;
