const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const creatorDashboardController = require('../controllers/creatorDashboard.controller');

router.get('/', verifyJWT, authorizeRoles('creator'), creatorDashboardController.getDashboard);

module.exports = router;
