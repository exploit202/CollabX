const settingsService = require('../services/brandsettings.service');

const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    await settingsService.updatePassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const preferences = req.body;

    const updated = await settingsService.updateNotificationPreferences(
      userId,
      preferences
    );

    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully.',
      data: {
        preferences: updated
      }
    });
  } catch (error) {
    next(error);
  }
};

const getNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const preferences = await settingsService.getNotificationPreferences(userId);

    return res.status(200).json({
      success: true,
      message: 'Notification preferences retrieved successfully.',
      data: {
        preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updatePassword,
  updateNotificationPreferences,
  getNotificationPreferences
};
