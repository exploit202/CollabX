const User = require('../../auth/models/user.model');
const bcrypt = require('bcrypt');
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

  const hashedPassword = await bcrypt.hash(newPassword, 10);

user.password = hashedPassword;

await user.save();
};

const updateNotificationPreferences = async (userId, preferences) => {
  // Store notification preferences in a separate collection or as part of user profile
  // For now, we'll just return the preferences as they are stored client-side
  // In a production app, you'd store these in a UserSettings or UserPreferences collection
  
  return {
    userId,
    emailOnCounterOffers: preferences.emailOnCounterOffers ?? true,
    dailyActivityDigest: preferences.dailyActivityDigest ?? true,
    pushNotifications: preferences.pushNotifications ?? true,
    updatedAt: new Date()
  };
};

const getNotificationPreferences = async (userId) => {
  // Retrieve notification preferences
  // In a production app, fetch from UserSettings collection
  
  return {
    userId,
    emailOnCounterOffers: true,
    dailyActivityDigest: true,
    pushNotifications: true
  };
};

module.exports = {
  updatePassword,
  updateNotificationPreferences,
  getNotificationPreferences
};
