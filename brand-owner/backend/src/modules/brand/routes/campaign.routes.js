const express = require("express");

const campaignController = require("../controllers/campaign.controller");

const {
  authenticate,
  authorize,
} = require("../../../middleware/auth.middleware");

const router = express.Router();

// =====================================================
// PUBLIC ROUTES
// =====================================================

// Get all campaigns
router.get(
  "/",
  authenticate,
  campaignController.getCampaigns
);

router.get(
  "/:id",
  campaignController.getCampaignById
);
// =====================================================
// BRAND PROTECTED ROUTES
// =====================================================

// Create campaign
router.post(
  "/",
  authenticate,
  authorize("brand"),
  campaignController.createCampaign
);

// Update campaign
router.patch(
  "/:id",
  authenticate,
  authorize("brand"),
  campaignController.updateCampaign
);

// Delete campaign
router.delete(
  "/:id",
  authenticate,
  authorize("brand"),
  campaignController.deleteCampaign
);

// Update campaign status
router.patch(
  "/:id/status",
  authenticate,
  authorize("brand"),
  campaignController.updateCampaignStatus
);

// Increment application count
router.patch(
  "/:id/applications/count",
  authenticate,
  campaignController.incrementApplicationsCount
);

module.exports = router;