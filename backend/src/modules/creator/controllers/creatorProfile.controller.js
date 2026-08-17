const { getCreatorProfile, updateCreatorProfile } = require('../services/creatorProfile.service');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const data = await getCreatorProfile(userId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const data = await updateCreatorProfile(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Creator profile updated successfully.',
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
