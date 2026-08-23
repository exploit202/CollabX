const Campaign = require('../../../models/campaign.model');
const { createNotification } = require('../../../services/notification.service');

const createCampaign = async (campaignData) => {
  const campaign = await Campaign.create(campaignData);
  try {
    if (campaign.brandId) {
      await createNotification(
        campaign.brandId,
        'Campaign Brief Created',
        `Your campaign brief "${campaign.title}" has been published with budget ₹${Number(campaign.budget || 0).toLocaleString('en-IN')}.`,
        'campaign_created',
        { entityId: campaign._id, entityType: 'Campaign' }
      );
    }
  } catch (err) {
    console.error('Notification error on campaign creation:', err);
  }
  return campaign;
};

const getCampaigns = async (filters = {}) => {
  return await Campaign.find(filters).sort({ createdAt: -1 });
};

const getCampaignById = async (id) => {
  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  return campaign;
};

const updateCampaign = async (id, updatedData) => {
  const campaign = await Campaign.findByIdAndUpdate(
    id,
    updatedData,
    { new: true, runValidators: true }
  );
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  return campaign;
};

const deleteCampaign = async (id) => {
  const campaign = await Campaign.findByIdAndDelete(id);
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  return campaign;
};

const updateCampaignStatus = async (id, status) => {
  const campaign = await Campaign.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  try {
    if (campaign.brandId) {
      await createNotification(
        campaign.brandId,
        'Campaign Status Updated',
        `Campaign brief "${campaign.title}" is now ${status}.`,
        'campaign_updated',
        { entityId: campaign._id, entityType: 'Campaign' }
      );
    }
  } catch (err) {
    console.error('Notification error on campaign status update:', err);
  }
  return campaign;
};

const incrementApplicationsCount = async (id) => {
  const campaign = await Campaign.findByIdAndUpdate(
    id,
    { $inc: { applicantsCount: 1 } },
    { new: true }
  );
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  return campaign;
};

const incrementCampaignViews = async (id) => {
  const campaign = await Campaign.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  return campaign;
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  updateCampaignStatus,
  incrementApplicationsCount,
  incrementCampaignViews
};
