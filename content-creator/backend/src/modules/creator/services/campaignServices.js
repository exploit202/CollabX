const Campaign = require("../models/Campaign.js");

// Create Campaign
const createCampaign = async (campaignData) => {
  return await Campaign.create(campaignData);
};

// Get All Campaigns
const getAllCampaigns = async () => {
  return await Campaign.find().sort({ createdAt: -1 });
};

// Get Campaign By ID
const getCampaignById = async (id) => {
  return await Campaign.findById(id);
};

// Update Campaign
const updateCampaign = async (id, updatedData) => {
  return await Campaign.findByIdAndUpdate(
    id,
    updatedData,
    {
      new: true,
      runValidators: true,
    }
  );
};

// Delete Campaign
const deleteCampaign = async (id) => {
  return await Campaign.findByIdAndDelete(id);
};

// Update Campaign Status
const updateCampaignStatus = async (id, status) => {
  return await Campaign.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
    }
  );
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  updateCampaignStatus,
};