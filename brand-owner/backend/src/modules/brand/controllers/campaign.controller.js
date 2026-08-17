const campaignService = require("../services/campaign.service");
const {
  createCampaignSchema,
  updateCampaignSchema,
  updateCampaignStatusSchema,
} = require("../validations/campaign.validation");

const getUserId = (req) => {
  return req.user?.userId;
};

const getUserRole = (req) => {
  return req.user?.role;
};
const isBrand = (req) => {
  const role = getUserRole(req);

  return role === "brand" || role === "BRAND";
};

// CREATE CAMPAIGN
const createCampaign = async (req, res) => {
  try {
    if (!isBrand(req)) {
      return res.status(403).json({
        success: false,
        message: "Only brands can create campaigns",
      });
    }

    const brandId = getUserId(req);

    if (!brandId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const validation = createCampaignSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign data",
        errors: validation.error.flatten(),
      });
    }

    const campaignData = {
      ...validation.data,
      brandId,
      brandName:
        req.user?.brandName ||
        req.user?.name ||
        req.user?.fullName ||
        "Brand",
      brandImage:
        req.user?.brandImage ||
        req.user?.profileImage ||
        req.user?.avatar ||
        "",
      deadline: new Date(validation.data.deadline),
    };

    const campaign = await campaignService.createCampaign(campaignData);

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    console.error("Create campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create campaign",
      error: error.message,
    });
  }
};

// GET CAMPAIGNS
const getCampaigns = async (req, res) => {
  try {
    const brandId = getUserId(req);

    if (!brandId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const filters = {
      brandId,
    };

    if (req.query.status) {
      filters.status = req.query.status;
    }

    const campaigns = await campaignService.getCampaigns(filters);

    return res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    console.error("Get campaigns error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
      error: error.message,
    });
  }
};

    

// GET CAMPAIGN BY ID
const getCampaignById = async (req, res) => {
  try {
    const campaign = await campaignService.getCampaignById(
      req.params.id
    );

    await campaignService.incrementCampaignViews(req.params.id);

    return res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Get campaign error:", error);

    if (error.message === "Campaign not found") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaign",
      error: error.message,
    });
  }
};

// UPDATE CAMPAIGN
const updateCampaign = async (req, res) => {
  try {
    if (!isBrand(req)) {
      return res.status(403).json({
        success: false,
        message: "Only brands can update campaigns",
      });
    }

    const brandId = getUserId(req);

    if (!brandId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const existingCampaign =
      await campaignService.getCampaignById(req.params.id);

    if (String(existingCampaign.brandId) !== String(brandId)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own campaigns",
      });
    }

    const validation = updateCampaignSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign data",
        errors: validation.error.flatten(),
      });
    }

    const updateData = {
      ...validation.data,
    };

    if (validation.data.deadline) {
      updateData.deadline = new Date(validation.data.deadline);
    }

    delete updateData.brandId;
    delete updateData.brandName;
    delete updateData.brandImage;

    const campaign = await campaignService.updateCampaign(
      req.params.id,
      updateData
    );

    return res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: campaign,
    });
  } catch (error) {
    console.error("Update campaign error:", error);

    if (error.message === "Campaign not found") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update campaign",
      error: error.message,
    });
  }
};

// DELETE CAMPAIGN
const deleteCampaign = async (req, res) => {
  try {
    if (!isBrand(req)) {
      return res.status(403).json({
        success: false,
        message: "Only brands can delete campaigns",
      });
    }

    const brandId = getUserId(req);

    if (!brandId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const existingCampaign =
      await campaignService.getCampaignById(req.params.id);

    if (String(existingCampaign.brandId) !== String(brandId)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own campaigns",
      });
    }

    await campaignService.deleteCampaign(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Delete campaign error:", error);

    if (error.message === "Campaign not found") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete campaign",
      error: error.message,
    });
  }
};

// UPDATE CAMPAIGN STATUS
const updateCampaignStatus = async (req, res) => {
  try {
    if (!isBrand(req)) {
      return res.status(403).json({
        success: false,
        message: "Only brands can change campaign status",
      });
    }

    const brandId = getUserId(req);

    if (!brandId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const existingCampaign =
      await campaignService.getCampaignById(req.params.id);

    if (String(existingCampaign.brandId) !== String(brandId)) {
      return res.status(403).json({
        success: false,
        message: "You can only change your own campaigns",
      });
    }

    const validation = updateCampaignStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign status",
        errors: validation.error.flatten(),
      });
    }

    const campaign = await campaignService.updateCampaignStatus(
      req.params.id,
      validation.data.status
    );

    return res.status(200).json({
      success: true,
      message: "Campaign status updated successfully",
      data: campaign,
    });
  } catch (error) {
    console.error("Update campaign status error:", error);

    if (error.message === "Campaign not found") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update campaign status",
      error: error.message,
    });
  }
};

// INCREMENT APPLICATION COUNT
const incrementApplicationsCount = async (req, res) => {
  try {
    const campaign =
      await campaignService.incrementApplicationsCount(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Application count updated",
      data: campaign,
    });
  } catch (error) {
    console.error("Increment application count error:", error);

    if (error.message === "Campaign not found") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update application count",
      error: error.message,
    });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  updateCampaignStatus,
  incrementApplicationsCount,
};