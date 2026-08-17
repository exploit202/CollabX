const express = require('express');
const router = express.Router();
const validateRequest = require('../../../middleware/validation.middleware');
const { brandRegistrationSchema } = require('../validations/brandRegistration.validation');
const brandAuthController = require('../controllers/brandAuth.controller');
const { loginSchema } = require('../../auth/validations/login.validation');

router.post('/register', validateRequest(brandRegistrationSchema), brandAuthController.register);
router.post('/login', validateRequest(loginSchema), brandAuthController.login);

module.exports = router;
