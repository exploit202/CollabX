const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../../../middleware/auth.middleware');
const controller = require('../controllers/creatorAnalytics.controller');

router.use(verifyJWT, authorizeRoles('creator'));

router.get('/', controller.getCreatorAnalytics);

module.exports = router;
