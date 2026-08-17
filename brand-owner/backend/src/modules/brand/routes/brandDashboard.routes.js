const express = require('express');

const router = express.Router();

const controller = require('../controllers/brandDashboard.controller');
const { authenticate } = require('../../../middleware/auth.middleware');

router.get('/', authenticate, controller.getDashboard);

module.exports = router;