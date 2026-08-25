const BrandProfile = require('../../../models/brandProfile.model');
const { successResponse } = require('../../../utils/apiResponse');
const { uploadUserProfileImage } = require('../../../services/profileImage.service');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const profile = await BrandProfile.findOne({ userId }).populate('userId', 'fullName email profileImage role');

    if (!profile) {
      const error = new Error('Brand profile not found.');
      error.statusCode = 404;
      throw error;
    }

    return successResponse(res, 200, 'Brand profile retrieved.', { profile });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const updates = req.body;

    const profile = await BrandProfile.findOneAndUpdate(
      { userId },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email profileImage role');

    return successResponse(res, 200, 'Brand profile updated successfully.', { profile });
  } catch (error) {
    next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user._id || req.user.id;
    const result = await uploadUserProfileImage(userId, req.file.buffer, 'brand');

    return successResponse(res, 200, 'Profile image uploaded successfully.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage
};
