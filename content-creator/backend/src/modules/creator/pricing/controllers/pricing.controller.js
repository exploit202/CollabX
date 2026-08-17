const { validationResult } = require("express-validator");
const pricingService = require("../services/pricing.service");

// Create Pricing
const createPricing = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const pricing = await pricingService.createPricing(req.body);

    res.status(201).json({
      success: true,
      message: "Pricing package created successfully",
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Pricing of Creator
const getPricingByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const pricing = await pricingService.getPricingByCreator(creatorId);

    res.status(200).json({
      success: true,
      count: pricing.length,
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Pricing Package
const getPricingById = async (req, res) => {
  try {
    const pricing = await pricingService.getPricingById(req.params.id);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Pricing package not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Pricing
const updatePricing = async (req, res) => {
  try {
    const pricing = await pricingService.updatePricing(
      req.params.id,
      req.body
    );

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Pricing package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pricing package updated successfully",
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Enable / Disable Pricing
const togglePricingStatus = async (req, res) => {
  try {
    const pricing = await pricingService.togglePricingStatus(req.params.id);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Pricing package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Pricing package ${
        pricing.isActive ? "enabled" : "disabled"
      } successfully`,
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPricing,
  getPricingByCreator,
  getPricingById,
  updatePricing,
  togglePricingStatus,
};