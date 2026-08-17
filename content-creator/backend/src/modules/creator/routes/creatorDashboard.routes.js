const express = require('express');
const router = express.Router();

const { protect } = require('../../../middleware/auth.middleware');
const { getDashboard } = require('../controllers/creatorDashboard.controller');

router.use(protect);

router.get('/', getDashboard);

module.exports = router;
