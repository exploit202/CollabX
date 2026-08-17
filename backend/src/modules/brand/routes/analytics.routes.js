const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const controller = require('../controllers/analytics.controller');

router.use(verifyJWT);

router.get('/', authorizeRoles('brand'), controller.getBrandAnalytics);

module.exports = router;
