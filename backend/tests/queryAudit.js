require('dotenv').config();
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');
const {
  User,
  BrandProfile,
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

async function audit() {
  await connectDB();

  const brands = await User.find({ role: 'brand' }).lean();
  const creators = await User.find({ role: 'creator' }).lean();
  const admins = await User.find({ role: 'admin' }).lean();

  const brandProfiles = await BrandProfile.find({}).lean();
  const creatorProfiles = await CreatorProfile.find({}).lean();
  const campaigns = await Campaign.find({}).lean();
  const invitations = await Invitation.find({}).lean();
  const negotiations = await Negotiation.find({}).lean();
  const collaborations = await Collaboration.find({}).lean();
  const notifications = await Notification.find({}).lean();
  const portfolios = await Portfolio.find({}).lean();
  const pricings = await Pricing.find({}).lean();
  const reviews = await Review.find({}).lean();

  console.log('--- DATABASE COUNTS ---');
  console.log('Total Brands (Users):', brands.length);
  console.log('Total Brand Profiles:', brandProfiles.length);
  console.log('Total Creators (Users):', creators.length);
  console.log('Total Creator Profiles:', creatorProfiles.length);
  console.log('Total Admin Users:', admins.length);
  console.log('Total Campaigns:', campaigns.length);
  console.log('Total Invitations:', invitations.length);
  console.log('Total Negotiations:', negotiations.length);
  console.log('Total Collaborations:', collaborations.length);
  console.log('Total Notifications:', notifications.length);
  console.log('Total Portfolios:', portfolios.length);
  console.log('Total Pricing Packages:', pricings.length);
  console.log('Total Reviews:', reviews.length);

  console.log('\n--- CREATOR RELATIONSHIPS ---');
  for (const c of creators) {
    const cId = c._id.toString();
    const cInvs = invitations.filter((i) => i.creatorId?.toString() === cId);
    const cNegs = negotiations.filter((n) => n.creatorId?.toString() === cId);
    const cCollabs = collaborations.filter((col) => col.creatorId?.toString() === cId);

    console.log(`\nCreator: ${c.fullName} (${c.email})`);
    console.log('Invitations:');
    if (cInvs.length === 0) console.log('  - None');
    cInvs.forEach((i) => console.log(`  - ${i.brandName} | Campaign: "${i.campaignTitle}" (${i.status})`));

    console.log('Negotiations:');
    if (cNegs.length === 0) console.log('  - None');
    cNegs.forEach((n) => console.log(`  - ${n.brandName} | Campaign: "${n.campaignName}" (${n.status}) - Current Budget: ₹${n.currentBudget}`));

    console.log('Collaborations:');
    if (cCollabs.length === 0) console.log('  - None');
    cCollabs.forEach((col) => console.log(`  - ${col.brandName} | Campaign: "${col.campaignTitle}" (${col.status}) - Agreed: ₹${col.agreedPrice || col.agreedBudget}`));
  }

  console.log('\n--- BRAND STATS ---');
  for (const b of brands) {
    const bId = b._id.toString();
    const bCamps = campaigns.filter((c) => c.brandId?.toString() === bId);
    const bInvs = invitations.filter((i) => i.brandId?.toString() === bId);
    const bNegs = negotiations.filter((n) => n.brandId?.toString() === bId);
    const bCollabs = collaborations.filter((col) => col.brandId?.toString() === bId);
    console.log(`Brand: ${b.fullName} (${b.email}) -> Campaigns: ${bCamps.length}, Invitations: ${bInvs.length}, Negotiations: ${bNegs.length}, Collaborations: ${bCollabs.length}`);
  }

  await mongoose.disconnect();
}

audit().catch(console.error);
