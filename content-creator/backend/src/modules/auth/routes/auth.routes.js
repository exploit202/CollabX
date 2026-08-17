const express = require('express');
const router = express.Router();
const validateRequest = require('../../../middleware/validation.middleware');
const { registerSchema } = require('../validations/auth.validation');
const { loginSchema } = require('../validations/login.validation');
const authController = require('../controllers/auth.controller');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Creator, Brand, or Admin) and their profile
 * @access  Public
 */
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and set cookie
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), authController.login);

module.exports = router;
