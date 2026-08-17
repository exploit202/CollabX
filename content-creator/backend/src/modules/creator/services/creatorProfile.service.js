const User = require('../../auth/models/user.model');
const CreatorProfile = require('../models/creatorProfile.model');

const getCreatorProfile = async (userId) => {
  const user = await User.findById(userId).select(
    'fullName email role profileImage isVerified isActive lastLogin createdAt updatedAt'
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'creator') {
    const error = new Error('Only creator profiles can access this resource.');
    error.statusCode = 403;
    throw error;
  }

  const profile = await CreatorProfile.findOne({ userId });
  return { user, profile };
};

const updateCreatorProfile = async (userId, data) => {
  const userUpdates = {};
  const profileUpdates = {};

  for (const field of ['fullName', 'profileImage']) {
    if (Object.prototype.hasOwnProperty.call(data, field)) userUpdates[field] = data[field];
  }

  for (const field of ['bio', 'niche', 'socialLinks', 'portfolio', 'location']) {
    if (Object.prototype.hasOwnProperty.call(data, field)) profileUpdates[field] = data[field];
  }

  const user = await User.findById(userId).select(
    'fullName email role profileImage isVerified isActive lastLogin createdAt updatedAt'
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'creator') {
    const error = new Error('Only creator profiles can be updated.');
    error.statusCode = 403;
    throw error;
  }

  if (Object.keys(userUpdates).length) {
    Object.assign(user, userUpdates);
    await user.save();
  }

  let profile = await CreatorProfile.findOne({ userId });

  if (!profile) {
    profile = new CreatorProfile({ userId, ...profileUpdates });
  } else if (Object.keys(profileUpdates).length) {
    Object.assign(profile, profileUpdates);
  }

  await profile.save();
  return { user, profile };
};

module.exports = { getCreatorProfile, updateCreatorProfile };
