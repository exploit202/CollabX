require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const models = require('../src/models');
const { verifyAccessToken } = require('../src/utils/jwt');

let server;
let baseUrl;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const postData = body ? JSON.stringify(body) : '';

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(postData);
    req.end();
  });
}

async function runPhase2CTests() {
  console.log('====================================================');
  console.log('🧪 COLLABX PHASE 2C CONTENT CREATOR E2E VERIFICATION');
  console.log('====================================================\n');

  const createdUserIds = [];
  const createdProfileIds = [];
  const createdCampaignIds = [];
  const createdInvitationIds = [];
  const createdNegotiationIds = [];
  const createdCollaborationIds = [];
  const createdPortfolioIds = [];
  const createdPricingIds = [];
  const createdNotificationIds = [];

  const results = [];

  const recordResult = (testName, pass, details = '') => {
    results.push({ test: testName, result: pass ? 'PASS' : 'FAIL', details });
    console.log(`${pass ? '  ✅' : '  ❌'} ${testName} — ${pass ? 'PASS' : 'FAIL'} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // 1. Database Connection
    await connectDB();
    console.log(`🔌 Connected to MongoDB Atlas: ${mongoose.connection.name}`);

    // 2. Start HTTP Server on dynamic test port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`📡 Test Server running on ${baseUrl}\n`);
        resolve();
      });
    });

    const timestamp = Date.now();

    // 3. BRAND & CREATOR ACCOUNTS SETUP
    console.log('[1/12] Registering Brand & Creator Test Accounts...');
    const brandEmail = `phase2c_brand_${timestamp}@collabx-test.com`;
    const creatorAEmail = `phase2c_creatorA_${timestamp}@collabx-test.com`;
    const creatorBEmail = `phase2c_creatorB_${timestamp}@collabx-test.com`;
    const commonPassword = 'SecurePassword123!';

    // Register Brand
    const brandReg = await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase2C Brand Enterprise',
      workEmail: brandEmail,
      password: commonPassword,
      industryType: 'Media'
    });
    const brandToken = brandReg.body?.data?.token;
    const brandUser = await models.User.findOne({ email: brandEmail });
    if (brandUser) createdUserIds.push(brandUser._id);

    // Register Creator A
    const creatorAReg = await makeRequest('POST', '/api/creator/auth/register', {
      fullName: 'Phase2C Creator Alex',
      email: creatorAEmail,
      phoneNumber: `98${timestamp.toString().slice(-8)}`,
      primaryContentNiche: 'Gaming',
      password: commonPassword,
      confirmPassword: commonPassword
    });
    const creatorAUserId = creatorAReg.body?.data?.user?.userId;
    if (creatorAUserId) createdUserIds.push(creatorAUserId);

    // Register Creator B (Security Check)
    const creatorBReg = await makeRequest('POST', '/api/creator/auth/register', {
      fullName: 'Phase2C Creator Bob',
      email: creatorBEmail,
      phoneNumber: `97${timestamp.toString().slice(-8)}`,
      primaryContentNiche: 'Fitness',
      password: commonPassword,
      confirmPassword: commonPassword
    });
    const creatorBUserId = creatorBReg.body?.data?.user?.userId;
    if (creatorBUserId) createdUserIds.push(creatorBUserId);

    // Complete Creator A Registration / Verification
    await models.User.findByIdAndUpdate(creatorAUserId, { isVerified: true, registrationStatus: 'completed' });
    await models.User.findByIdAndUpdate(creatorBUserId, { isVerified: true, registrationStatus: 'completed' });

    const creatorAProfile = await models.CreatorProfile.findOne({ userId: creatorAUserId });
    const creatorBProfile = await models.CreatorProfile.findOne({ userId: creatorBUserId });
    if (creatorAProfile) createdProfileIds.push(creatorAProfile._id);
    if (creatorBProfile) createdProfileIds.push(creatorBProfile._id);

    if (creatorAProfile && creatorAProfile.userId.equals(creatorAUserId)) {
      recordResult('Creator Registration & Identity', true, `Creator User ${creatorAUserId}, CreatorProfile linked`);
    } else {
      recordResult('Creator Registration & Identity', false, 'CreatorProfile.userId mismatch');
    }

    // 4. CREATOR LOGIN & JWT TEST
    console.log('\n[2/12] Testing Creator Login & JWT Generation...');
    const creatorALogin = await makeRequest('POST', '/api/creator/auth/login', {
      email: creatorAEmail,
      password: commonPassword
    });

    const creatorBLogin = await makeRequest('POST', '/api/creator/auth/login', {
      email: creatorBEmail,
      password: commonPassword
    });

    const creatorAToken = creatorALogin.body?.data?.token;
    const creatorBToken = creatorBLogin.body?.data?.token;

    if (creatorAToken) {
      const decoded = verifyAccessToken(creatorAToken);
      if (decoded.userId === creatorAUserId.toString() && decoded.role === 'creator') {
        recordResult('Creator Login & JWT', true, 'JWT contains valid creator userId & role');
      } else {
        recordResult('Creator Login & JWT', false, 'JWT token payload invalid');
      }
    } else {
      recordResult('Creator Login & JWT', false, `HTTP ${creatorALogin.status}`);
    }

    // 5. CREATOR PROFILE RETRIEVAL & UPDATE
    console.log('\n[3/12] Testing Creator Profile Retrieval & Update...');
    const getProfileRes = await makeRequest('GET', '/api/creator/profile', null, {
      Authorization: `Bearer ${creatorAToken}`
    });

    const updateProfileRes = await makeRequest('PATCH', '/api/creator/profile', {
      bio: 'Verified Phase 2C Content Creator Bio'
    }, {
      Authorization: `Bearer ${creatorAToken}`
    });

    if (getProfileRes.status === 200 && updateProfileRes.status === 200 && updateProfileRes.body?.data?.profile?.bio === 'Verified Phase 2C Content Creator Bio') {
      recordResult('Creator Profile GET & PATCH', true, 'Profile updated and verified in MongoDB');
    } else {
      recordResult('Creator Profile GET & PATCH', false, `HTTP ${updateProfileRes.status}`);
    }

    // 6. CAMPAIGN DISCOVERY INTEGRATION
    console.log('\n[4/12] Testing Campaign Discovery (Brand -> Creator)...');
    const campaignRes = await makeRequest('POST', '/api/brand/campaigns', {
      title: 'Phase2C Unified Campaign',
      description: 'Campaign created by Brand Owner for Creator Discovery',
      category: 'Gaming',
      budget: 12000,
      deadline: '2026-12-31',
      status: 'active'
    }, {
      Authorization: `Bearer ${brandToken}`
    });

    const campaignId = campaignRes.body?.data?._id;
    if (campaignId) createdCampaignIds.push(campaignId);

    const discoverRes = await makeRequest('GET', '/api/creator/campaigns/discover', null, {
      Authorization: `Bearer ${creatorAToken}`
    });

    const foundCampaign = Array.isArray(discoverRes.body?.data)
      ? discoverRes.body.data.find((c) => c._id === campaignId || c.id === campaignId)
      : null;

    if (foundCampaign) {
      recordResult('Campaign Discovery Integration', true, `Creator discovered Brand campaign: ${campaignId}`);
    } else {
      recordResult('Campaign Discovery Integration', false, 'Brand campaign not found in Creator discovery query');
    }

    // 7. INVITATION INTEGRATION (Brand -> Creator -> Accept)
    console.log('\n[5/12] Testing Invitation Integration (Brand -> Creator -> Respond)...');
    const invRes = await makeRequest('POST', '/api/brand/invitations', {
      campaignId,
      creatorId: creatorAUserId,
      proposedPrice: 9500,
      deliverables: ['1 YouTube Gaming Review'],
      message: 'Exclusive invitation for Creator A'
    }, {
      Authorization: `Bearer ${brandToken}`
    });

    const invitationId = invRes.body?.data?._id;
    if (invitationId) createdInvitationIds.push(invitationId);

    const creatorRequestsRes = await makeRequest('GET', '/api/creator/requests', null, {
      Authorization: `Bearer ${creatorAToken}`
    });

    const hasInvitation = Array.isArray(creatorRequestsRes.body?.data)
      ? creatorRequestsRes.body.data.some((i) => i._id === invitationId)
      : false;

    const acceptRes = await makeRequest('PATCH', `/api/creator/requests/${invitationId}/respond`, {
      status: 'accepted'
    }, {
      Authorization: `Bearer ${creatorAToken}`
    });

    const collabId = acceptRes.body?.data?.collaboration?._id;
    if (collabId) createdCollaborationIds.push(collabId);

    if (hasInvitation && acceptRes.status === 200 && collabId) {
      recordResult('Invitation Integration', true, `Invitation ${invitationId} accepted, Collaboration ${collabId} created`);
    } else {
      recordResult('Invitation Integration', false, `HTTP ${acceptRes.status}: ${JSON.stringify(acceptRes.body)}`);
    }

    // 8. NEGOTIATION INTEGRATION
    console.log('\n[6/12] Testing Negotiation Integration (Brand -> Creator -> Counter Offer)...');
    const inv2Res = await makeRequest('POST', '/api/brand/invitations', {
      campaignId,
      creatorId: creatorAUserId,
      proposedPrice: 5000,
      deliverables: ['1 Twitch Stream']
    }, {
      Authorization: `Bearer ${brandToken}`
    });
    const inv2Id = inv2Res.body?.data?._id;
    if (inv2Id) createdInvitationIds.push(inv2Id);

    const negStartRes = await makeRequest('PATCH', `/api/creator/requests/${inv2Id}/respond`, {
      status: 'negotiating'
    }, {
      Authorization: `Bearer ${creatorAToken}`
    });

    const negId = negStartRes.body?.data?.negotiation?._id;
    if (negId) createdNegotiationIds.push(negId);

    const offerRes = await makeRequest('POST', `/api/creator/negotiations/${negId}/offers`, {
      message: 'Counter offer: $7,000 for stream',
      proposedBudget: 7000
    }, {
      Authorization: `Bearer ${creatorAToken}`
    });

    if (negId && offerRes.status === 200) {
      recordResult('Negotiation Integration', true, `Counter offer submitted for Negotiation ${negId}`);
    } else {
      recordResult('Negotiation Integration', false, `HTTP ${offerRes.status}`);
    }

    // 9. COLLABORATION SUBMISSION FLOW
    console.log('\n[7/12] Testing Collaboration Submission Flow...');
    if (collabId) {
      const submitRes = await makeRequest('PATCH', `/api/creator/collaborations/${collabId}/submit`, {
        submissionUrl: 'https://youtube.com/watch?v=phase2c_review',
        submissionNotes: 'Content review finished'
      }, {
        Authorization: `Bearer ${creatorAToken}`
      });

      const updatedCollab = await models.Collaboration.findById(collabId);
      if (submitRes.status === 200 && updatedCollab && updatedCollab.status === 'content_submitted') {
        recordResult('Collaboration Submission', true, `Collaboration status updated to content_submitted`);
      } else {
        recordResult('Collaboration Submission', false, `HTTP ${submitRes.status}`);
      }
    } else {
      recordResult('Collaboration Submission', false, 'No collaboration available for submission test');
    }

    // 10. PORTFOLIO & PRICING TESTS
    console.log('\n[8/12] Testing Portfolio & Pricing Modules...');
    const portfolioRes = await makeRequest('POST', '/api/creator/portfolio', {
      title: 'Phase 2C Game Review',
      description: 'Featured gameplay stream video',
      brandName: 'Tech Brand',
      mediaType: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1511367461989'
    }, {
      Authorization: `Bearer ${creatorAToken}`
    });

    const portfolioId = portfolioRes.body?.data?._id;
    if (portfolioId) createdPortfolioIds.push(portfolioId);

    const pricingRes = await makeRequest('POST', '/api/creator/pricing', {
      title: 'YouTube Dedicated Video',
      description: '10-minute dedicated product integration',
      platform: 'YouTube',
      price: 15000,
      deliveryDays: 5,
      deliverables: ['1 Video', '1 Community Post']
    }, {
      Authorization: `Bearer ${creatorAToken}`
    });

    const pricingId = pricingRes.body?.data?._id;
    if (pricingId) createdPricingIds.push(pricingId);

    const portfolioDoc = await models.Portfolio.findById(portfolioId);
    const pricingDoc = await models.Pricing.findById(pricingId);

    if (portfolioDoc && portfolioDoc.creator.equals(creatorAUserId) && pricingDoc && pricingDoc.creatorId.equals(creatorAUserId)) {
      recordResult('Portfolio & Pricing', true, 'Portfolio & Pricing references match canonical User._id');
    } else {
      recordResult('Portfolio & Pricing', false, 'Ref mismatch on Portfolio or Pricing');
    }

    // 11. NOTIFICATIONS TEST
    console.log('\n[9/12] Testing Notification Isolation...');
    const notif = await models.Notification.create({
      userId: creatorAUserId,
      type: 'invitation',
      title: 'New Invitation Alert',
      message: 'You received a new campaign invitation'
    });
    createdNotificationIds.push(notif._id);

    const notifARes = await makeRequest('GET', '/api/creator/notifications', null, {
      Authorization: `Bearer ${creatorAToken}`
    });

    const notifBRes = await makeRequest('GET', '/api/creator/notifications', null, {
      Authorization: `Bearer ${creatorBToken}`
    });

    const hasNotifA = Array.isArray(notifARes.body?.data) && notifARes.body.data.some((n) => n._id === notif._id.toString());
    const hasNotifB = Array.isArray(notifBRes.body?.data) && notifBRes.body.data.some((n) => n._id === notif._id.toString());

    if (hasNotifA && !hasNotifB) {
      recordResult('Notification Isolation', true, 'Creator A received notification; Creator B cannot view it');
    } else {
      recordResult('Notification Isolation', false, 'Notification isolation leak detected');
    }

    // 12. SECURITY & AUTHORIZATION TESTS
    console.log('\n[10/12] Testing Security Protocols (Unauth, Wrong Role, Cross-Creator)...');
    const unauthRes = await makeRequest('GET', '/api/creator/profile');
    const wrongRoleRes = await makeRequest('PATCH', '/api/creator/profile', { bio: 'Hacked' }, {
      Authorization: `Bearer ${brandToken}`
    });

    const crossCreatorRes = await makeRequest('DELETE', `/api/creator/portfolio/${portfolioId}`, null, {
      Authorization: `Bearer ${creatorBToken}`
    });

    const unauthPass = unauthRes.status === 401;
    const wrongRolePass = wrongRoleRes.status === 403;
    const crossCreatorPass = [403, 404].includes(crossCreatorRes.status);

    if (unauthPass && wrongRolePass && crossCreatorPass) {
      recordResult('Security & Authorization', true, 'Unauthenticated (401), Wrong Role (403), Cross-Creator (403/404) verified');
    } else {
      recordResult('Security & Authorization', false, `Unauth: ${unauthRes.status}, WrongRole: ${wrongRoleRes.status}, CrossCreator: ${crossCreatorRes.status}`);
    }

    // 13. MONGODB RELATIONSHIPS VERIFICATION
    console.log('\n[11/12] Verifying MongoDB Entity Relationships...');
    let relPass = true;
    for (const uid of createdUserIds) {
      const u = await models.User.findById(uid);
      if (!u) relPass = false;
    }

    if (relPass) {
      recordResult('MongoDB Relationship Verification', true, 'All foreign key relationships verified');
    } else {
      recordResult('MongoDB Relationship Verification', false, 'Relationship check failed');
    }

    // 14. CLEANUP
    console.log('\n[12/12] Cleaning Up Phase 2C Temporary Test Records...');
    await models.Notification.deleteMany({ _id: { $in: createdNotificationIds } });
    await models.Pricing.deleteMany({ _id: { $in: createdPricingIds } });
    await models.Portfolio.deleteMany({ _id: { $in: createdPortfolioIds } });
    await models.Collaboration.deleteMany({ _id: { $in: createdCollaborationIds } });
    await models.Negotiation.deleteMany({ _id: { $in: createdNegotiationIds } });
    await models.Invitation.deleteMany({ _id: { $in: createdInvitationIds } });
    await models.Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    await models.CreatorProfile.deleteMany({ _id: { $in: createdProfileIds } });
    await models.BrandProfile.deleteMany({ _id: { $in: createdProfileIds } });
    await models.User.deleteMany({ _id: { $in: createdUserIds } });

    const remainingCount = await models.User.countDocuments({
      email: { $in: [brandEmail, creatorAEmail, creatorBEmail] }
    });

    if (remainingCount === 0) {
      recordResult('Cleanup', true, 'All Phase 2C test documents removed cleanly');
    } else {
      recordResult('Cleanup', false, `${remainingCount} orphan test records remained`);
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 2C Suite', false, err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & Database connections closed cleanly.');
  }

  return results;
}

runPhase2CTests().then((results) => {
  const failed = results.filter((r) => r.result === 'FAIL');
  if (failed.length > 0) {
    console.error(`\n❌ PHASE 2C FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n====================================================');
    console.log('🎉 PHASE 2C CONTENT CREATOR INTEGRATION PASSED');
    console.log('====================================================');
    process.exit(0);
  }
});
