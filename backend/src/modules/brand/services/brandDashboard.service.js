const Invitation = require('../../../models/invitation.model');
const Negotiation = require('../../../models/negotiation.model');
const Notification = require('../../../models/notification.model');
const BrandProfile = require('../../../models/brandProfile.model');
const Campaign = require('../../../models/campaign.model');
const Collaboration = require('../../../models/collaboration.model');

const getBrandProfile = async (userId) => {
  try {
    return await BrandProfile.findOne({ userId }).lean();
  } catch (error) {
    console.error('Dashboard - Brand profile error:', error);
    return null;
  }
};

const getBrandInvitations = async (userId) => {
  try {
    return (await Invitation.find({ brandId: userId }).sort({ createdAt: -1 }).lean()) || [];
  } catch (error) {
    console.error('Dashboard - Invitations error:', error);
    return [];
  }
};

const getBrandNegotiations = async (userId) => {
  try {
    return (await Negotiation.find({ brandId: userId }).sort({ updatedAt: -1 }).lean()) || [];
  } catch (error) {
    console.error('Dashboard - Negotiations error:', error);
    return [];
  }
};

const getBrandNotifications = async (userId) => {
  try {
    return (await Notification.find({ userId }).sort({ createdAt: -1 }).lean()) || [];
  } catch (error) {
    console.error('Dashboard - Notifications error:', error);
    return [];
  }
};

const getBrandDashboardData = async (userId) => {
  const [
    brandProfile,
    invitations,
    negotiations,
    notifications,
    campaigns,
    collaborations
  ] = await Promise.all([
    getBrandProfile(userId),
    getBrandInvitations(userId),
    getBrandNegotiations(userId),
    getBrandNotifications(userId),
    Campaign.find({ brandId: userId }).sort({ createdAt: -1 }).lean(),
    Collaboration.find({ brandId: userId }).sort({ updatedAt: -1 }).lean()
  ]);

  const pendingInvitations = invitations.filter((i) => i.status === 'pending');
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const activeCollaborations = collaborations.filter(
    (c) => !['completed', 'cancelled'].includes(c.status)
  );

  return {
    brand: {
      id: userId,
      name: brandProfile?.companyName || 'Your Brand',
      logo: brandProfile?.companyLogo || null
    },
    summary: {
      activeCampaigns: activeCampaigns.length,
      pendingInvitations: pendingInvitations.length,
      activeCollaborations: activeCollaborations.length
    },
    campaigns: campaigns.slice(0, 5),
    pendingInvitations: pendingInvitations.slice(0, 5),
    activeCollaborations: activeCollaborations.slice(0, 5),
    negotiations: negotiations.slice(0, 5),
    notifications: notifications.slice(0, 5)
  };
};

module.exports = {
  getBrandDashboardData
};
