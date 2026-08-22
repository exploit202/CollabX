const User = require('./user.model');
const Otp = require('./otp.model');
const BrandProfile = require('./brandProfile.model');
const CreatorProfile = require('./creatorProfile.model');
const Campaign = require('./campaign.model');
const SavedCreator = require('./savedCreator.model');
const Invitation = require('./invitation.model');
const Negotiation = require('./negotiation.model');
const NegotiationMessage = require('./negotiationMessage.model');
const Notification = require('./notification.model');
const Collaboration = require('./collaboration.model');
const Portfolio = require('./portfolio.model');
const Review = require('./review.model');
const Pricing = require('./pricing.model');
const Payment = require('./payment.model');
const CreatorPayoutAccount = require('./creatorPayoutAccount.model');
const AdminSettings = require('./adminSettings.model');
const AdminReport = require('./adminReport.model');
const AdminCampaignAction = require('./adminCampaignAction.model');

module.exports = {
  User,
  Otp,
  BrandProfile,
  CreatorProfile,
  Campaign,
  SavedCreator,
  BrandSavedCreator: SavedCreator,
  Invitation,
  Negotiation,
  NegotiationMessage,
  Notification,
  Collaboration,
  ActiveCollaboration: Collaboration,
  Portfolio,
  Review,
  Pricing,
  Payment,
  CreatorPayoutAccount,
  AdminSettings,
  AdminReport,
  AdminCampaignAction
};
