const settingsService = require('../services/creatorsettings.service');

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

const getPayoutSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const payoutSettings = await settingsService.getPayoutSettings(userId);

    return res.status(200).json({
      success: true,
      message: 'Payout settings retrieved successfully.',
      data: {
        payoutSettings
      }
    });
  } catch (error) {
    next(error);
  }
};

const updatePayoutSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { stripeAccountId, bankAccount } = req.body;

    const updated = await settingsService.updatePayoutSettings(
      userId,
      { stripeAccountId, bankAccount }
    );

    return res.status(200).json({
      success: true,
      message: 'Payout settings updated successfully.',
      data: {
        payoutSettings: updated
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updatePassword,
  updateNotificationPreferences,
  getNotificationPreferences,
  getPayoutSettings,
  updatePayoutSettings
};
