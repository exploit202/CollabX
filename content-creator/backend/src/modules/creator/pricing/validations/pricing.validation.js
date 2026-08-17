const { body } = require("express-validator");

const createPricingValidation = [
  body("creatorId")
    .notEmpty()
    .withMessage("Creator ID is required"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("platform")
    .notEmpty()
    .withMessage("Platform is required"),

  body("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price must be greater than or equal to 0"),

  body("deliveryDays")
    .isInt({ min: 1 })
    .withMessage("Delivery days must be at least 1"),

  body("revisions")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Revisions must be a non-negative integer"),

  body("deliverables")
    .optional()
    .isArray()
    .withMessage("Deliverables must be an array"),
];

module.exports = {
  createPricingValidation,
};