const User = require('../../auth/models/user.model');
const bcrypt = require('bcryptjs');

const updatePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    const error = new Error('Current password and new password are required.');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error('Password must be at least 8 characters long.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select('+password');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordCorrect) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 401;
    throw error;
  }

  user.password = newPassword;
  await user.save();
};

const updateNotificationPreferences = async (userId, preferences) => {
  return {
    userId,
    emailOnBrandPitches: preferences.emailOnBrandPitches ?? true,
    pushNotifications: preferences.pushNotifications ?? true,
    updatedAt: new Date()
  };
};

const getNotificationPreferences = async (userId) => {
  return {
    userId,
    emailOnBrandPitches: true,
    pushNotifications: true
  };
};

const getPayoutSettings = async (userId) => {
  return {
    userId,
    stripeAccountId: null,
    bankAccount: null,
    payoutFrequency: 'immediate',
    minPayoutThreshold: 1000
  };
};

const updatePayoutSettings = async (userId, settings) => {
  return {
    userId,
    stripeAccountId: settings.stripeAccountId,
    bankAccount: settings.bankAccount,
    payoutFrequency: 'immediate',
    minPayoutThreshold: 1000,
    updatedAt: new Date()
  };
};

module.exports = {
  updatePassword,
  updateNotificationPreferences,
  getNotificationPreferences,
  getPayoutSettings,
  updatePayoutSettings
};
