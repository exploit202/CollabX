const express = require("express");

const router = express.Router();

const {
  getCampaigns,
  getBrands,
} = require("../controllers/discoverController");

// ==========================================
// Discover Campaigns
// ==========================================

// GET /api/discover/campaigns
router.get("/campaigns", getCampaigns);

// ==========================================
// Discover Brands
// ==========================================

// GET /api/discover/brands
router.get("/brands", getBrands);

module.exports = router;