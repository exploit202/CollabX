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

router.post('/register', validateRequest(brandRegistrationSchema), brandAuthController.register);
router.post('/login', validateRequest(loginSchema), brandAuthController.login);
router.post('/otp/send', verifyJWT, brandAuthController.requestEmailOtp);
router.post('/otp/verify', verifyJWT, validateRequest(brandOtpVerifySchema), brandAuthController.verifyEmailOtp);

module.exports = router;
