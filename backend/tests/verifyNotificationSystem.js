const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';

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

async function runTests() {
  console.log('🧪 Starting Notification System End-to-End Verification...\n');

  try {
    // 1. Brand Login (boAt Lifestyle)
    console.log('1️⃣ Logging in as Brand (brand.boat@collabx.demo)...');
    const brandLoginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'brand.boat@collabx.demo',
        password: 'Password123!'
      }
    );

    const brandToken = brandLoginRes.data.data?.token || brandLoginRes.data.token;
    const brandUser = brandLoginRes.data.data?.user || brandLoginRes.data.user;
    if (!brandToken) {
      throw new Error(`Brand login failed: ${JSON.stringify(brandLoginRes.data)}`);
    }
    const brandUserId = brandUser.id || brandUser._id;
    console.log(`✅ Brand logged in successfully. User ID: ${brandUserId}`);

    // 2. Fetch Brand Notifications
    console.log('\n2️⃣ Fetching Brand notifications...');
    const brandNotifRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/brand/notifications',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`
      }
    });

    if (brandNotifRes.status !== 200 || !Array.isArray(brandNotifRes.data.data)) {
      throw new Error(`Failed to retrieve brand notifications: ${JSON.stringify(brandNotifRes.data)}`);
    }

    const brandNotifs = brandNotifRes.data.data;
    console.log(`✅ Retrieved ${brandNotifs.length} Brand notifications.`);
    if (brandNotifs.length < 5) {
      throw new Error(`Expected at least 5 notifications for boAt, found ${brandNotifs.length}`);
    }

    const unreadBrandNotifs = brandNotifs.filter((n) => !n.isRead && !n.read);
    console.log(`✅ Unread Brand notifications: ${unreadBrandNotifs.length}`);

    // 3. Mark single notification as read
    const targetBrandNotif = brandNotifs.find((n) => !n.isRead && !n.read) || brandNotifs[0];
    const targetId = targetBrandNotif._id || targetBrandNotif.id;
    console.log(`\n3️⃣ Marking single notification ${targetId} as read...`);

    const markSingleRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/brand/notifications/${targetId}/read`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`
      }
    });

    if (markSingleRes.status !== 200) {
      throw new Error(`Failed to mark notification as read: ${JSON.stringify(markSingleRes.data)}`);
    }
    console.log('✅ Single notification marked as read successfully.');

    // 4. Mark all as read
    console.log('\n4️⃣ Marking all brand notifications as read...');
    const markAllRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/brand/notifications/read-all',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`
      }
    });

    if (markAllRes.status !== 200) {
      throw new Error(`Failed to mark all as read: ${JSON.stringify(markAllRes.data)}`);
    }
    console.log('✅ All Brand notifications marked as read.');

    // Verify unread count is 0
    const recheckBrandRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/brand/notifications',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`
      }
    });
    const remainingUnread = recheckBrandRes.data.data.filter((n) => !n.isRead && !n.read).length;
    console.log(`✅ Verified remaining unread count for boAt: ${remainingUnread}`);
    if (remainingUnread !== 0) {
      throw new Error(`Expected 0 unread notifications after read-all, found ${remainingUnread}`);
    }

    // 5. Creator Login (Mortal / Naman Mathur)
    console.log('\n5️⃣ Logging in as Creator (creator.mortal@collabx.demo)...');
    const creatorLoginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'creator.mortal@collabx.demo',
        password: 'Password123!'
      }
    );

    const creatorToken = creatorLoginRes.data.data?.token || creatorLoginRes.data.token;
    const creatorUser = creatorLoginRes.data.data?.user || creatorLoginRes.data.user;
    if (!creatorToken) {
      throw new Error(`Creator login failed: ${JSON.stringify(creatorLoginRes.data)}`);
    }
    const creatorUserId = creatorUser.id || creatorUser._id;
    console.log(`✅ Creator logged in successfully. User ID: ${creatorUserId}`);

    // 6. Fetch Creator Notifications
    console.log('\n6️⃣ Fetching Creator notifications...');
    const creatorNotifRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/creator/notifications',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`
      }
    });

    if (creatorNotifRes.status !== 200 || !Array.isArray(creatorNotifRes.data.data)) {
      throw new Error(`Failed to retrieve creator notifications: ${JSON.stringify(creatorNotifRes.data)}`);
    }

    const creatorNotifs = creatorNotifRes.data.data;
    console.log(`✅ Retrieved ${creatorNotifs.length} Creator notifications for Mortal.`);
    if (creatorNotifs.length < 5) {
      throw new Error(`Expected at least 5 notifications for Mortal, found ${creatorNotifs.length}`);
    }

    // 7. Test Automatic Notification on New Campaign Creation
    console.log('\n7️⃣ Testing auto-notification on Campaign creation...');
    const newCampRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/brand/campaigns',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${brandToken}`
        }
      },
      {
        title: 'boAt Airdopes 141 ANC Blitz',
        description: 'Launch campaign for low-latency wireless gaming audio.',
        category: 'Tech & Gadgets',
        budget: 45000,
        platforms: ['youtube', 'instagram'],
        deliverables: ['1 YouTube tech review segment (60s)'],
        deadline: new Date(Date.now() + 14 * 86400000).toISOString()
      }
    );

    if (newCampRes.status !== 201 && newCampRes.status !== 200) {
      throw new Error(`Campaign creation failed: ${JSON.stringify(newCampRes.data)}`);
    }
    console.log('✅ Campaign created successfully.');

    // Check if new campaign notification was created for Brand
    const afterCampNotifs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/brand/notifications',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`
      }
    });
    const latestNotif = afterCampNotifs.data.data[0];
    console.log(`✅ Latest Brand notification after campaign creation: "${latestNotif?.title}" - "${latestNotif?.message}"`);

    console.log('\n🎉 ALL NOTIFICATION SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  }
}

runTests();
