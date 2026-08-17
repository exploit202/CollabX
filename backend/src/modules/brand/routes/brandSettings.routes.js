const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const brandSettingsController = require('../controllers/brandSettings.controller');

router.get('/', verifyJWT, authorizeRoles('brand'), brandSettingsController.getSettings);
router.patch('/', verifyJWT, authorizeRoles('brand'), brandSettingsController.updateSettings);
router.patch('/password', verifyJWT, authorizeRoles('brand'), brandSettingsController.changePassword);

module.exports = router;
