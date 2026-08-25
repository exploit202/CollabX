const mongoose = require('mongoose');
const SavedCreator = require('../../../models/savedCreator.model');
const CreatorProfile = require('../../../models/creatorProfile.model');

async function saveCreator(creatorId, brandId) {
  if (!mongoose.Types.ObjectId.isValid(creatorId) || !mongoose.Types.ObjectId.isValid(brandId)) {
    return { success: false, message: 'Invalid ID format', status: 400 };
  }

  let profile = await CreatorProfile.findById(creatorId).populate('userId', 'fullName email profileImage isVerified');
  if (!profile) {
    profile = await CreatorProfile.findOne({ userId: creatorId }).populate('userId', 'fullName email profileImage isVerified');
  }

  if (!profile) {
    return { success: false, message: 'Creator profile not found', status: 404 };
  }

  try {
    const entry = await SavedCreator.create({ brandId, creatorId: profile._id });
    return { success: true, data: entry, status: 201 };
  } catch (error) {
    if (error.code === 11000) {
      return { success: false, message: 'Creator already saved', status: 409 };
    }
    throw error;
  }
}

async function removeSavedCreator(creatorId, brandId) {
  if (!mongoose.Types.ObjectId.isValid(creatorId) || !mongoose.Types.ObjectId.isValid(brandId)) {
    return false;
  }

  let targetCreatorId = creatorId;
  let profile = await CreatorProfile.findById(creatorId);
  if (!profile) {
    profile = await CreatorProfile.findOne({ userId: creatorId });
  }
  if (profile) {
    targetCreatorId = profile._id;
  }

  const removed = await SavedCreator.findOneAndDelete({
    brandId,
    $or: [{ creatorId: creatorId }, { creatorId: targetCreatorId }]
  });
  return removed !== null;
}

async function getSavedCreatorsByBrand(brandId) {
  if (!mongoose.Types.ObjectId.isValid(brandId)) {
    const error = new Error('Invalid brand ID');
    error.statusCode = 400;
    throw error;
  }

  const entries = await SavedCreator.find({ brandId })
    .populate({
      path: 'creatorId',
      populate: { path: 'userId', select: 'fullName email profileImage isVerified' }
    })
    .sort({ createdAt: -1 });

  return entries.map((entry) => entry.creatorId).filter(Boolean);
}

module.exports = {
  saveCreator,
  removeSavedCreator,
  getSavedCreatorsByBrand
};
