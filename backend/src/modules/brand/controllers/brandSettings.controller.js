const brandSettingsService = require('../services/brandSettings.service');
const { successResponse } = require('../../../utils/apiResponse');

const getSettings = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId || req.user?.role !== 'brand') {
      const error = new Error('Unauthorized brand access.');
      error.statusCode = 403;
      throw error;
    }

    const settings = await brandSettingsService.getBrandSettings(userId);
    return successResponse(res, 200, 'Brand settings retrieved.', settings);
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId || req.user?.role !== 'brand') {
      const error = new Error('Unauthorized brand access.');
      error.statusCode = 403;
      throw error;
    }

    const updatedSettings = await brandSettingsService.updateBrandSettings(userId, req.body);
    return successResponse(res, 200, 'Brand settings updated successfully.', updatedSettings);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    if (!userId || req.user?.role !== 'brand') {
      const error = new Error('Unauthorized brand access.');
      error.statusCode = 403;
      throw error;
    }

    const result = await brandSettingsService.changeBrandPassword(userId, req.body);
    return successResponse(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  changePassword
};
