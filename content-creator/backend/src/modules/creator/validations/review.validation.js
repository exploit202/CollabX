const { body } = require("express-validator");

const createReviewValidation = [
  body("creatorId")
    .notEmpty()
    .withMessage("Creator ID is required"),

  body("collaborationId")
    .notEmpty()
    .withMessage("Collaboration ID is required"),

  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("review")
    .trim()
    .notEmpty()
    .withMessage("Review is required"),
];

module.exports = {
  createReviewValidation,
};