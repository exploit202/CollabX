const Campaign = require("../models/campaign");

// =====================================================
// CREATE CAMPAIGN
// =====================================================

const createCampaign = async (campaignData) => {
  return await Campaign.create(campaignData);
};

// =====================================================
// GET CAMPAIGNS
// =====================================================

const getCampaigns = async (filters = {}) => {
  return await Campaign.find(filters).sort({
    createdAt: -1,
  });
};

// =====================================================
// GET CAMPAIGN BY ID
// =====================================================

const getCampaignById = async (id) => {
  const campaign = await Campaign.findById(id);

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  return campaign;
};

// =====================================================
// UPDATE CAMPAIGN
// =====================================================

const updateCampaign = async (
  id,
  updatedData
) => {
  const campaign =
    await Campaign.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  return campaign;
};

// =====================================================
// DELETE CAMPAIGN
// =====================================================

const deleteCampaign = async (id) => {
  const campaign =
    await Campaign.findByIdAndDelete(id);

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  return campaign;
};

// =====================================================
// UPDATE CAMPAIGN STATUS
// =====================================================

const updateCampaignStatus = async (
  id,
  status
) => {
  const campaign =
    await Campaign.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  return campaign;
};

// =====================================================
// INCREMENT APPLICATION COUNT
// =====================================================

const incrementApplicationsCount = async (
  id
) => {
  const campaign =
    await Campaign.findByIdAndUpdate(
      id,
      {
        $inc: {
          applicantsCount: 1,
        },
      },
      {
        new: true,
      }
    );

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  return campaign;
};

// =====================================================
// INCREMENT VIEWS
// =====================================================

const incrementCampaignViews = async (
  id
) => {
  const campaign =
    await Campaign.findByIdAndUpdate(
      id,
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      }
    );

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  return campaign;
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  updateCampaignStatus,
  incrementApplicationsCount,
  incrementCampaignViews,
};