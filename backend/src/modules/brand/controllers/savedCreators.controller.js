const savedCreatorsService = require('../services/savedCreators.service');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const saveCreator = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const creatorId = req.params.id || req.body.creatorId;
    const result = await savedCreatorsService.saveCreator(creatorId, brandId);

    if (!result.success) {
      return errorResponse(res, result.status || 400, result.message);
    }
    return successResponse(res, result.status || 201, 'Creator saved successfully.', result.data);
  } catch (error) {
    next(error);
  }
};

const getSavedCreators = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const creators = await savedCreatorsService.getSavedCreatorsByBrand(brandId);
    return successResponse(res, 200, 'Saved creators retrieved.', creators);
  } catch (error) {
    next(error);
  }
};

const removeSavedCreator = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const creatorId = req.params.id;
    const removed = await savedCreatorsService.removeSavedCreator(creatorId, brandId);
    if (!removed) {
      return errorResponse(res, 404, 'Saved creator entry not found.');
    }
    return successResponse(res, 200, 'Creator removed from saved list.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveCreator,
  getSavedCreators,
  removeSavedCreator
};
