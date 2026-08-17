const express = require('express');
const router = express.Router();
const validateRequest = require('../../../middleware/validation.middleware');
const { verifyJWT } = require('../../../middleware/auth.middleware');
const { loginSchema } = require('../validations/login.validation');
const authController = require('../controllers/auth.controller');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and set cookie
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Return the current authenticated user's safe profile
 * @access  Private
 */
router.get('/me', verifyJWT, authController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Clear the HTTP-only auth cookie
 * @access  Public
 */
router.post('/logout', authController.logout);

module.exports = router;
