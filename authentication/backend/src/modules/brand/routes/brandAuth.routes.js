const express = require('express');
const router = express.Router();
const validateRequest = require('../../../middleware/validation.middleware');
const { brandRegistrationSchema } = require('../validations/brandRegistration.validation');
const brandAuthController = require('../controllers/brandAuth.controller');

const { loginSchema } = require('../../auth/validations/login.validation');

/**
 * @route   POST /api/brand/register
 * @desc    Route for Brand Registration.
 * @access  Public
 */
router.post('/register', validateRequest(brandRegistrationSchema), brandAuthController.register);

/**
 * @route   POST /api/brand/login
 * @desc    Route for Brand Login.
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), brandAuthController.login);

module.exports = router;
