const { getCreatorDashboard } = require('../services/creatorDashboard.service');
const { successResponse } = require('../../../utils/apiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?._id || req.user?.id;
    const data = await getCreatorDashboard(userId);

    return successResponse(res, 200, 'Creator dashboard retrieved.', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};
