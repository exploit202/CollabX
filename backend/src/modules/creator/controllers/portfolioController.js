const Portfolio = require('../../../models/portfolio.model');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const getPortfolio = async (req, res, next) => {
  try {
    const creatorId = req.query.creatorId || getUserId(req);
    const portfolio = await Portfolio.find({ creator: creatorId }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Portfolio items retrieved.', portfolio);
  } catch (error) {
    next(error);
  }
};

const addPortfolioItem = async (req, res, next) => {
  try {
    const creator = getUserId(req);
    const item = await Portfolio.create({ ...req.body, creator });
    return successResponse(res, 201, 'Portfolio item added.', item);
  } catch (error) {
    next(error);
  }
};

const deletePortfolioItem = async (req, res, next) => {
  try {
    const creator = getUserId(req);
    const item = await Portfolio.findOneAndDelete({ _id: req.params.id, creator });
    if (!item) {
      return errorResponse(res, 404, 'Portfolio item not found or unauthorized.');
    }
    return successResponse(res, 200, 'Portfolio item deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolio,
  addPortfolioItem,
  deletePortfolioItem
};
