const express = require('express');
const router = express.Router();

const { protect } = require('../../../middleware/auth.middleware');
const {
  getProfile,
  updateProfile
} = require('../controllers/creatorProfile.controller');

router.use(protect);

router.get('/', getProfile);
router.patch('/', updateProfile);

module.exports = router;
