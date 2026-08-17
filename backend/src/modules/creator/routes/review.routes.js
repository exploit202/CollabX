const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../../../middleware/auth.middleware');
const reviewController = require('../controllers/review.controller');

router.get('/', reviewController.getReviews);
router.post('/', verifyJWT, reviewController.createReview);

module.exports = router;
