// const {
//   getCreatorProfile,
//   updateCreatorProfile
// } = require('../services/creatorProfile.service');

// const getProfile = async (req, res, next) => {
//   try {
//     const data = await getCreatorProfile(req.user._id);
//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     next(error);
//   }
// };

// const updateProfile = async (req, res, next) => {
//   try {
//     const data = await updateCreatorProfile(req.user._id, req.body);
//     res.status(200).json({
//       success: true,
//       message: 'Creator profile updated successfully.',
//       data
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = { getProfile, updateProfile };


const {
  getCreatorProfile,
  updateCreatorProfile
} = require('../services/creatorProfile.service');

const getProfile = async (req, res, next) => {
  try {
    const data = await getCreatorProfile(req.user.userId);

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
    const data = await updateCreatorProfile(
      req.user.userId,
      req.body
    );

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