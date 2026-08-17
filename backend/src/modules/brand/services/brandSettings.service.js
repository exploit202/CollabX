const bcrypt = require('bcrypt');
const User = require('../../../models/user.model');
const BrandProfile = require('../../../models/brandProfile.model');

const DEFAULT_SETTINGS = {
  notificationPreferences: {
    newInvitationResponses: true,
    counterOffers: true,
    negotiationMessages: true,
    collaborationUpdates: true,
    contentSubmissions: true,
    escrowUpdates: true,
    dailyCampaignDigest: true
  },
  preferences: {
    timezone: 'Asia/Kolkata',
    currency: 'INR'
  }
};

const VALID_TIMEZONES = ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'];
const VALID_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const ALLOWED_NOTIF_KEYS = [
  'newInvitationResponses',
  'counterOffers',
  'negotiationMessages',
  'collaborationUpdates',
  'contentSubmissions',
  'escrowUpdates',
  'dailyCampaignDigest'
];

/**
 * Get Settings for authenticated Brand
 */
const getBrandSettings = async (userId) => {
  const profile = await BrandProfile.findOne({ userId }).lean();

  const savedNotifs = profile?.settings?.notificationPreferences || {};
  const savedPrefs = profile?.settings?.preferences || {};

  return {
    notificationPreferences: {
      newInvitationResponses: typeof savedNotifs.newInvitationResponses === 'boolean' ? savedNotifs.newInvitationResponses : true,
      counterOffers: typeof savedNotifs.counterOffers === 'boolean' ? savedNotifs.counterOffers : true,
      negotiationMessages: typeof savedNotifs.negotiationMessages === 'boolean' ? savedNotifs.negotiationMessages : true,
      collaborationUpdates: typeof savedNotifs.collaborationUpdates === 'boolean' ? savedNotifs.collaborationUpdates : true,
      contentSubmissions: typeof savedNotifs.contentSubmissions === 'boolean' ? savedNotifs.contentSubmissions : true,
      escrowUpdates: typeof savedNotifs.escrowUpdates === 'boolean' ? savedNotifs.escrowUpdates : true,
      dailyCampaignDigest: typeof savedNotifs.dailyCampaignDigest === 'boolean' ? savedNotifs.dailyCampaignDigest : true
    },
    preferences: {
      timezone: savedPrefs.timezone || 'Asia/Kolkata',
      currency: savedPrefs.currency || 'INR'
    }
  };
};

/**
 * Update Notification & General Preferences with Partial Update Support
 */
const updateBrandSettings = async (userId, payload) => {
  if (!payload || typeof payload !== 'object') {
    const error = new Error('Invalid settings payload.');
    error.statusCode = 400;
    throw error;
  }

  const { notificationPreferences, preferences } = payload;

  let profile = await BrandProfile.findOne({ userId });
  if (!profile) {
    const user = await User.findById(userId);
    profile = await BrandProfile.create({
      userId,
      companyName: user?.fullName || 'Brand',
      settings: DEFAULT_SETTINGS
    });
  }

  if (!profile.settings) {
    profile.settings = {
      notificationPreferences: { ...DEFAULT_SETTINGS.notificationPreferences },
      preferences: { ...DEFAULT_SETTINGS.preferences }
    };
  }

  // 1. Validate and merge notificationPreferences if provided
  if (notificationPreferences !== undefined) {
    if (typeof notificationPreferences !== 'object' || notificationPreferences === null || Array.isArray(notificationPreferences)) {
      const error = new Error('notificationPreferences must be an object.');
      error.statusCode = 400;
      throw error;
    }

    const inputKeys = Object.keys(notificationPreferences);
    for (const key of inputKeys) {
      if (!ALLOWED_NOTIF_KEYS.includes(key)) {
        const error = new Error(`Unknown notification preference key '${key}'.`);
        error.statusCode = 400;
        throw error;
      }
      if (typeof notificationPreferences[key] !== 'boolean') {
        const error = new Error(`Notification preference '${key}' must be a boolean.`);
        error.statusCode = 400;
        throw error;
      }
    }

    if (!profile.settings.notificationPreferences) {
      profile.settings.notificationPreferences = { ...DEFAULT_SETTINGS.notificationPreferences };
    }

    for (const key of inputKeys) {
      profile.settings.notificationPreferences[key] = notificationPreferences[key];
    }
  }

  // 2. Validate and merge general preferences if provided
  if (preferences !== undefined) {
    if (typeof preferences !== 'object' || preferences === null || Array.isArray(preferences)) {
      const error = new Error('preferences must be an object.');
      error.statusCode = 400;
      throw error;
    }

    const allowedPrefKeys = ['timezone', 'currency'];
    for (const key of Object.keys(preferences)) {
      if (!allowedPrefKeys.includes(key)) {
        const error = new Error(`Unknown preference key '${key}'.`);
        error.statusCode = 400;
        throw error;
      }
    }

    if (preferences.timezone !== undefined) {
      const tz = preferences.timezone;
      if (!VALID_TIMEZONES.includes(tz)) {
        const error = new Error(`Unsupported timezone '${preferences.timezone}'. Supported: ${VALID_TIMEZONES.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      if (!profile.settings.preferences) profile.settings.preferences = {};
      profile.settings.preferences.timezone = tz;
    }

    if (preferences.currency !== undefined) {
      const curr = preferences.currency;
      if (!VALID_CURRENCIES.includes(curr)) {
        const error = new Error(`Unsupported currency '${preferences.currency}'. Supported: ${VALID_CURRENCIES.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      if (!profile.settings.preferences) profile.settings.preferences = {};
      profile.settings.preferences.currency = curr;
    }
  }

  await profile.save();
  return getBrandSettings(userId);
};

/**
 * Change Password for Authenticated Brand User
 */
const changeBrandPassword = async (userId, { currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword || typeof currentPassword !== 'string') {
    const error = new Error('Current password is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!newPassword || typeof newPassword !== 'string') {
    const error = new Error('New password is required.');
    error.statusCode = 400;
    throw error;
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    const error = new Error('New password and confirm password do not match.');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error('New password must be at least 8 characters long.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'brand') {
    const error = new Error('Only brand users can change passwords via this endpoint.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('Incorrect current password.');
    error.statusCode = 401;
    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error('New password must be different from your current password.');
    error.statusCode = 400;
    throw error;
  }

  const saltRounds = 10;
  user.password = await bcrypt.hash(newPassword, saltRounds);
  await user.save();

  return { success: true, message: 'Password changed successfully.' };
};

module.exports = {
  getBrandSettings,
  updateBrandSettings,
  changeBrandPassword,
  DEFAULT_SETTINGS
};
