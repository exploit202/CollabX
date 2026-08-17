const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/auth.middleware');
const { sendInvitation, getBrandInvitations } = require('../controllers/brandInvitation.controller');

router.use(protect);

router.post('/', sendInvitation);
router.get('/', getBrandInvitations);

module.exports = router;
