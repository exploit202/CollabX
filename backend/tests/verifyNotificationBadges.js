require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const { generateAccessToken } = require('../src/utils/jwt');
const User = require('../src/models/user.model');
const CreatorProfile = require('../src/models/creatorProfile.model');
const BrandProfile = require('../src/models/brandProfile.model');
const Campaign = require('../src/models/campaign.model');
const Invitation = require('../src/models/invitation.model');
const Negotiation = require('../src/models/negotiation.model');
const Notification = require('../src/models/notification.model');

async function runTests() {
  console.log('====================================================');
  console.log('🚀 TESTING CREATOR NOTIFICATIONS & BADGE DATA BINDING');
  console.log('====================================================');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`📡 Test server running at ${baseUrl}`);

  const stamp = Date.now();
  let creatorToken, brandToken, creatorUser, brandUser, campaignDoc, invitationId, notificationId;

  try {
    // 1. Register Creator & generate full access token
    const creatorRes = await fetch(`${baseUrl}/api/creator/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Badge Creator Test',
        email: `creator_badge_${stamp}@test.collabx`,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      })
    });
    const creatorData = await creatorRes.json();
    creatorUser = creatorData.data?.user || creatorData.user;
    creatorToken = generateAccessToken({
      userId: creatorUser._id || creatorUser.id,
      email: creatorUser.email,
      role: 'creator'
    });
    console.log('✅ 1. Creator registered & authenticated.');

    // 2. Register Brand & generate full access token
    const brandRes = await fetch(`${baseUrl}/api/brand/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Badge Brand Inc',
        fullName: 'Badge Brand Test',
        email: `brand_badge_${stamp}@test.collabx`,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      })
    });
    const brandData = await brandRes.json();
    brandUser = brandData.data?.user || brandData.user;
    brandToken = generateAccessToken({
      userId: brandUser._id || brandUser.id,
      email: brandUser.email,
      role: 'brand'
    });
    console.log('✅ 2. Brand registered & authenticated.');

    // 3. Check Initial Counts (Expect 0 items)
    const initNotifRes = await fetch(`${baseUrl}/api/creator/notifications`, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    const initNotif = await initNotifRes.json();
    console.log(`Initial unread notifications: ${initNotif.data.length}`);

    const initReqRes = await fetch(`${baseUrl}/api/creator/requests`, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    const initReq = await initReqRes.json();
    console.log(`Initial pending requests: ${initReq.data.length}`);

    const initNegRes = await fetch(`${baseUrl}/api/creator/negotiations`, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    const initNeg = await initNegRes.json();
    console.log(`Initial active negotiations: ${initNeg.data.length}`);

    if (initNotif.data.length !== 0 || initReq.data.length !== 0 || initNeg.data.length !== 0) {
      throw new Error('Initial badge counts should be 0!');
    }
    console.log('✅ 3. Verified initial Creator badges are 0 (hidden).');

    // 4. Create Campaign & Brand Sends Invitation to Creator
    const creatorProfile = await CreatorProfile.findOne({ userId: creatorUser._id || creatorUser.id });
    const brandProfile = await BrandProfile.findOne({ userId: brandUser._id || brandUser.id });

    campaignDoc = await Campaign.create({
      brandId: brandUser._id || brandUser.id,
      brandName: brandProfile.companyName || 'Badge Brand Inc',
      title: 'Badge Test Brief',
      description: 'Test Campaign Description',
      category: 'Technology',
      budget: 2000,
      deliverables: ['Instagram Reel'],
      status: 'active'
    });

    const invRes = await fetch(`${baseUrl}/api/brand/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`
      },
      body: JSON.stringify({
        campaignId: campaignDoc._id,
        creatorId: creatorUser._id || creatorUser.id,
        deliverables: ['Instagram Reel'],
        proposedPrice: 2000,
        message: 'Direct invitation to creator.'
      })
    });
    const invData = await invRes.json();
    invitationId = invData.data._id;
    console.log('✅ 4. Brand sent invitation to Creator.');

    // 5. Check Updated Requests Badge Count
    const reqRes = await fetch(`${baseUrl}/api/creator/requests`, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    const reqData = await reqRes.json();
    const pendingCount = reqData.data.filter((i) => i.status === 'pending').length;
    console.log(`Updated Collab Requests badge count: ${pendingCount}`);
    if (pendingCount !== 1) throw new Error(`Expected pending requests count 1, got ${pendingCount}`);
    console.log('✅ 5. Collab Requests badge updated to 1.');

    // 6. Check Updated Notifications Badge Count
    const notifRes = await fetch(`${baseUrl}/api/creator/notifications`, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    const notifData = await notifRes.json();
    const unreadCount = notifData.data.filter((n) => !n.isRead && !n.read).length;
    console.log(`Updated Notifications badge count: ${unreadCount}`);
    if (unreadCount < 1) throw new Error('Expected at least 1 unread notification');
    notificationId = notifData.data[0]._id;
    console.log('✅ 6. Notifications badge updated to 1.');

    // 7. Mark Notification as Read & Verify Unread Count Decreases
    const readRes = await fetch(`${baseUrl}/api/creator/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    const readData = await readRes.json();
    if (!readData.success || !readData.data.isRead) throw new Error('Failed to mark notification read!');

    const afterReadNotifRes = await fetch(`${baseUrl}/api/creator/notifications`, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    const afterReadData = await afterReadNotifRes.json();
    const remainingUnread = afterReadData.data.filter((n) => !n.isRead && !n.read).length;
    console.log(`Unread count after marking read: ${remainingUnread}`);
    if (remainingUnread !== 0) throw new Error('Unread notification count did not decrease!');
    console.log('✅ 7. Notification marked read & unread count decreased to 0.');

    // 8. Test Mark All as Read Endpoint
    const markAllRes = await fetch(`${baseUrl}/api/creator/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    const markAllData = await markAllRes.json();
    if (!markAllData.success) throw new Error('mark-all-read failed!');
    console.log('✅ 8. Mark all notifications as read endpoint passed.');

    // 9. Creator Responds with Negotiating -> Check Negotiations Badge Count
    const respondRes = await fetch(`${baseUrl}/api/creator/requests/${invitationId}/respond`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`
      },
      body: JSON.stringify({ status: 'negotiating' })
    });
    const respondData = await respondRes.json();
    if (!respondData.success) throw new Error('Failed to respond to invitation with negotiating!');

    const negRes = await fetch(`${baseUrl}/api/creator/negotiations`, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    const negData = await negRes.json();
    const activeNegCount = negData.data.filter((n) => ['active', 'open', 'pending', 'in_progress'].includes(n.status)).length;
    console.log(`Updated Negotiations badge count: ${activeNegCount}`);
    if (activeNegCount !== 1) throw new Error('Expected 1 active negotiation badge!');
    console.log('✅ 9. Negotiations badge updated to 1.');

  } finally {
    // Clean up temporary test data
    if (campaignDoc?._id) {
      await Campaign.findByIdAndDelete(campaignDoc._id);
    }
    if (creatorUser?._id || creatorUser?.id) {
      const cid = creatorUser._id || creatorUser.id;
      await User.findByIdAndDelete(cid);
      await CreatorProfile.deleteMany({ userId: cid });
      await Notification.deleteMany({ userId: cid });
      await Invitation.deleteMany({ creatorId: cid });
      await Negotiation.deleteMany({ creatorId: cid });
    }
    if (brandUser?._id || brandUser?.id) {
      const bid = brandUser._id || brandUser.id;
      await User.findByIdAndDelete(bid);
      await BrandProfile.deleteMany({ userId: bid });
      await Notification.deleteMany({ userId: bid });
      await Invitation.deleteMany({ brandId: bid });
      await Negotiation.deleteMany({ brandId: bid });
    }
    server.close();
    await mongoose.connection.close();
  }

  console.log('====================================================');
  console.log('🎉 ALL NOTIFICATION & BADGE DATA BINDING TESTS PASSED!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
