const express = require('express');
const router = express.Router();
const validateRequest = require('../../../middleware/validation.middleware');
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const {
  creatorRegistrationSchema,
  creatorPlatformUpdateSchema,
  creatorPlatformVerifySchema,
  creatorOtpVerifySchema
} = require('../validations/creatorRegistration.validation');
const { loginSchema } = require('../../auth/validations/login.validation');
const creatorAuthController = require('../controllers/creatorAuth.controller');

/**
 * @route   POST /api/creator/register
 * @desc    Route for Creator Registration.
 * @access  Public
 */
router.post('/register', validateRequest(creatorRegistrationSchema), creatorAuthController.register);

/**
 * @route   POST /api/creator/login
 * @desc    Authenticate Content Creator user and set cookie.
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), creatorAuthController.login);

/**
 * @route   PATCH /api/creator/profile/platforms
 * @desc    Update the authenticated creator's selected platforms.
 * @access  Private
 */
router.patch(
  '/profile/platforms',
  verifyJWT,
  authorizeRoles('creator'),
  validateRequest(creatorPlatformUpdateSchema),
  creatorAuthController.updatePlatforms
);

/**
 * @route   POST /api/creator/platform/verify
 * @desc    Verify a creator's social platform profile URL.
 * @access  Public
 */
router.post(
  '/platform/verify',
  validateRequest(creatorPlatformVerifySchema),
  creatorAuthController.verifyPlatformUrl
);

/**
 * @route   POST /api/creator/otp/send
 * @desc    Generate and email an OTP code.
 * @access  Private (signup session)
 */
router.post(
  '/otp/send',
  verifyJWT,
  authorizeRoles('creator'),
  creatorAuthController.requestOtp
);

/**
 * @route   POST /api/creator/otp/verify
 * @desc    Verify the submitted OTP code.
 * @access  Private (signup session)
 */
router.post(
  '/otp/verify',
  verifyJWT,
  authorizeRoles('creator'),
  validateRequest(creatorOtpVerifySchema),
  creatorAuthController.verifyOtp
);

module.exports = router;
