const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function debug() {
  console.log('🔍 Starting Notification Pipeline Trace for Express Interest / Collaboration Request...\n');

  // 1. Log in as boAt
  console.log('1. Logging in as Brand (boAt Lifestyle)...');
  const brandLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'brand.boat@collabx.demo', password: 'Password123!' }
  );
  const brandToken = brandLogin.data?.data?.token;
  const brandUser = brandLogin.data?.data?.user;
  console.log(`   Brand User ID: ${brandUser._id}`);

  // 2. Log in as Mortal
  console.log('\n2. Logging in as Creator (Mortal)...');
  const creatorLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'creator.mortal@collabx.demo', password: 'Password123!' }
  );
  const creatorToken = creatorLogin.data?.data?.token;
  const creatorUser = creatorLogin.data?.data?.user;
  console.log(`   Creator User ID: ${creatorUser._id}`);

  // 3. Creator Discovers Campaigns to find boAt campaign
  console.log('\n3. Fetching discover campaigns as Creator...');
  const discoverRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/creator/campaigns/discover', method: 'GET', headers: { Authorization: `Bearer ${creatorToken}` } }
  );
  const allCampaigns = discoverRes.data?.data || [];
  console.log(`   Found ${allCampaigns.length} discoverable campaigns.`);

  // Find a campaign owned by boAt
  const boatCamp = allCampaigns.find(c => {
    const cBrandId = String(c.brandId?._id || c.brandId);
    return cBrandId === String(brandUser._id);
  });

  if (!boatCamp) {
    console.error('❌ Could not find a campaign belonging to boAt.');
    process.exit(1);
  }

  console.log(`   Selected boAt Campaign: "${boatCamp.title}" (ID: ${boatCamp._id})`);

  // 4. Check initial Brand Notifications count
  console.log('\n4. Fetching initial Brand notifications...');
  const beforeNotifsRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/brand/notifications', method: 'GET', headers: { Authorization: `Bearer ${brandToken}` } }
  );
  const beforeNotifs = beforeNotifsRes.data?.data || [];
  console.log(`   Initial Brand notifications count: ${beforeNotifs.length}`);

  // 5. Creator Expresses Interest in Campaign
  console.log(`\n5. Creator (${creatorUser.fullName}) expressing interest in Campaign ${boatCamp._id}...`);
  const expressRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/creator/campaigns/${boatCamp._id}/express-interest`, method: 'POST', headers: { Authorization: `Bearer ${creatorToken}` } }
  );
  console.log('   Express Interest Response Status:', expressRes.status);
  console.log('   Express Interest Response Body:', JSON.stringify(expressRes.data));

  // 6. Connect to MongoDB via connectDB
  const connectDB = require('../src/config/db');
  await connectDB();
  const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
  const dbNotifs = await Notification.find({
    $or: [{ userId: brandUser._id }, { recipient: brandUser._id }]
  }).sort({ createdAt: -1 }).limit(5).lean();

  console.log(`\n6. Direct MongoDB Inspection (Last 5 notifications for Brand ${brandUser._id}):`);
  dbNotifs.forEach((n, idx) => {
    console.log(`   [${idx + 1}] ID: ${n._id}, Type: ${n.type}, Title: "${n.title}", Message: "${n.message}", CreatedAt: ${n.createdAt}`);
  });

  // 7. Check Brand Notifications via API
  console.log('\n7. Fetching Brand notifications via API after interest expressed...');
  const afterNotifsRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/brand/notifications', method: 'GET', headers: { Authorization: `Bearer ${brandToken}` } }
  );
  const afterNotifs = afterNotifsRes.data?.data || [];
  console.log(`   After Brand notifications count: ${afterNotifs.length}`);
  const latest = afterNotifs[0];
  console.log(`   Latest Brand notification: "${latest?.title}" - "${latest?.message}" (Type: ${latest?.type})`);

  await mongoose.disconnect();
  process.exit(0);
}

debug().catch(err => {
  console.error('Debug error:', err);
  process.exit(1);
});
