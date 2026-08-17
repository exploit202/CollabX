const mongoose = require('mongoose');

const SavedCreator = require('../models/SavedCreator');
const CreatorProfile = require('../../creator/models/creatorProfile.model');

const {
  mapCreatorForFrontend
} = require('./creatorResponseMapper');


async function saveCreator(creatorId, brandId) {
  // 1. Validate creator ID
  if (!mongoose.Types.ObjectId.isValid(creatorId)) {
    return {
      success: false,
      message: 'Invalid creator ID',
      status: 400
    };
  }

  // 2. Validate brand ID
  if (!mongoose.Types.ObjectId.isValid(brandId)) {
    return {
      success: false,
      message: 'Invalid brand ID',
      status: 400
    };
  }

  // 3. Make sure creator exists
  const profile = await CreatorProfile.findById(creatorId)
    .populate({
      path: 'userId',
      select: 'fullName email profileImage isVerified'
    });

  if (!profile) {
    return {
      success: false,
      message: 'Creator not found',
      status: 404
    };
  }

  // 4. Save creator for this brand
  try {
    const entry = await SavedCreator.create({
      brandId,
      creatorId
    });

    return {
      success: true,
      data: entry,
      status: 201
    };
  } catch (error) {
    // Unique index:
    // brandId + creatorId
    if (error.code === 11000) {
      return {
        success: false,
        message: 'Creator already saved',
        status: 409
      };
    }

    throw error;
  }
}


async function removeSavedCreator(creatorId, brandId) {
  if (!mongoose.Types.ObjectId.isValid(creatorId)) {
    return false;
  }

  if (!mongoose.Types.ObjectId.isValid(brandId)) {
    return false;
  }

  const removed = await SavedCreator.findOneAndDelete({
    brandId,
    creatorId
  });

  return removed !== null;
}


async function getSavedCreatorsByBrand(brandId) {
  if (!mongoose.Types.ObjectId.isValid(brandId)) {
    const error = new Error('Invalid brand ID');
    error.statusCode = 400;
    throw error;
  }

  const entries = await SavedCreator.find({
    brandId
  })
    .populate({
      path: 'creatorId',
      populate: {
        path: 'userId',
        select: 'fullName email profileImage isVerified'
      }
    })
    .sort({ createdAt: -1 });

  return entries
    .map((entry) => entry.creatorId)
    .filter(Boolean)
    .map((profile) => mapCreatorForFrontend(profile));
}


module.exports = {
  saveCreator,
  removeSavedCreator,
  getSavedCreatorsByBrand
};