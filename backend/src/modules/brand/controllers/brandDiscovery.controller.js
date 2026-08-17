const brandDiscoveryService = require('../services/brandDiscovery.service');
const { successResponse } = require('../../../utils/apiResponse');

const getDiscoverCreators = async (req, res, next) => {
  try {
    const creators = await brandDiscoveryService.discoverCreators(req.query);
    return successResponse(res, 200, 'Brand discover creators list retrieved cleanly.', creators);
  } catch (error) {
    next(error);
  }
};

const getCreatorById = async (req, res, next) => {
  try {
    const creator = await brandDiscoveryService.getCreatorById(req.params.id);
    return successResponse(res, 200, 'Creator details retrieved cleanly.', creator);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiscoverCreators,
  getCreatorById
};
