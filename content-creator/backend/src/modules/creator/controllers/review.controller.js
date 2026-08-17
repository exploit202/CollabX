const { validationResult } = require("express-validator");
const reviewService = require("../services/review.service");

// Create Review
const createReview = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const review = await reviewService.createReview(req.body);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Reviews of Creator
const getReviewsByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const reviews = await reviewService.getReviewsByCreator(creatorId);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Average Rating
const getAverageRating = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const average = await reviewService.getAverageRating(creatorId);

    res.status(200).json({
      success: true,
      data: average,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getReviewsByCreator,
  getAverageRating,
};