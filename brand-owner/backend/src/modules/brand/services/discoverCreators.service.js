const mongoose = require('mongoose');
const CreatorProfile = require('../../creator/models/creatorProfile.model');
const { mapCreatorForFrontend } = require('./creatorResponseMapper');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSearchRegex(value) {
  return new RegExp(escapeRegex(String(value).trim()), 'i');
}

function buildMongoFilters(query = {}) {
  const filters = {};
  const category = (query.category ?? query.niche ?? '').toString().trim();
  const country = (query.country ?? '').toString().trim();

  if (category) {
    filters.niche = { $in: [new RegExp(`^${escapeRegex(category)}$`, 'i')] };
  }

  if (country) {
    filters['location.country'] = new RegExp(`^${escapeRegex(country)}$`, 'i');
  }

  if (query.minFollowers !== undefined || query.maxFollowers !== undefined) {
    filters.followers = {};
    if (query.minFollowers !== undefined) {
      const min = Number(query.minFollowers);
      if (!Number.isFinite(min) || min < 0) {
        throw new Error('minFollowers must be a non-negative number');
      }
      filters.followers.$gte = min;
    }
    if (query.maxFollowers !== undefined) {
      const max = Number(query.maxFollowers);
      if (!Number.isFinite(max) || max < 0) {
        throw new Error('maxFollowers must be a non-negative number');
      }
      filters.followers.$lte = max;
    }
  }

  if (query.minEngagementRate !== undefined || query.maxEngagementRate !== undefined) {
    filters.engagementRate = {};
    if (query.minEngagementRate !== undefined) {
      const min = Number(query.minEngagementRate);
      if (!Number.isFinite(min) || min < 0 || min > 100) {
        throw new Error('minEngagementRate must be between 0 and 100');
      }
      filters.engagementRate.$gte = min;
    }
    if (query.maxEngagementRate !== undefined) {
      const max = Number(query.maxEngagementRate);
      if (!Number.isFinite(max) || max < 0 || max > 100) {
        throw new Error('maxEngagementRate must be between 0 and 100');
      }
      filters.engagementRate.$lte = max;
    }
  }

  return filters;
}

function passesInMemoryFilters(profile, query = {}) {
  const user = profile.userId || {};
  const keyword = (query.keyword ?? query.query ?? '').toString().trim();
  const platform = (query.platform ?? '').toString().trim().toLowerCase();
  const verified = (query.verified ?? '').toString().trim().toLowerCase();

  if (keyword) {
    const regex = buildSearchRegex(keyword);
    const nameMatch = user.fullName && regex.test(user.fullName);
    const nicheMatch = Array.isArray(profile.niche) && profile.niche.some((value) => regex.test(value));
    if (!nameMatch && !nicheMatch) {
      return false;
    }
  }

  if (platform) {
    const socialValue = profile.socialLinks?.[platform];
    if (!socialValue || !String(socialValue).trim()) return false;
  }

  if (verified === 'true' && !user.isVerified) return false;
  if (verified === 'false' && user.isVerified) return false;

  return true;
}

async function getDiscoverCreators(query = {}) {
  const mongoFilters = buildMongoFilters(query);
  const creators = await CreatorProfile.find(mongoFilters).populate({
    path: 'userId',
    select: 'fullName email profileImage isVerified'
  });

  const filtered = creators.filter((profile) => passesInMemoryFilters(profile, query));

  filtered.sort((a, b) => (Number(b.followers || 0) - Number(a.followers || 0)) || (new Date(b.createdAt) - new Date(a.createdAt)));

  return filtered.map((profile) => mapCreatorForFrontend(profile));
}

async function getCreatorProfileById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid creator ID');
    error.statusCode = 400;
    throw error;
  }

  const profile = await CreatorProfile.findById(id).populate({
    path: 'userId',
    select: 'fullName email profileImage isVerified'
  });

  if (!profile) {
    const error = new Error('Creator not found');
    error.statusCode = 404;
    throw error;
  }

  return mapCreatorForFrontend(profile);
}

module.exports = {
  buildMongoFilters,
  passesInMemoryFilters,
  getDiscoverCreators,
  getCreatorProfileById
};
