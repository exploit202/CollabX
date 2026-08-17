const { successResponse } = require('../../../utils/apiResponse');
const { getBrandDashboardData } = require('../services/brandDashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    if (req.user?.role !== 'brand') {
      const error = new Error('Only brands can access the brand dashboard.');
      error.statusCode = 403;
      throw error;
    }

    const userId = req.user?.userId || req.user?._id || req.user?.id;

    if (!userId) {
      const error = new Error('Authenticated user ID not found.');
      error.statusCode = 401;
      throw error;
    }

    const dashboardData = await getBrandDashboardData(userId);

    return successResponse(
      res,
      200,
      'Brand dashboard retrieved successfully.',
      dashboardData
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};
