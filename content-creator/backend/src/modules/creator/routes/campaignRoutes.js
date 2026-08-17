const express = require("express");
const router = express.Router();

const campaignController = require("../controllers/campaignController");

// Create Campaign
router.post("/", campaignController.createCampaign);

// Get All Campaigns
router.get("/", campaignController.getAllCampaigns);

// Get Campaign By ID
router.get("/:id", campaignController.getCampaignById);

// Update Campaign
router.patch("/:id", campaignController.updateCampaign);

// Delete Campaign
router.delete("/:id", campaignController.deleteCampaign);

// Update Campaign Status
router.patch("/:id/status", campaignController.updateCampaignStatus);

module.exports = router;