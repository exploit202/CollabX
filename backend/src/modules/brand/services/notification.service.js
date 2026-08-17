const Notification = require('../../../models/notification.model');
const BrandProfile = require('../../../models/brandProfile.model');

const NOTIF_TYPE_PREFERENCE_MAP = {
  // New invitation responses
  invitation_accepted: 'newInvitationResponses',
  invitation_rejected: 'newInvitationResponses',
  new_invitation_response: 'newInvitationResponses',

  // Counter offers
  counter_offer: 'counterOffers',
  offer_received: 'counterOffers',
  counter_offer_received: 'counterOffers',

  // Negotiation messages
  negotiation_message: 'negotiationMessages',
  chat_message: 'negotiationMessages',
  negotiation_updated: 'negotiationMessages',

  // Collaboration updates
  collaboration_started: 'collaborationUpdates',
  collaboration_completed: 'collaborationUpdates',
  activity_logged: 'collaborationUpdates',
  revision_requested: 'collaborationUpdates',
  content_approved: 'collaborationUpdates',

  // Content submissions
  content_submitted: 'contentSubmissions',
  content_resubmitted: 'contentSubmissions',

  // Escrow updates
  escrow_deposited: 'escrowUpdates',
  escrow_released: 'escrowUpdates',
  payment_received: 'escrowUpdates',
  payout_released: 'escrowUpdates',

  // Daily Campaign Digest
  daily_campaign_digest: 'dailyCampaignDigest'
};

const createNotification = async ({
  userId,
  recipientId,
  senderId,
  type,
  title,
  message,
  entityType,
  entityId,
  relatedId
}) => {
  const targetUserId = userId || recipientId;
  if (!targetUserId) return null;

  // Check if target recipient is a Brand with notification preferences configured
  try {
    const brandProfile = await BrandProfile.findOne({ userId: targetUserId }).lean();
    if (brandProfile && brandProfile.settings && brandProfile.settings.notificationPreferences) {
      const prefKey = NOTIF_TYPE_PREFERENCE_MAP[type];
      if (prefKey && brandProfile.settings.notificationPreferences[prefKey] === false) {
        // Notification suppressed by Brand preference setting
        return null;
      }
    }
  } catch (err) {
    console.error('Error checking brand notification preference:', err);
  }

  return Notification.create({
    userId: targetUserId,
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
  const query = { userId };
  if (filters.type) query.type = filters.type;
  if (typeof filters.isRead === 'boolean') query.isRead = filters.isRead;

  return Notification.find(query)
    .populate('senderId', 'fullName email profileImage companyName')
    .sort({ createdAt: -1 })
    .lean();
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
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
    { userId, isRead: false },
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
