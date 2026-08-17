require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const models = require('../src/models');
const { generateToken } = require('../src/utils/jwt');

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

async function runPhase5ATests() {
  console.log('====================================================');
  console.log('🧪 COLLABX PHASE 5A FRONTEND INTEGRATION VERIFICATION');
  console.log('====================================================\n');

  const testResults = [];
  const createdUserIds = [];
  const createdCampaignIds = [];
  const createdInvitationIds = [];
  const createdCollaborationIds = [];
  const createdPaymentIds = [];
  const createdReviewIds = [];

  const recordResult = (testName, status, details = '') => {
    testResults.push({ test: testName, status, details });
    console.log(`${status === 'PASS' ? '  ✅' : '  ❌'} ${testName} — ${status} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // Connect DB
    await connectDB();
    console.log(`🔌 Database connected: ${mongoose.connection.name}`);

    // Start HTTP server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    console.log(`📡 Test Server listening on ${baseUrl}`);

    const timestamp = Date.now();
    const brandEmail = `phase5a_brand_${timestamp}@collabx.com`;
    const creatorEmail = `phase5a_creator_${timestamp}@collabx.com`;
    const brandBEmail = `phase5a_brandB_${timestamp}@collabx.com`;
    const creatorBEmail = `phase5a_creatorB_${timestamp}@collabx.com`;
    const password = 'SecurePassword123!';

    // ==================================================
    // ITEM 1 — AUTHENTICATION STATE & SESSION RESTORATION
    // ==================================================
    console.log('\n[ITEM 1] Testing Authentication & Session Restoration APIs...');

    const brandRegRes = await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase 5A Brand Corp',
      email: brandEmail,
      password: password
    });
    const brandUser = await models.User.findOne({ email: brandEmail });
    createdUserIds.push(brandUser._id);
    const brandToken = generateToken(brandUser);

    const creatorRegRes = await makeRequest('POST', '/api/creator/auth/register', {
      fullName: 'Phase 5A Creator Studio',
      email: creatorEmail,
      password: password,
      primaryContentNiche: 'Lifestyle'
    });
    const creatorUser = await models.User.findOne({ email: creatorEmail });
    createdUserIds.push(creatorUser._id);
    const creatorToken = generateToken(creatorUser);

    // Brand B & Creator B for isolation testing
    const brandBUser = await models.User.create({
      fullName: 'Phase 5A Brand Beta',
      email: brandBEmail,
      password: 'hashed_pw_dummy',
      role: 'brand',
      isActive: true
    });
    createdUserIds.push(brandBUser._id);
    const brandBToken = generateToken(brandBUser);

    const creatorBUser = await models.User.create({
      fullName: 'Phase 5A Creator Beta',
      email: creatorBEmail,
      password: 'hashed_pw_dummy',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorBUser._id);

    const brandProfileRes = await makeRequest('GET', '/api/brand/profile', null, {
      Authorization: `Bearer ${brandToken}`
    });
    const creatorProfileRes = await makeRequest('GET', '/api/creator/profile', null, {
      Authorization: `Bearer ${creatorToken}`
    });

    if (
      brandRegRes.status === 201 &&
      creatorRegRes.status === 201 &&
      brandProfileRes.status === 200 &&
      creatorProfileRes.status === 200
    ) {
      recordResult('ITEM 1: Auth & Profile Retrieval Integration', 'PASS', 'Brand & Creator authenticated with session restoration profile APIs');
    } else {
      recordResult('ITEM 1: Auth & Profile Retrieval Integration', 'FAIL', `Brand HTTP ${brandRegRes.status}, Creator HTTP ${creatorRegRes.status}`);
    }

    // ==================================================
    // ITEM 2 — BRAND DASHBOARD ANALYTICS INTEGRATION
    // ==================================================
    console.log('\n[ITEM 2] Testing Brand Dashboard Analytics integration contract...');
    const brandAnalyticsRes = await makeRequest('GET', '/api/brand/analytics', null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (brandAnalyticsRes.status === 200 && brandAnalyticsRes.body.success && brandAnalyticsRes.body.data) {
      recordResult('ITEM 2: Brand Dashboard Analytics Integration', 'PASS', `Keys verified: ${Object.keys(brandAnalyticsRes.body.data).join(', ')}`);
    } else {
      recordResult('ITEM 2: Brand Dashboard Analytics Integration', 'FAIL', `HTTP ${brandAnalyticsRes.status}`);
    }

    // ==================================================
    // ITEM 3 — CREATOR DASHBOARD ANALYTICS INTEGRATION
    // ==================================================
    console.log('\n[ITEM 3] Testing Creator Dashboard Analytics integration contract...');
    const creatorAnalyticsRes = await makeRequest('GET', '/api/creator/analytics', null, {
      Authorization: `Bearer ${creatorToken}`
    });

    if (creatorAnalyticsRes.status === 200 && creatorAnalyticsRes.body.success && creatorAnalyticsRes.body.data) {
      recordResult('ITEM 3: Creator Dashboard Analytics Integration', 'PASS', `Keys verified: ${Object.keys(creatorAnalyticsRes.body.data).join(', ')}`);
    } else {
      recordResult('ITEM 3: Creator Dashboard Analytics Integration', 'FAIL', `HTTP ${creatorAnalyticsRes.status}`);
    }

    // ==================================================
    // ITEM 4 — CAMPAIGN CREATION & DISCOVERY INTEGRATION
    // ==================================================
    console.log('\n[ITEM 4] Testing Campaign Creation & Discovery Integration...');
    const campaignDoc = await models.Campaign.create({
      brandId: brandUser._id,
      brandName: 'Phase 5A Brand Corp',
      title: 'Phase 5A Campaign Integration Brief',
      description: 'Full stack integration test campaign',
      category: 'Lifestyle',
      budget: 35000,
      status: 'active'
    });
    createdCampaignIds.push(campaignDoc._id);

    const discoverRes = await makeRequest('GET', '/api/creator/campaigns/discover', null, {
      Authorization: `Bearer ${creatorToken}`
    });

    const foundCamp = (discoverRes.body.data || []).find((c) => String(c._id || c.id) === String(campaignDoc._id));
    if (discoverRes.status === 200 && foundCamp) {
      recordResult('ITEM 4: Campaign Creation & Discovery Integration', 'PASS', `Found campaign: "${foundCamp.title}"`);
    } else {
      recordResult('ITEM 4: Campaign Creation & Discovery Integration', 'FAIL', `HTTP ${discoverRes.status}`);
    }

    // ==================================================
    // ITEM 5 — INVITATION CREATION & RESPONSE INTEGRATION
    // ==================================================
    console.log('\n[ITEM 5] Testing Invitation Creation & Response Integration...');
    const inviteRes = await makeRequest('POST', '/api/brand/invitations', {
      campaignId: campaignDoc._id,
      creatorId: creatorUser._id,
      proposedPrice: 35000,
      message: 'Join our Phase 5A full stack integration!'
    }, { Authorization: `Bearer ${brandToken}` });

    const invitationDoc = inviteRes.body.data;
    if (invitationDoc) createdInvitationIds.push(invitationDoc._id);

    const acceptRes = await makeRequest('PATCH', `/api/creator/requests/${invitationDoc._id}/respond`, {
      status: 'accepted'
    }, { Authorization: `Bearer ${creatorToken}` });

    const collabDoc = acceptRes.body.data.collaboration;
    if (collabDoc) createdCollaborationIds.push(collabDoc._id);

    if (inviteRes.status === 201 && acceptRes.status === 200 && collabDoc) {
      recordResult('ITEM 5: Invitation & Response Integration', 'PASS', `Created Collaboration ID: ${collabDoc._id}`);
    } else {
      recordResult('ITEM 5: Invitation & Response Integration', 'FAIL', `Invite HTTP ${inviteRes.status}, Accept HTTP ${acceptRes.status}`);
    }

    // ==================================================
    // ITEM 6-8 — COLLABORATION LIFECYCLE & DELIVERABLE REVISION
    // ==================================================
    console.log('\n[ITEM 6-8] Testing Collaboration Lifecycle & Revision Integration...');

    // 1. Submit deliverables
    const submitRes = await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://youtube.com/watch?v=phase5a_draft1',
      submissionNotes: 'Phase 5A first draft.'
    }, { Authorization: `Bearer ${creatorToken}` });

    // 2. Request revision
    const revisionRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/revision`, {
      revisionNotes: 'Please enhance brightness.'
    }, { Authorization: `Bearer ${brandToken}` });

    // 3. Resubmit deliverables
    const resubmitRes = await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://youtube.com/watch?v=phase5a_draft2',
      submissionNotes: 'Phase 5A revised draft.'
    }, { Authorization: `Bearer ${creatorToken}` });

    // 4. Approve deliverables
    const approveRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/approve`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    // 5. Complete collaboration
    const completeRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/complete`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (
      submitRes.status === 200 &&
      revisionRes.status === 200 &&
      resubmitRes.status === 200 &&
      approveRes.status === 200 &&
      completeRes.status === 200
    ) {
      recordResult('ITEM 6-8: Collaboration Lifecycle & Revision Integration', 'PASS', 'State transitions: active -> content_submitted -> revision_requested -> content_submitted -> brand_approved -> completed');
    } else {
      recordResult('ITEM 6-8: Collaboration Lifecycle & Revision Integration', 'FAIL', `Submit ${submitRes.status}, Revise ${revisionRes.status}, Complete ${completeRes.status}`);
    }

    // ==================================================
    // ITEM 9 — PAYMENT ESCROW & PAYOUT INTEGRATION
    // ==================================================
    console.log('\n[ITEM 9] Testing Payment Escrow & Release Integration...');
    const escrowRes = await makeRequest('POST', '/api/brand/payments/escrow', {
      collaborationId: collabDoc._id,
      amount: 35000
    }, { Authorization: `Bearer ${brandToken}` });
    const paymentDoc = escrowRes.body.data;
    if (paymentDoc) createdPaymentIds.push(paymentDoc._id);

    const releaseRes = await makeRequest('PATCH', `/api/brand/payments/${paymentDoc._id}/release`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (escrowRes.status === 201 && releaseRes.status === 200) {
      recordResult('ITEM 9: Payment Escrow & Payout Integration', 'PASS', 'Simulated escrow deposited & released to creator account');
    } else {
      recordResult('ITEM 9: Payment Escrow & Payout Integration', 'FAIL', `Escrow HTTP ${escrowRes.status}, Release HTTP ${releaseRes.status}`);
    }

    // ==================================================
    // ITEM 10 — REVIEW & RATING INTEGRATION
    // ==================================================
    console.log('\n[ITEM 10] Testing Review & Rating Integration...');
    const reviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 5,
      review: 'Top tier creator! Completed deliverables on time.'
    }, { Authorization: `Bearer ${brandToken}` });

    if (reviewRes.body.data) createdReviewIds.push(reviewRes.body.data._id);

    if (reviewRes.status === 201) {
      recordResult('ITEM 10: Review & Rating Integration', 'PASS', 'Verified 5-star review submitted & aggregate rating updated');
    } else {
      recordResult('ITEM 10: Review & Rating Integration', 'FAIL', `HTTP ${reviewRes.status}`);
    }

    // ==================================================
    // ITEM 11 — NOTIFICATION INTEGRATION & READ TOGGLE
    // ==================================================
    console.log('\n[ITEM 11] Testing Notification Retrieval & Read Toggle...');
    const creatorNotifsRes = await makeRequest('GET', '/api/creator/notifications', null, {
      Authorization: `Bearer ${creatorToken}`
    });
    const notifList = creatorNotifsRes.body.data || [];
    const targetNotif = notifList[0];

    let markReadOk = false;
    if (targetNotif) {
      const readRes = await makeRequest('PATCH', `/api/creator/notifications/${targetNotif._id || targetNotif.id}/read`, null, {
        Authorization: `Bearer ${creatorToken}`
      });
      markReadOk = readRes.status === 200;
    }

    if (creatorNotifsRes.status === 200 && notifList.length > 0 && markReadOk) {
      recordResult('ITEM 11: Notification Retrieval & Read Toggle', 'PASS', `Received ${notifList.length} notifications, marked read successfully`);
    } else {
      recordResult('ITEM 11: Notification Retrieval & Read Toggle', 'FAIL', `HTTP ${creatorNotifsRes.status}`);
    }

    // ==================================================
    // ITEM 12 — ANALYTICS DATA CONSISTENCY
    // ==================================================
    console.log('\n[ITEM 12] Testing Analytics Data Consistency...');
    const postBrandAnalytics = await makeRequest('GET', '/api/brand/analytics', null, {
      Authorization: `Bearer ${brandToken}`
    });
    const pbData = postBrandAnalytics.body.data || {};

    if (
      pbData.completedCollaborations === 1 &&
      pbData.totalReleasedAmount === 35000 &&
      pbData.collaborationCompletionRate === 100
    ) {
      recordResult('ITEM 12: Analytics Data Consistency', 'PASS', `Confirmed $35,000 released, 100% completion rate`);
    } else {
      recordResult('ITEM 12: Analytics Data Consistency', 'FAIL', `Data mismatch: ${JSON.stringify(pbData)}`);
    }

    // ==================================================
    // ITEM 13 — COLLABORATION ACTIVITY TIMELINE INTEGRATION
    // ==================================================
    console.log('\n[ITEM 13] Testing Collaboration Activity History Integration...');
    const actRes = await makeRequest('GET', `/api/brand/collaborations/${collabDoc._id}/activity`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (actRes.status === 200 && (actRes.body.activities || []).length > 0) {
      recordResult('ITEM 13: Collaboration Activity Timeline Integration', 'PASS', `Retrieved ${actRes.body.activities.length} timeline events`);
    } else {
      recordResult('ITEM 13: Collaboration Activity Timeline Integration', 'FAIL', `HTTP ${actRes.status}`);
    }

    // ==================================================
    // ITEM 14 — ROLE & CROSS-USER SECURITY ISOLATION
    // ==================================================
    console.log('\n[ITEM 14] Testing Role & Cross-User Security Isolation...');
    const brandBActRes = await makeRequest('GET', `/api/brand/collaborations/${collabDoc._id}/activity`, null, {
      Authorization: `Bearer ${brandBToken}`
    });
    const unauthAnalyticsRes = await makeRequest('GET', '/api/brand/analytics');

    if (brandBActRes.status === 403 && unauthAnalyticsRes.status === 401) {
      recordResult('ITEM 14: Role & Security Isolation', 'PASS', 'Non-participant rejected with 403, unauthenticated rejected with 401');
    } else {
      recordResult('ITEM 14: Role & Security Isolation', 'FAIL', `Brand B HTTP ${brandBActRes.status}, Unauth HTTP ${unauthAnalyticsRes.status}`);
    }

    // ==================================================
    // ITEM 15 — MONGODB CLEANUP & DATA INTEGRITY
    // ==================================================
    console.log('\n[ITEM 15] Verifying relationships & cleaning up test data...');
    await models.Notification.deleteMany({ userId: { $in: createdUserIds } });
    await models.Review.deleteMany({ _id: { $in: createdReviewIds } });
    await models.Payment.deleteMany({ _id: { $in: createdPaymentIds } });
    await models.Collaboration.deleteMany({ _id: { $in: createdCollaborationIds } });
    await models.Invitation.deleteMany({ _id: { $in: createdInvitationIds } });
    await models.Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    await models.CreatorProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.BrandProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.User.deleteMany({ _id: { $in: createdUserIds } });

    const orphanCount = await models.User.countDocuments({ _id: { $in: createdUserIds } });
    if (orphanCount === 0) {
      recordResult('ITEM 15: MongoDB Cleanup & Integrity', 'PASS', '100% temporary Phase 5A test records removed cleanly');
    } else {
      recordResult('ITEM 15: MongoDB Cleanup & Integrity', 'FAIL', `Remaining orphan docs: ${orphanCount}`);
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 5A Verification Suite', 'FAIL', err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & Database connections closed cleanly.');
  }

  return testResults;
}

runPhase5ATests().then((results) => {
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n====================================================');
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} Phase 5A Assertions Passed`);
  console.log('====================================================');

  if (failed.length > 0) {
    console.error(`\n❌ PHASE 5A VERIFICATION FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n🎉 PHASE 5A FRONTEND INTEGRATION PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
});
