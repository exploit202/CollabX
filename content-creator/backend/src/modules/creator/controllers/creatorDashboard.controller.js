const {
  getCreatorDashboard,
} = require('../services/creatorDashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    const data = await getCreatorDashboard(req.user.userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};
