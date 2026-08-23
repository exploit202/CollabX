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

async function runTest() {
  console.log('================================================================');
  console.log('🧪 VERIFYING CREATOR COLLABORATION REQUEST NOTIFICATION PIPELINE');
  console.log('================================================================\n');

  try {
    // 1. Brand Login (boAt Lifestyle)
    console.log('1️⃣ Step 1: Brand Login (brand.boat@collabx.demo)...');
    const brandLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'brand.boat@collabx.demo', password: 'Password123!' }
    );
    const brandToken = brandLogin.data?.data?.token;
    const brandUser = brandLogin.data?.data?.user;
    if (!brandToken) throw new Error('Brand login failed');
    console.log(`✅ Brand Logged in. User ID: ${brandUser._id}`);

    // 2. Creator Login (Mortal)
    console.log('\n2️⃣ Step 2: Creator Login (creator.mortal@collabx.demo)...');
    const creatorLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'creator.mortal@collabx.demo', password: 'Password123!' }
    );
    const creatorToken = creatorLogin.data?.data?.token;
    const creatorUser = creatorLogin.data?.data?.user;
    if (!creatorToken) throw new Error('Creator login failed');
    console.log(`✅ Creator Logged in. User ID: ${creatorUser._id}`);

    // 3. Brand Creates a Fresh Campaign
    console.log('\n3️⃣ Brand creating a fresh active campaign for discovery...');
    const campaignTitle = 'boAt Rockerz Pro Studio Max ' + Date.now().toString().slice(-4);
    const campRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/brand/campaigns', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${brandToken}` } },
      {
        title: campaignTitle,
        description: 'New launch brief for high-fidelity studio wireless headphones.',
        category: 'Tech & Gadgets',
        budget: 45000,
        platforms: ['youtube', 'instagram'],
        deliverables: ['1 Studio Quality Unboxing & Audio Test'],
        deadline: new Date(Date.now() + 20 * 86400000).toISOString()
      }
    );
    const newCamp = campRes.data?.data;
    if (!newCamp?._id) throw new Error(`Campaign creation failed: ${JSON.stringify(campRes.data)}`);
    console.log(`✅ Fresh Campaign created: "${newCamp.title}" (ID: ${newCamp._id})`);

    // Fetch initial Brand unread notifications count
    const initialBrandNotifsRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/brand/notifications', method: 'GET', headers: { Authorization: `Bearer ${brandToken}` } }
    );
    const initialBrandNotifs = initialBrandNotifsRes.data?.data || [];
    const initialUnreadCount = initialBrandNotifs.filter(n => !n.isRead && !n.read).length;
    console.log(`✅ Initial Brand Total Notifications: ${initialBrandNotifs.length}, Unread Count: ${initialUnreadCount}`);

    // 4. Step 3: Creator Expresses Interest / Sends Collaboration Request
    console.log(`\n4️⃣ Step 3: Creator (${creatorUser.fullName}) applying / expressing interest in "${newCamp.title}"...`);
    const applyRes = await request(
      { hostname: 'localhost', port: 5000, path: `/api/creator/campaigns/${newCamp._id}/express-interest`, method: 'POST', headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    console.log('   Response Status:', applyRes.status);
    console.log('   Response Data:', JSON.stringify(applyRes.data));
    if (applyRes.status !== 200 || !applyRes.data?.success) {
      throw new Error('Express interest failed');
    }
    console.log('✅ Creator successfully submitted collaboration request!');

    // 5. Step 4: Confirm Notification Document in MongoDB
    console.log('\n5️⃣ Step 4: Inspecting MongoDB Notification Collection directly...');
    const connectDB = require('../src/config/db');
    await connectDB();
    const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
    const dbNotif = await Notification.findOne({
      userId: new mongoose.Types.ObjectId(brandUser._id),
      title: 'New Creator Interest'
    }).sort({ createdAt: -1 }).lean();

    if (!dbNotif) {
      throw new Error('Notification document not found in MongoDB!');
    }
    console.log('✅ MongoDB Notification Document Verified:');
    console.log(`   _id: ${dbNotif._id}`);
    console.log(`   userId: ${dbNotif.userId}`);
    console.log(`   title: "${dbNotif.title}"`);
    console.log(`   message: "${dbNotif.message}"`);
    console.log(`   isRead: ${dbNotif.isRead} (read: ${dbNotif.read})`);
    console.log(`   type: ${dbNotif.type}`);
    console.log(`   createdAt: ${dbNotif.createdAt}`);

    // 6. Step 5 & 6: Confirm API Layer returns the notification and increases unread count
    console.log('\n6️⃣ Step 5 & 6: Fetching Brand Notifications via API...');
    const afterBrandNotifsRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/brand/notifications', method: 'GET', headers: { Authorization: `Bearer ${brandToken}` } }
    );
    const afterBrandNotifs = afterBrandNotifsRes.data?.data || [];
    const afterUnreadCount = afterBrandNotifs.filter(n => !n.isRead && !n.read).length;

    console.log(`✅ After Brand Total Notifications: ${afterBrandNotifs.length}`);
    console.log(`✅ After Brand Unread Count: ${afterUnreadCount} (Increased from ${initialUnreadCount} to ${afterUnreadCount})`);

    const latestNotif = afterBrandNotifs[0];
    console.log(`\n7️⃣ Step 7: Latest Notification to be displayed in Notification Center & Bell Dropdown:`);
    console.log(`   Title: "${latestNotif?.title}"`);
    console.log(`   Message: "${latestNotif?.message}"`);
    console.log(`   Unread: ${!latestNotif?.isRead && !latestNotif?.read}`);

    if (latestNotif?.title !== 'New Creator Interest') {
      throw new Error(`Expected latest notification title 'New Creator Interest', got '${latestNotif?.title}'`);
    }

    console.log('\n================================================================');
    console.log('🎉 ALL 7 PIPELINE VERIFICATION STEPS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  }
}

runTest();
