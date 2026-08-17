const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const brandDashboardController = require('../controllers/brandDashboard.controller');

router.get('/', verifyJWT, authorizeRoles('brand'), brandDashboardController.getDashboard);

module.exports = router;
