const campaignServices = require('../services/campaignServices');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const discoverCampaigns = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const campaigns = await campaignServices.getAllActiveCampaigns(req.query, creatorId);
    return successResponse(res, 200, 'Active campaigns retrieved for discovery.', campaigns);
  } catch (error) {
    next(error);
  }
};

const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await campaignServices.getCampaignById(req.params.id);
    return successResponse(res, 200, 'Campaign details retrieved.', campaign);
  } catch (error) {
    next(error);
  }
};

const expressInterest = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const campaignId = req.params.id;
    const result = await campaignServices.expressInterest(creatorId, campaignId);
    return successResponse(res, 200, 'Interest registered successfully.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  discoverCampaigns,
  getCampaignById,
  expressInterest
};
