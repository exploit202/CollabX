const pricingService = require('../services/pricing.service');
const { successResponse } = require('../../../utils/apiResponse');
const { verifyAccessToken } = require('../../../utils/jwt');

const getUserId = (req) => {
  if (req.user?.userId || req.user?._id || req.user?.id) {
    return req.user.userId || req.user._id || req.user.id;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = verifyAccessToken(authHeader.split(' ')[1]);
      return decoded.userId || decoded._id || decoded.id;
    } catch (err) {
      console.error('JWT verify error in pricing controller:', err.message);
    }
  }
  return null;
};

const getPricing = async (req, res, next) => {
  try {
    const creatorId = req.query.creatorId || getUserId(req);
    const packages = await pricingService.getPricingByCreator(creatorId);
    return successResponse(res, 200, 'Pricing packages retrieved.', packages);
  } catch (error) {
    next(error);
  }
};

const createPricing = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    if (!creatorId) {
      const error = new Error('Unauthorized creator session');
      error.statusCode = 401;
      throw error;
    }
    const item = await pricingService.createPricing(creatorId, req.body);
    return successResponse(res, 201, 'Pricing package created.', item);
  } catch (error) {
    next(error);
  }
};

const updatePricing = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const item = await pricingService.updatePricing(req.params.id, creatorId, req.body);
    return successResponse(res, 200, 'Pricing package updated.', item);
  } catch (error) {
    next(error);
  }
};

const deletePricing = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const item = await pricingService.deletePricing(req.params.id, creatorId);
    return successResponse(res, 200, 'Pricing package deleted.', item);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPricing,
  createPricing,
  updatePricing,
  deletePricing
};
