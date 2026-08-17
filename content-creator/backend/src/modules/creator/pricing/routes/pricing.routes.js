const express = require("express");
const router = express.Router();

const pricingController = require("../controllers/pricing.controller");

const {
  createPricingValidation,
} = require("../validations/pricing.validation");

// Create Pricing
router.post(
  "/",
  createPricingValidation,
  pricingController.createPricing
);

// Get Single Pricing Package
router.get(
  "/package/:id",
  pricingController.getPricingById
);

// Get All Pricing of Creator
router.get(
  "/:creatorId",
  pricingController.getPricingByCreator
);

// Update Pricing
router.put(
  "/:id",
  pricingController.updatePricing
);

// Enable / Disable Pricing
router.patch(
  "/:id/status",
  pricingController.togglePricingStatus
);

module.exports = router;