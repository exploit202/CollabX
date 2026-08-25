const express = require('express');
const router = express.Router();
const validateRequest = require('../../../middleware/validation.middleware');
const { verifyJWT } = require('../../../middleware/auth.middleware');
const {
  creatorRegistrationSchema,
  creatorPlatformUpdateSchema,
  creatorOtpVerifySchema
} = require('../validations/creatorRegistration.validation');
const { loginSchema } = require('../../auth/validations/login.validation');
const creatorAuthController = require('../controllers/creatorAuth.controller');

const authController = require('../../auth/controllers/auth.controller');
const {
  sendResetOtpSchema,
  verifyResetOtpSchema,
  resetPasswordSchema
} = require('../../auth/validations/forgotPassword.validation');

router.post('/register', validateRequest(creatorRegistrationSchema), creatorAuthController.register);
router.post('/login', validateRequest(loginSchema), creatorAuthController.login);
router.patch('/platforms', verifyJWT, validateRequest(creatorPlatformUpdateSchema), creatorAuthController.updatePlatforms);
router.post('/platform/verify', verifyJWT, creatorAuthController.verifyPlatformUrl);
router.post('/otp/send', verifyJWT, creatorAuthController.requestEmailOtp);
router.post('/otp/verify', verifyJWT, validateRequest(creatorOtpVerifySchema), creatorAuthController.verifyEmailOtp);

// Forgot Password Aliases
router.post('/forgot-password', validateRequest(sendResetOtpSchema), authController.requestPasswordReset);
router.post('/forgot-password/send-otp', validateRequest(sendResetOtpSchema), authController.requestPasswordReset);
router.post('/forgot-password/verify-otp', validateRequest(verifyResetOtpSchema), authController.verifyPasswordResetOtp);
router.post('/verify-reset-otp', validateRequest(verifyResetOtpSchema), authController.verifyPasswordResetOtp);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

module.exports = router;
