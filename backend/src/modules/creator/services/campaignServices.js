const Campaign = require('../../../models/campaign.model');
const Invitation = require('../../../models/invitation.model');
const User = require('../../../models/user.model');

const getAllActiveCampaigns = async (queryFilters = {}, creatorId = null) => {
  const filter = { status: 'active', isActive: true };

  if (queryFilters.category && queryFilters.category !== 'all' && queryFilters.category !== 'All Categories') {
    filter.category = queryFilters.category;
  }

  if (queryFilters.search && queryFilters.search.trim()) {
    const searchRegex = new RegExp(queryFilters.search.trim(), 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
      { brandName: searchRegex }
    ];
  }

  const campaigns = await Campaign.find(filter)
    .populate('brandId', 'fullName email profileImage')
    .sort({ createdAt: -1 })
    .lean();

  let appliedCampaignIds = [];
  if (creatorId) {
    const userApplications = await Invitation.find({
      creatorId,
      status: { $in: ['pending', 'accepted', 'negotiating'] }
    })
      .select('campaignId')
      .lean();

    appliedCampaignIds = userApplications
      .map((app) => (app.campaignId ? String(app.campaignId) : null))
      .filter(Boolean);
  }

  return campaigns.map((camp) => ({
    ...camp,
    hasApplied: appliedCampaignIds.includes(String(camp._id))
  }));
};

const getCampaignById = async (id) => {
  const campaign = await Campaign.findById(id).populate('brandId', 'fullName email profileImage');
  if (!campaign) {
    const error = new Error('Campaign not found');
    error.statusCode = 404;
    throw error;
  }
  return campaign;
};

const expressInterest = async (creatorId, campaignId) => {
  const campaign = await Campaign.findById(campaignId).populate('brandId', 'fullName email profileImage');
  if (!campaign) {
    const error = new Error('Campaign not found');
    error.statusCode = 404;
    error.code = 'CAMPAIGN_NOT_FOUND';
    throw error;
  }

  if (campaign.status !== 'active') {
    const error = new Error('Campaign is not active');
    error.statusCode = 400;
    error.code = 'CAMPAIGN_NOT_ACTIVE';
    throw error;
  }

  const creator = await User.findById(creatorId);
  if (!creator) {
    const error = new Error('Creator user not found');
    error.statusCode = 404;
    error.code = 'CREATOR_NOT_FOUND';
    throw error;
  }

  // Idempotency: Check if an interest/invitation record already exists
  let existingRequest = await Invitation.findOne({
    campaignId: campaign._id,
    creatorId: creator._id,
    status: { $in: ['pending', 'accepted', 'negotiating'] }
  });

  if (existingRequest) {
    return { request: existingRequest, alreadyExisted: true };
  }

  const brandUserId = campaign.brandId?._id || campaign.brandId;
  const brandName = campaign.brandName || campaign.brandId?.fullName || 'Brand Partner';
  const brandLogo = campaign.brandLogo || campaign.brandId?.profileImage || '';

  const newRequest = await Invitation.create({
    campaignId: campaign._id,
    campaignTitle: campaign.title,
    brandId: brandUserId,
    brandName,
    brandLogo,
    creatorId: creator._id,
    creatorName: creator.fullName,
    creatorAvatar: creator.profileImage || '',
    proposedPrice: campaign.budget || 0,
    deliverables: campaign.deliverables || [],
    message: `${creator.fullName} expressed interest in this campaign.`,
    status: 'pending',
    sentDate: new Date()
  });

  await Campaign.findByIdAndUpdate(campaign._id, {
    $inc: { applicationsCount: 1 }
  });

  try {
    const notificationService = require('../../brand/services/notification.service');
    await notificationService.createNotification({
      userId: brandUserId,
      senderId: creator._id,
      type: 'invitation_sent',
      title: 'New Creator Interest',
      message: `${creator.fullName} expressed interest in your campaign "${campaign.title}".`,
      entityId: newRequest._id
    });
  } catch (err) {
    console.error('Notification error on express interest:', err);
  }

  return { request: newRequest, alreadyExisted: false };
};

module.exports = {
  getAllActiveCampaigns,
  getCampaignById,
  expressInterest
};
