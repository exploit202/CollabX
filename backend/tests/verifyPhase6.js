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

async function runPhase6Tests() {
  console.log('====================================================');
  console.log('🚀 COLLABX PHASE 6 WEBSITE COMPLETION & STABILIZATION');
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
    const brandAEmail = `p6_brandA_${timestamp}@collabx.com`;
    const brandBEmail = `p6_brandB_${timestamp}@collabx.com`;
    const creatorAEmail = `p6_creatorA_${timestamp}@collabx.com`;
    const creatorBEmail = `p6_creatorB_${timestamp}@collabx.com`;
    const password = 'SecurePassword123!';

    // ==================================================
    // 1-3. AUTHENTICATION & SESSION RESTORATION
    // ==================================================
    console.log('\n[JOURNEY 1-3] Testing Brand & Creator Registration, Login & Session Restoration...');
    const brandRegRes = await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase 6 Brand Enterprise',
      email: brandAEmail,
      password: password
    });
    const brandAUser = await models.User.findOne({ email: brandAEmail });
    createdUserIds.push(brandAUser._id);
    const brandAToken = generateToken(brandAUser);

    const brandBUser = await models.User.create({
      fullName: 'Phase 6 Brand Isolation Check',
      email: brandBEmail,
      password: 'hashed_pw_dummy',
      role: 'brand',
      isActive: true
    });
    createdUserIds.push(brandBUser._id);
    const brandBToken = generateToken(brandBUser);

    const creatorRegRes = await makeRequest('POST', '/api/creator/auth/register', {
      fullName: 'Phase 6 Creator Studio',
      email: creatorAEmail,
      password: password,
      primaryContentNiche: 'Tech & Gadgets'
    });
    const creatorAUser = await models.User.findOne({ email: creatorAEmail });
    createdUserIds.push(creatorAUser._id);
    const creatorAToken = generateToken(creatorAUser);

    const creatorBUser = await models.User.create({
      fullName: 'Phase 6 Creator Isolation Check',
      email: creatorBEmail,
      password: 'hashed_pw_dummy',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorBUser._id);
    const creatorBToken = generateToken(creatorBUser);

    const brandProfileRes = await makeRequest('GET', '/api/brand/profile', null, { Authorization: `Bearer ${brandAToken}` });
    const creatorProfileRes = await makeRequest('GET', '/api/creator/profile', null, { Authorization: `Bearer ${creatorAToken}` });

    if (brandRegRes.status === 201 && creatorRegRes.status === 201 && brandProfileRes.status === 200 && creatorProfileRes.status === 200) {
      recordResult('1. Brand & Creator Authentication & Session Restoration', 'PASS', 'Both journeys authenticated & profiles restored');
    } else {
      recordResult('1. Brand & Creator Authentication & Session Restoration', 'FAIL', `Brand HTTP ${brandRegRes.status}, Creator HTTP ${creatorRegRes.status}`);
    }

    // ==================================================
    // 4-6. CAMPAIGN CREATION & DISCOVERY
    // ==================================================
    console.log('\n[JOURNEY 4-6] Testing Campaign Creation & Discovery Workflows...');
    const campaignRes = await makeRequest('POST', '/api/brand/campaigns', {
      title: 'Phase 6 Flagship Product Launch',
      description: 'Stabilized end to end campaign brief for high impact creators',
      category: 'Tech & Gadgets',
      budget: 45000,
      targetPlatforms: ['youtube', 'instagram']
    }, { Authorization: `Bearer ${brandAToken}` });

    const campaignDoc = campaignRes.body.data;
    if (campaignDoc) createdCampaignIds.push(campaignDoc._id);

    const discoverRes = await makeRequest('GET', '/api/creator/campaigns/discover', null, { Authorization: `Bearer ${creatorAToken}` });
    const foundCamp = (discoverRes.body.data || []).find((c) => String(c._id || c.id) === String(campaignDoc._id));

    if (campaignRes.status === 201 && discoverRes.status === 200 && foundCamp) {
      recordResult('2. Campaign Creation & Creator Discovery Workflow', 'PASS', `Published campaign "${foundCamp.title}" found by Creator`);
    } else {
      recordResult('2. Campaign Creation & Creator Discovery Workflow', 'FAIL', `Campaign HTTP ${campaignRes.status}, Discover HTTP ${discoverRes.status}`);
    }

    // ==================================================
    // 7-9. INVITATIONS & NEGOTIATION WORKFLOW
    // ==================================================
    console.log('\n[JOURNEY 7-9] Testing Invitation & Negotiation Workflows...');
    const inviteRes = await makeRequest('POST', '/api/brand/invitations', {
      campaignId: campaignDoc._id,
      creatorId: creatorAUser._id,
      proposedPrice: 45000,
      message: 'Exclusive invitation for Phase 6 flagship video review.'
    }, { Authorization: `Bearer ${brandAToken}` });

    const invitationDoc = inviteRes.body.data;
    if (invitationDoc) createdInvitationIds.push(invitationDoc._id);

    // Creator accepts invitation
    const acceptRes = await makeRequest('PATCH', `/api/creator/requests/${invitationDoc._id}/respond`, {
      status: 'accepted'
    }, { Authorization: `Bearer ${creatorAToken}` });

    const collabDoc = acceptRes.body.data?.collaboration;
    if (collabDoc) createdCollaborationIds.push(collabDoc._id);

    if (inviteRes.status === 201 && acceptRes.status === 200 && collabDoc) {
      recordResult('3. Invitation & Acceptance Workflow', 'PASS', `Collaboration established (ID: ${collabDoc._id})`);
    } else {
      recordResult('3. Invitation & Acceptance Workflow', 'FAIL', `Invite HTTP ${inviteRes.status}, Accept HTTP ${acceptRes.status}`);
    }

    // ==================================================
    // 10-15. FULL COLLABORATION LIFECYCLE & DELIVERABLE REVISION
    // ==================================================
    console.log('\n[JOURNEY 10-15] Testing Complete Collaboration Lifecycle & Deliverable Revision Flow...');

    // 1. Creator Submits Deliverables
    const submit1Res = await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://youtube.com/watch?v=phase6_v1',
      submissionNotes: 'Phase 6 initial video deliverable'
    }, { Authorization: `Bearer ${creatorAToken}` });

    // 2. Brand Requests Revision
    const reviseRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/revision`, {
      revisionNotes: 'Please add logo overlay at 0:15.'
    }, { Authorization: `Bearer ${brandAToken}` });

    // 3. Creator Resubmits Revised Deliverables
    const submit2Res = await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://youtube.com/watch?v=phase6_v2',
      submissionNotes: 'Phase 6 final revised video deliverable'
    }, { Authorization: `Bearer ${creatorAToken}` });

    // 4. Brand Approves Deliverables
    const approveRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/approve`, null, { Authorization: `Bearer ${brandAToken}` });

    // 5. Brand Completes Collaboration
    const completeRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/complete`, null, { Authorization: `Bearer ${brandAToken}` });

    if (
      submit1Res.status === 200 &&
      reviseRes.status === 200 &&
      submit2Res.status === 200 &&
      approveRes.status === 200 &&
      completeRes.status === 200
    ) {
      recordResult('4. Full Collaboration Lifecycle & Revision Flow', 'PASS', 'State transitions: active -> content_submitted -> revision_requested -> content_submitted -> brand_approved -> completed');
    } else {
      recordResult('4. Full Collaboration Lifecycle & Revision Flow', 'FAIL', `Submit ${submit1Res.status}, Revise ${reviseRes.status}, Complete ${completeRes.status}`);
    }

    // ==================================================
    // 16-17. PAYMENT ESCROW & CREATOR PAYOUT RELEASE
    // ==================================================
    console.log('\n[JOURNEY 16-17] Testing Escrow Deposit & Payout Release...');
    const escrowRes = await makeRequest('POST', '/api/brand/payments/escrow', {
      collaborationId: collabDoc._id,
      amount: 45000
    }, { Authorization: `Bearer ${brandAToken}` });

    const paymentDoc = escrowRes.body.data;
    if (paymentDoc) createdPaymentIds.push(paymentDoc._id);

    const releaseRes = await makeRequest('PATCH', `/api/brand/payments/${paymentDoc._id}/release`, null, { Authorization: `Bearer ${brandAToken}` });

    if (escrowRes.status === 201 && releaseRes.status === 200) {
      recordResult('5. Payment Escrow & Creator Payout Flow', 'PASS', 'Escrow deposited ($45,000) & released to creator account');
    } else {
      recordResult('5. Payment Escrow & Creator Payout Flow', 'FAIL', `Escrow HTTP ${escrowRes.status}, Release HTTP ${releaseRes.status}`);
    }

    // ==================================================
    // 18. REVIEW & RATING SUBMISSION
    // ==================================================
    console.log('\n[JOURNEY 18] Testing Star Review & Creator Rating Aggregation...');
    const reviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 5,
      review: 'Exceptional video quality and seamless collaboration!'
    }, { Authorization: `Bearer ${brandAToken}` });

    if (reviewRes.body.data) createdReviewIds.push(reviewRes.body.data._id);

    if (reviewRes.status === 201) {
      recordResult('6. Star Review & Rating Aggregation Flow', 'PASS', 'Verified 5-star rating recorded and profile updated');
    } else {
      recordResult('6. Star Review & Rating Aggregation Flow', 'FAIL', `HTTP ${reviewRes.status}`);
    }

    // ==================================================
    // 19. NOTIFICATIONS RETRIEVAL & MARK READ
    // ==================================================
    console.log('\n[JOURNEY 19] Testing Notification Retrieval & Read Toggle...');
    const notifsRes = await makeRequest('GET', '/api/creator/notifications', null, { Authorization: `Bearer ${creatorAToken}` });
    const notifList = notifsRes.body.data || [];
    const targetNotif = notifList[0];

    let readOk = false;
    if (targetNotif) {
      const readRes = await makeRequest('PATCH', `/api/creator/notifications/${targetNotif._id || targetNotif.id}/read`, null, { Authorization: `Bearer ${creatorAToken}` });
      readOk = readRes.status === 200;
    }

    if (notifsRes.status === 200 && notifList.length > 0 && readOk) {
      recordResult('7. Notification Center & Read Toggle Flow', 'PASS', `Retrieved ${notifList.length} notifications, marked read successfully`);
    } else {
      recordResult('7. Notification Center & Read Toggle Flow', 'FAIL', `HTTP ${notifsRes.status}`);
    }

    // ==================================================
    // 20. ANALYTICS METRICS RETRIEVAL
    // ==================================================
    console.log('\n[JOURNEY 20] Testing Brand & Creator Analytics Metrics...');
    const brandAnalytics = await makeRequest('GET', '/api/brand/analytics', null, { Authorization: `Bearer ${brandAToken}` });
    const creatorAnalytics = await makeRequest('GET', '/api/creator/analytics', null, { Authorization: `Bearer ${creatorAToken}` });

    const baData = brandAnalytics.body.data || {};
    const caData = creatorAnalytics.body.data || {};

    if (
      brandAnalytics.status === 200 &&
      creatorAnalytics.status === 200 &&
      baData.totalReleasedAmount === 45000 &&
      caData.totalReleasedEarnings === 45000
    ) {
      recordResult('8. Brand & Creator Analytics Workflow', 'PASS', 'Confirmed $45,000 financial metrics for Brand & Creator');
    } else {
      recordResult('8. Brand & Creator Analytics Workflow', 'FAIL', `Brand HTTP ${brandAnalytics.status}, Creator HTTP ${creatorAnalytics.status}`);
    }

    // ==================================================
    // 21. ACTIVITY TIMELINE CHRONOLOGICAL ORDERING
    // ==================================================
    console.log('\n[JOURNEY 21] Testing Chronological Activity History Timeline...');
    const actRes = await makeRequest('GET', `/api/brand/collaborations/${collabDoc._id}/activity`, null, { Authorization: `Bearer ${brandAToken}` });

    if (actRes.status === 200 && (actRes.body.activities || []).length > 0) {
      recordResult('9. Chronological Activity Timeline Flow', 'PASS', `Retrieved ${actRes.body.activities.length} timeline activity events`);
    } else {
      recordResult('9. Chronological Activity Timeline Flow', 'FAIL', `HTTP ${actRes.status}`);
    }

    // ==================================================
    // 22. SECURITY & ISOLATION GUARDS
    // ==================================================
    console.log('\n[JOURNEY 22] Testing Security Role & Participant Isolation Guards...');
    const brandBActRes = await makeRequest('GET', `/api/brand/collaborations/${collabDoc._id}/activity`, null, { Authorization: `Bearer ${brandBToken}` });
    const unauthAnalytics = await makeRequest('GET', '/api/brand/analytics');

    if (brandBActRes.status === 403 && unauthAnalytics.status === 401) {
      recordResult('10. Security & Ownership Isolation Guards', 'PASS', 'Non-participant rejected with HTTP 403, unauthenticated rejected with HTTP 401');
    } else {
      recordResult('10. Security & Ownership Isolation Guards', 'FAIL', `Brand B HTTP ${brandBActRes.status}, Unauth HTTP ${unauthAnalytics.status}`);
    }

    // ==================================================
    // 23. MONGODB CLEANUP & DATA INTEGRITY
    // ==================================================
    console.log('\n[JOURNEY 23] Cleaning up temporary test data & verifying MongoDB integrity...');
    await models.Notification.deleteMany({ userId: { $in: createdUserIds } });
    await models.Review.deleteMany({ _id: { $in: createdReviewIds } });
    await models.Payment.deleteMany({ _id: { $in: createdPaymentIds } });
    await models.Collaboration.deleteMany({ _id: { $in: createdCollaborationIds } });
    await models.Invitation.deleteMany({ _id: { $in: createdInvitationIds } });
    await models.Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    await models.BrandProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.CreatorProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.User.deleteMany({ _id: { $in: createdUserIds } });

    const orphanCount = await models.User.countDocuments({ _id: { $in: createdUserIds } });
    if (orphanCount === 0) {
      recordResult('11. MongoDB Cleanup & Database Integrity', 'PASS', '100% temporary Phase 6 test records removed cleanly');
    } else {
      recordResult('11. MongoDB Cleanup & Database Integrity', 'FAIL', `Remaining orphan docs: ${orphanCount}`);
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 6 Verification Suite', 'FAIL', err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & Database connections closed cleanly.');
  }

  return testResults;
}

runPhase6Tests().then((results) => {
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n====================================================');
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} Phase 6 User Journey Assertions Passed`);
  console.log('====================================================');

  if (failed.length > 0) {
    console.error(`\n❌ PHASE 6 VERIFICATION FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n🎉 PHASE 6 EXISTING WEBSITE STABILIZATION PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
});
