const User = require('../../../models/user.model');
const CreatorProfile = require('../../../models/creatorProfile.model');

const getCreatorProfile = async (userId) => {
  const user = await User.findById(userId).select(
    'fullName email role profileImage isVerified isActive lastLogin createdAt updatedAt'
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  let profile = await CreatorProfile.findOne({ userId });
  if (!profile && user.role === 'creator') {
    profile = await CreatorProfile.create({ userId });
  }

  return { user, profile };
};

const updateCreatorProfile = async (userId, data) => {
  const userUpdates = {};
  const profileUpdates = {};

  for (const field of ['fullName', 'profileImage']) {
    if (Object.prototype.hasOwnProperty.call(data, field)) userUpdates[field] = data[field];
  }

  for (const field of ['bio', 'phoneNumber', 'socialLinks', 'portfolio', 'location', 'platforms', 'platformLinks', 'audienceMetrics']) {
    if (Object.prototype.hasOwnProperty.call(data, field)) profileUpdates[field] = data[field];
  }

  if (Object.prototype.hasOwnProperty.call(data, 'niche') || Object.prototype.hasOwnProperty.call(data, 'primaryContentNiche')) {
    const rawNiche = data.niche || data.primaryContentNiche;
    profileUpdates.niche = Array.isArray(rawNiche) ? rawNiche : [rawNiche].filter(Boolean);
  }

  // Explicit Validation for Audience Metrics
  if (profileUpdates.audienceMetrics) {
    const validateMetricVal = (val, fieldName, isRate = false) => {
      if (val === null || val === undefined || val === '') return;
      const num = Number(val);
      if (isNaN(num)) {
        const err = new Error(`${fieldName} must be a valid number.`);
        err.statusCode = 400;
        throw err;
      }
      if (num < 0) {
        const err = new Error(`${fieldName} cannot be negative.`);
        err.statusCode = 400;
        throw err;
      }
      if (isRate && num > 100) {
        const err = new Error(`${fieldName} cannot exceed 100%.`);
        err.statusCode = 400;
        throw err;
      }
    };

    const m = profileUpdates.audienceMetrics;
    if (m.youtube) {
      validateMetricVal(m.youtube.subscribers, 'YouTube subscribers');
      validateMetricVal(m.youtube.averageViews, 'YouTube average views');
      validateMetricVal(m.youtube.engagementRate, 'YouTube engagement rate', true);
    }
    if (m.instagram) {
      validateMetricVal(m.instagram.followers, 'Instagram followers');
      validateMetricVal(m.instagram.averageReelViews, 'Instagram average reel views');
      validateMetricVal(m.instagram.engagementRate, 'Instagram engagement rate', true);
    }
    if (m.twitter) {
      validateMetricVal(m.twitter.followers, 'Twitter followers');
      validateMetricVal(m.twitter.averageImpressions, 'Twitter average post impressions');
      validateMetricVal(m.twitter.engagementRate, 'Twitter engagement rate', true);
    }
  }

  const user = await User.findById(userId).select(
    'fullName email role profileImage isVerified isActive lastLogin createdAt updatedAt'
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (Object.keys(userUpdates).length) {
    Object.assign(user, userUpdates);
    await user.save();
  }

  let profile = await CreatorProfile.findOne({ userId });

  if (!profile) {
    profile = new CreatorProfile({ userId, ...profileUpdates });
  } else {
    if (profileUpdates.audienceMetrics && profile.audienceMetrics) {
      const existingMetrics = profile.audienceMetrics.toObject ? profile.audienceMetrics.toObject() : profile.audienceMetrics;
      const newMetrics = profileUpdates.audienceMetrics;
      profileUpdates.audienceMetrics = {
        youtube: { ...(existingMetrics.youtube || {}), ...(newMetrics.youtube || {}) },
        instagram: { ...(existingMetrics.instagram || {}), ...(newMetrics.instagram || {}) },
        twitter: { ...(existingMetrics.twitter || {}), ...(newMetrics.twitter || {}) }
      };
    }

    if (Object.keys(profileUpdates).length) {
      Object.assign(profile, profileUpdates);
    }
  }

  await profile.save();
  return { user, profile };
};

module.exports = { getCreatorProfile, updateCreatorProfile };
