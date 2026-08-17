const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const {
  createReviewValidation,
} = require("../validations/review.validation");

// Create Review
router.post(
  "/",
  createReviewValidation,
  reviewController.createReview
);

// Get All Reviews of a Creator
router.get(
  "/:creatorId",
  reviewController.getReviewsByCreator
);

// Get Average Rating
router.get(
  "/:creatorId/average",
  reviewController.getAverageRating
);

module.exports = router;