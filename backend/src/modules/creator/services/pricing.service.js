const mongoose = require('mongoose');
const Pricing = require('../../../models/pricing.model');
const CreatorProfile = require('../../../models/creatorProfile.model');

/**
 * Normalizes platform string to match Schema Enum values:
 * ['Instagram', 'YouTube', 'LinkedIn', 'Facebook', 'X', 'Other']
 */
const normalizePlatform = (platformStr) => {
  if (!platformStr) return 'Instagram';
  const str = String(platformStr).trim().toLowerCase();
  if (str === 'instagram') return 'Instagram';
  if (str === 'youtube') return 'YouTube';
  if (str === 'linkedin') return 'LinkedIn';
  if (str === 'facebook') return 'Facebook';
  if (str === 'x' || str === 'twitter') return 'X';
  return 'Other';
};

const getPricingByCreator = async (creatorId) => {
  if (!creatorId) return [];
  const creatorObjId = mongoose.Types.ObjectId.isValid(creatorId)
    ? new mongoose.Types.ObjectId(creatorId)
    : creatorId;

  return Pricing.find({
    $or: [{ creatorId: creatorObjId }, { creatorId: creatorId.toString() }],
    isActive: true
  }).sort({ createdAt: -1 });
};

const createPricing = async (creatorId, data) => {
  const creatorObjId = mongoose.Types.ObjectId.isValid(creatorId)
    ? new mongoose.Types.ObjectId(creatorId)
    : creatorId;

  // 1. Verify Creator Profile Exists & Enforce Profile Completion (Section 6)
  const profile = await CreatorProfile.findOne({
    $or: [{ userId: creatorObjId }, { userId: creatorId.toString() }]
  });

  if (!profile) {
    const error = new Error('Creator profile not found. Please complete your profile registration first.');
    error.statusCode = 400;
    throw error;
  }

  // Profile completion criteria
  const hasPlatforms = Array.isArray(profile.platforms) && profile.platforms.length > 0;
  const hasLocation = Boolean(profile.location && (profile.location.city || profile.location.country));
  const hasNiche = Boolean((Array.isArray(profile.niche) && profile.niche.length > 0) || profile.primaryContentNiche);

  if (!hasPlatforms || !hasLocation || !hasNiche) {
    const missingItems = [];
    if (!hasPlatforms) missingItems.push('social platforms');
    if (!hasLocation) missingItems.push('location');
    if (!hasNiche) missingItems.push('content niche');
    const error = new Error(`Cannot create deliverable package: Your Creator Profile is incomplete (missing: ${missingItems.join(', ')}).`);
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate Platform Belongs to Creator Profile (Section 4 & 5)
  const platform = normalizePlatform(data.platform);
  const platformKey = platform.toLowerCase();

  const creatorPlatformKeys = (profile.platforms || []).map((item) =>
    (typeof item === 'string' ? item : item?.platform)?.toLowerCase()
  );

  // Fallback check on platformLinks/socialLinks if platforms array is empty
  if (profile.platformLinks || profile.socialLinks) {
    const links = { ...profile.platformLinks, ...profile.socialLinks };
    if (links.youtube) creatorPlatformKeys.push('youtube');
    if (links.instagram) creatorPlatformKeys.push('instagram');
    if (links.twitter || links.x) {
      creatorPlatformKeys.push('twitter');
      creatorPlatformKeys.push('x');
    }
  }

  const isPlatformConnected = creatorPlatformKeys.some((k) =>
    k === platformKey || (platformKey === 'x' && k === 'twitter') || (platformKey === 'twitter' && k === 'x')
  );

  if (!isPlatformConnected) {
    const displayPlatform = platform === 'X' || platform === 'Twitter' ? 'Twitter / X' : platform;
    const error = new Error(`You are not connected to ${displayPlatform}. Connect this platform from your profile before creating a package.`);
    error.statusCode = 400;
    throw error;
  }

  // 3. Package Field Validation
  const title = data.title || data.packageTitle || data.deliverableType || 'Custom Package';
  const description = data.description || 'High quality custom deliverable package.';
  const price = Number(data.price || data.rate || 0);
  const deliveryDays = Number(data.deliveryDays || data.deliveryTime || 3);
  const revisions = Number(data.revisions || 1);
  const deliverables = Array.isArray(data.deliverables) && data.deliverables.length > 0
    ? data.deliverables
    : [title];

  if (price <= 0) {
    const error = new Error('Package rate must be greater than 0.');
    error.statusCode = 400;
    throw error;
  }

  if (deliveryDays <= 0) {
    const error = new Error('Delivery days must be at least 1 day.');
    error.statusCode = 400;
    throw error;
  }

  return Pricing.create({
    creatorId: creatorObjId,
    title,
    description,
    platform,
    price,
    deliveryDays,
    revisions,
    deliverables,
    isActive: true
  });
};

const updatePricing = async (pricingId, creatorId, data) => {
  const creatorObjId = mongoose.Types.ObjectId.isValid(creatorId)
    ? new mongoose.Types.ObjectId(creatorId)
    : creatorId;

  const updatePayload = {};

  if (data.title || data.packageTitle || data.deliverableType) {
    updatePayload.title = data.title || data.packageTitle || data.deliverableType;
  }
  if (data.description) updatePayload.description = data.description;
  if (data.platform) updatePayload.platform = normalizePlatform(data.platform);
  if (data.price !== undefined) updatePayload.price = Number(data.price);
  if (data.deliveryDays !== undefined) updatePayload.deliveryDays = Number(data.deliveryDays);
  if (data.revisions !== undefined) updatePayload.revisions = Number(data.revisions);
  if (data.deliverables) updatePayload.deliverables = data.deliverables;

  const item = await Pricing.findOneAndUpdate(
    { _id: pricingId, $or: [{ creatorId: creatorObjId }, { creatorId: creatorId.toString() }] },
    updatePayload,
    { new: true, runValidators: true }
  );

  if (!item) {
    const error = new Error('Pricing package not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return item;
};

const deletePricing = async (pricingId, creatorId) => {
  const creatorObjId = mongoose.Types.ObjectId.isValid(creatorId)
    ? new mongoose.Types.ObjectId(creatorId)
    : creatorId;

  const item = await Pricing.findOneAndUpdate(
    { _id: pricingId, $or: [{ creatorId: creatorObjId }, { creatorId: creatorId.toString() }] },
    { isActive: false },
    { new: true }
  );

  if (!item) {
    const error = new Error('Pricing package not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return item;
};

module.exports = {
  getPricingByCreator,
  createPricing,
  updatePricing,
  deletePricing
};
