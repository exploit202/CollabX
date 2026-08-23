/**
 * Verification script for Campaign Details Flow
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const { Campaign, User } = require('../src/models');
const campaignService = require('../src/modules/brand/services/campaign.service');

async function verifyCampaignFlow() {
  console.log('🔍 Verifying Campaign Details Backend & Query Flow...\n');
  await connectDB();

  // 1. Pick a seeded campaign
  const seededCampaign = await Campaign.findOne({ title: 'Nike Air Max 2026 Ignite Campaign' });
  if (!seededCampaign) throw new Error('Seeded campaign not found');

  const fetchedSeeded = await campaignService.getCampaignById(seededCampaign._id);
  console.log('1️⃣ Seeded Campaign Fetch by ID:');
  console.log(`   - ID: ${fetchedSeeded._id}`);
  console.log(`   - Title: "${fetchedSeeded.title}"`);
  console.log(`   - Budget: ₹${fetchedSeeded.budget}`);
  console.log(`   - Status: ${fetchedSeeded.status}`);
  if (fetchedSeeded.title !== 'Nike Air Max 2026 Ignite Campaign') {
    throw new Error('Fetched seeded campaign title mismatch');
  }
  console.log('   ✅ Seeded campaign fetch by ID verified.\n');

  // 2. Create a test campaign like user described: "Sb dunk", Budget: 2450
  const brandUser = await User.findOne({ role: 'brand' });
  const newCamp = await Campaign.create({
    brandId: brandUser._id,
    brandName: brandUser.fullName,
    title: 'Sb dunk',
    budget: 2450,
    currency: 'INR',
    category: 'Fashion & Lifestyle',
    description: 'Custom test campaign for SB Dunk presentation review.',
    deliverables: ['1 Dedicated Reel'],
    deadline: new Date(Date.now() + 10 * 86400000),
    status: 'active'
  });

  const fetchedNew = await campaignService.getCampaignById(newCamp._id);
  console.log('2️⃣ Newly Created Campaign Fetch by ID:');
  console.log(`   - ID: ${fetchedNew._id}`);
  console.log(`   - Title: "${fetchedNew.title}"`);
  console.log(`   - Budget: ₹${fetchedNew.budget}`);
  console.log(`   - Status: ${fetchedNew.status}`);

  if (fetchedNew.title !== 'Sb dunk' || fetchedNew.budget !== 2450) {
    throw new Error('Fetched new campaign title or budget mismatch');
  }
  console.log('   ✅ Newly created campaign fetch by ID verified.\n');

  // Clean up the test campaign
  await Campaign.findByIdAndDelete(newCamp._id);
  console.log('🧹 Cleaned up test campaign.');

  console.log('\n======================================================');
  console.log('🎉 ALL CAMPAIGN DETAILS FLOW CHECKS PASSED!');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

verifyCampaignFlow().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
