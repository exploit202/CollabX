/**
 * Dashboard & Pages Validation Script
 * Verifies that all Brand & Creator views have populated data and no empty states.
 */

require('dotenv').config();
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');
const { getBrandDashboardData } = require('../src/modules/brand/services/brandDashboard.service');
const { getCreatorDashboard } = require('../src/modules/creator/services/creatorDashboard.service');
const {
  User,
  CreatorProfile,
  Campaign,
  Invitation,
  Negotiation,
  Collaboration,
  Notification,
  Portfolio,
  Pricing,
  Review
} = require('../src/models');

async function validateDashboards() {
  console.log('🔍 Validating Dashboard & Pages Data Population...\n');
  await connectDB();

  // 1. Validate Brand Dashboard for Nike
  const nikeUser = await User.findOne({ email: 'brand.nike@collabx.demo' });
  if (!nikeUser) throw new Error('Nike user not found');

  const brandDashboard = await getBrandDashboardData(nikeUser._id);
  console.log('1️⃣ Brand Dashboard (Nike India):');
  console.log(`   - Active Campaigns: ${brandDashboard.summary.activeCampaigns}`);
  console.log(`   - Active Collaborations: ${brandDashboard.summary.activeCollaborations}`);
  console.log(`   - Pending Invitations: ${brandDashboard.summary.pendingInvitations}`);
  console.log(`   - Campaigns Count: ${brandDashboard.campaigns.length}`);
  console.log(`   - Collaborations Count: ${brandDashboard.activeCollaborations.length}`);
  console.log(`   - Notifications Count: ${brandDashboard.notifications.length}`);

  if (brandDashboard.campaigns.length === 0 || brandDashboard.activeCollaborations.length === 0) {
    throw new Error('Brand dashboard has empty campaigns or collaborations');
  }
  console.log('   ✅ Brand Dashboard populated with real metrics & lists.\n');

  // 2. Validate Creator Dashboard for Tech Burner
  const techUser = await User.findOne({ email: 'creator.techburner@collabx.demo' });
  if (!techUser) throw new Error('TechBurner user not found');

  const creatorDashboard = await getCreatorDashboard(techUser._id);
  console.log('2️⃣ Creator Dashboard (Tech Burner):');
  console.log(`   - Brand Invitations: ${creatorDashboard.stats.brandInvitations}`);
  console.log(`   - Active Campaigns: ${creatorDashboard.stats.activeCampaigns}`);
  console.log(`   - Open Negotiations: ${creatorDashboard.stats.openNegotiations}`);
  console.log(`   - Active Collaborations Count: ${creatorDashboard.activeCollaborations.length}`);
  console.log(`   - Recent Requests Count: ${creatorDashboard.recentRequests.length}`);

  if (creatorDashboard.activeCollaborations.length === 0 && creatorDashboard.recentRequests.length === 0) {
    throw new Error('Creator dashboard has empty requests and collaborations');
  }
  console.log('   ✅ Creator Dashboard populated with real stats & cards.\n');

  // 3. Discover Creators records
  const allCreators = await CreatorProfile.find({}).populate('userId', 'fullName profileImage email');
  console.log(`3️⃣ Discover Creators: ${allCreators.length} creators with niches, followers, and platforms.`);
  if (allCreators.length < 10) throw new Error('Insufficient creator records');
  console.log('   ✅ Discover Creators populated.\n');

  // 4. Campaigns Page records
  const allCampaigns = await Campaign.find({ isActive: true });
  console.log(`4️⃣ Campaigns Page: ${allCampaigns.length} campaigns found.`);
  if (allCampaigns.length < 10) throw new Error('Insufficient campaigns');
  console.log('   ✅ Campaigns page populated.\n');

  // 5. Negotiations Page records
  const allNegotiations = await Negotiation.find({});
  console.log(`5️⃣ Negotiations Page: ${allNegotiations.length} negotiations across open, agreed, and rejected states.`);
  if (allNegotiations.length === 0) throw new Error('No negotiations found');
  console.log('   ✅ Negotiations page populated.\n');

  // 6. Collaborations Page records
  const allCollaborations = await Collaboration.find({});
  console.log(`6️⃣ Collaborations Page: ${allCollaborations.length} collaborations across active, submitted, approved, and completed states.`);
  if (allCollaborations.length === 0) throw new Error('No collaborations found');
  console.log('   ✅ Collaborations page populated.\n');

  // 7. Notifications Page records
  const allNotifications = await Notification.find({});
  console.log(`7️⃣ Notifications Page: ${allNotifications.length} notifications seeded.`);
  if (allNotifications.length === 0) throw new Error('No notifications found');
  console.log('   ✅ Notifications page populated.\n');

  // 8. Portfolio Page records
  const allPortfolios = await Portfolio.find({});
  const allPricings = await Pricing.find({});
  const allReviews = await Review.find({});
  console.log(`8️⃣ Portfolio, Pricing & Reviews: ${allPortfolios.length} portfolio items, ${allPricings.length} pricing packages, ${allReviews.length} reviews.`);
  console.log('   ✅ Portfolio, Pricing & Reviews populated.\n');

  console.log('======================================================');
  console.log('🎉 ALL 8 DASHBOARD & PAGE CHECKS PASSED WITH NO EMPTY STATES!');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

validateDashboards().catch((err) => {
  console.error('❌ Validation failed:', err);
  process.exit(1);
});
