const Notification = require('../models/notification.model');
const BrandProfile = require('../models/brandProfile.model');

const NOTIF_TYPE_PREFERENCE_MAP = {
  invitation_accepted: 'newInvitationResponses',
  invitation_rejected: 'newInvitationResponses',
  new_invitation_response: 'newInvitationResponses',
  counter_offer: 'counterOffers',
  offer_received: 'counterOffers',
  counter_offer_received: 'counterOffers',
  negotiation_message: 'negotiationMessages',
  chat_message: 'negotiationMessages',
  negotiation_updated: 'negotiationMessages',
  collaboration_started: 'collaborationUpdates',
  collaboration_completed: 'collaborationUpdates',
  activity_logged: 'collaborationUpdates',
  revision_requested: 'collaborationUpdates',
  content_approved: 'collaborationUpdates',
  content_submitted: 'contentSubmissions',
  content_resubmitted: 'contentSubmissions',
  escrow_deposited: 'escrowUpdates',
  escrow_funded: 'escrowUpdates',
  escrow_released: 'escrowUpdates',
  payment_received: 'escrowUpdates',
  payout_released: 'escrowUpdates',
  daily_campaign_digest: 'dailyCampaignDigest'
};

/**
 * Universal notification creator.
 * Supports both positional args: createNotification(userId, title, message, type, options)
 * and object args: createNotification({ userId, recipient, recipientId, senderId, title, message, type, ... })
 */
const createNotification = async (firstArg, titleArg, messageArg, typeArg, extraOpts = {}) => {
  let targetUserId = null;
  let senderId = null;
  let title = 'Notification';
  let message = '';
  let type = 'system';
  let entityId = null;
  let entityType = '';
  let relatedId = null;

  if (typeof firstArg === 'object' && firstArg !== null && !(firstArg instanceof String)) {
    targetUserId = firstArg.userId || firstArg.recipient || firstArg.recipientId;
    senderId = firstArg.senderId || null;
    title = firstArg.title || 'Notification';
    message = firstArg.message || '';
    type = firstArg.type || 'system';
    entityId = firstArg.entityId || firstArg.relatedId || null;
    entityType = firstArg.entityType || '';
    relatedId = firstArg.relatedId || firstArg.entityId || null;
  } else {
    targetUserId = firstArg;
    title = titleArg || 'Notification';
    message = messageArg || '';
    type = typeArg || 'system';
    senderId = extraOpts.senderId || null;
    entityId = extraOpts.entityId || extraOpts.relatedId || null;
    entityType = extraOpts.entityType || '';
    relatedId = extraOpts.relatedId || extraOpts.entityId || null;
  }

  if (!targetUserId) return null;

  // Check if target recipient is a Brand with notification preferences configured
  try {
    const brandProfile = await BrandProfile.findOne({ userId: targetUserId }).lean();
    if (brandProfile && brandProfile.settings && brandProfile.settings.notificationPreferences) {
      const prefKey = NOTIF_TYPE_PREFERENCE_MAP[type];
      if (prefKey && brandProfile.settings.notificationPreferences[prefKey] === false) {
        // Suppressed by brand preference
        return null;
      }
    }
  } catch (err) {
    console.error('Error checking notification preference:', err);
  }

  return Notification.create({
    userId: targetUserId,
    recipient: targetUserId,
    senderId: senderId || null,
    type: type || 'system',
    title: title || 'Notification',
    message: message || '',
    entityType: entityType || '',
    entityId: entityId || relatedId || null,
    relatedId: relatedId || entityId || null,
    isRead: false,
    read: false
  });
};

const getNotifications = async (userId, filters = {}) => {
  const query = { $or: [{ userId }, { recipient: userId }] };
  if (filters.type) query.type = filters.type;
  if (typeof filters.isRead === 'boolean') query.isRead = filters.isRead;

  return Notification.find(query)
    .populate('senderId', 'fullName email profileImage companyName')
    .sort({ createdAt: -1 })
    .lean();
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, $or: [{ userId }, { recipient: userId }] },
    { isRead: true, read: true },
    { new: true }
  );

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { $or: [{ userId }, { recipient: userId }], isRead: false },
    { isRead: true, read: true }
  );
  return { success: true };
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  NOTIF_TYPE_PREFERENCE_MAP
};
