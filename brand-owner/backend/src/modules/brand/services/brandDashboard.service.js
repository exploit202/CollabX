const Invitation = require('../models/invitation.model');
const Negotiation = require('../models/negotiation.model');
const Notification = require('../models/notification.model');
const BrandProfile = require('../models/brandProfile.model');



const Campaign = require('../models/campaign');
const ActiveCollaboration = require('../models/activeCollaboration.model');


/**
 * Get brand profile
 */
const getBrandProfile = async (userId) => {
  try {
    return await BrandProfile
      .findOne({ userId })
      .lean();
  } catch (error) {
    console.error('Dashboard - Brand profile error:', error);
    return null;
  }
};


/**
 * Get brand invitations
 */
const getBrandInvitations = async (userId) => {
  try {
    const invitations = await Invitation
      .find({ brandId: userId })
      .sort({ createdAt: -1 })
      .lean();

    return invitations || [];
  } catch (error) {
    console.error('Dashboard - Invitations error:', error);
    return [];
  }
};


/**
 * Get brand negotiations
 */
const getBrandNegotiations = async (userId) => {
  try {
    const negotiations = await Negotiation
      .find({ brandId: userId })
      .sort({ updatedAt: -1 })
      .lean();

    return negotiations || [];
  } catch (error) {
    console.error('Dashboard - Negotiations error:', error);
    return [];
  }
};


/**
 * Get brand notifications
 */
const getBrandNotifications = async (userId) => {
  try {
    const notifications = await Notification
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return notifications || [];
  } catch (error) {
    console.error('Dashboard - Notifications error:', error);
    return [];
  }
};


/**
 * Get saved creators
 */
// const getSavedCreators = async (userId) => {
//   try {
//     const savedCreators =
//       await savedCreatorsService.getSavedCreatorsByBrand(userId);

//     return Array.isArray(savedCreators)
//       ? savedCreators
//       : [];

//   } catch (error) {
//     console.error('Dashboard - Saved creators error:', error);
//     return [];
//   }
// };


/**
 * Get brand dashboard data
 */
const getBrandDashboardData = async (userId) => {

  const [
    brandProfile,
    invitations,
    negotiations,
    notifications,
    // savedCreators,
    campaigns,
    collaborations
  ] = await Promise.all([

    getBrandProfile(userId),

    getBrandInvitations(userId),

    getBrandNegotiations(userId),

    getBrandNotifications(userId),

    // getSavedCreators(userId),

    Campaign
      .find({ brandId: userId })
      .sort({ createdAt: -1 })
      .lean(),

    ActiveCollaboration
      .find({ brandId: userId })
      .sort({ updatedAt: -1 })
      .lean()
  ]);


  // Pending invitations
  const pendingInvitations = invitations.filter(
    (invitation) =>
      invitation.status === 'pending'
  );


  // Active campaigns
  const activeCampaigns = campaigns.filter(
    (campaign) =>
      campaign.status === 'active'
  );


  // Active collaborations
  const activeCollaborations = collaborations.filter(
    (collaboration) =>
      !['completed', 'cancelled']
        .includes(collaboration.status)
  );


  return {

    brand: {
      id: userId,
      name: brandProfile?.companyName || 'Your Brand',
      logo: brandProfile?.companyLogo || null
    },

    summary: {
      activeCampaigns: activeCampaigns.length,

      pendingInvitations:
        pendingInvitations.length,

      activeCollaborations:
        activeCollaborations.length,

    //   savedCreators:
    //     savedCreators.length
    },

    campaigns:
      campaigns.slice(0, 5),

    pendingInvitations:
      pendingInvitations.slice(0, 5),

    activeCollaborations:
      activeCollaborations.slice(0, 5),

    // savedCreators:
    //   savedCreators.slice(0, 5),

    negotiations:
      negotiations.slice(0, 5),

    notifications:
      notifications.slice(0, 5)
  };
};


module.exports = {
  getBrandDashboardData
};