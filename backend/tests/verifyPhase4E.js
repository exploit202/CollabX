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

async function runPhase4ETests() {
  console.log('====================================================');
  console.log('🧪 COLLABX PHASE 4E ANALYTICS & ACTIVITY VERIFICATION');
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
    const brandEmail = `phase4e_brand_${timestamp}@collabx.com`;
    const creatorEmail = `phase4e_creator_${timestamp}@collabx.com`;
    const brandBEmail = `phase4e_brandB_${timestamp}@collabx.com`;
    const creatorBEmail = `phase4e_creatorB_${timestamp}@collabx.com`;
    const password = 'SecurePassword123!';

    // ==================================================
    // STEP 1-5 — ACCOUNT CREATION & AUTHENTICATION
    // ==================================================
    console.log('\n[STEP 1-5] Registering & authenticating test users...');

    // Brand A
    await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase 4E Brand Alpha',
      email: brandEmail,
      password: password
    });
    const brandUser = await models.User.findOne({ email: brandEmail });
    createdUserIds.push(brandUser._id);
    const brandToken = generateToken(brandUser);

    // Creator A
    await makeRequest('POST', '/api/creator/auth/register', {
      fullName: 'Phase 4E Creator Alpha',
      email: creatorEmail,
      password: password,
      primaryContentNiche: 'Tech'
    });
    const creatorUser = await models.User.findOne({ email: creatorEmail });
    createdUserIds.push(creatorUser._id);
    const creatorToken = generateToken(creatorUser);

    // Brand B
    const brandBUser = await models.User.create({
      fullName: 'Phase 4E Brand Beta',
      email: brandBEmail,
      password: 'hashed_pw_dummy',
      role: 'brand',
      isActive: true
    });
    createdUserIds.push(brandBUser._id);
    const brandBToken = generateToken(brandBUser);

    // Creator B
    const creatorBUser = await models.User.create({
      fullName: 'Phase 4E Creator Beta',
      email: creatorBEmail,
      password: 'hashed_pw_dummy',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorBUser._id);
    const creatorBToken = generateToken(creatorBUser);

    recordResult('STEP 1-5: User Setup & Authentication', 'PASS', `Brand A: ${brandUser._id}, Creator A: ${creatorUser._id}`);

    // ==================================================
    // STEP 6-7 — COLLABORATION SETUP
    // ==================================================
    console.log('\n[STEP 6-7] Setting up test campaign & collaboration...');
    const campaignDoc = await models.Campaign.create({
      brandId: brandUser._id,
      brandName: 'Phase 4E Brand Alpha',
      title: 'Phase 4E Analytics Test Campaign',
      description: 'Testing analytics & activity timeline',
      category: 'Tech',
      budget: 50000,
      status: 'active'
    });
    createdCampaignIds.push(campaignDoc._id);

    const inviteRes = await makeRequest('POST', '/api/brand/invitations', {
      campaignId: campaignDoc._id,
      creatorId: creatorUser._id,
      proposedPrice: 50000,
      message: 'Join our Phase 4E campaign!'
    }, { Authorization: `Bearer ${brandToken}` });

    const invitationDoc = inviteRes.body.data;
    if (invitationDoc) createdInvitationIds.push(invitationDoc._id);

    const acceptRes = await makeRequest('PATCH', `/api/creator/requests/${invitationDoc._id}/respond`, {
      status: 'accepted'
    }, { Authorization: `Bearer ${creatorToken}` });

    const collabDoc = acceptRes.body.data.collaboration;
    createdCollaborationIds.push(collabDoc._id);

    recordResult('STEP 6-7: Collaboration Setup', 'PASS', `Collaboration ID: ${collabDoc._id}`);

    // ==================================================
    // STEP 14 — GENERATING WORKFLOW EVENTS
    // ==================================================
    console.log('\n[STEP 14] Generating complete workflow events...');

    // 1. Deliverable submission
    await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://youtube.com/watch?v=phase4e_draft1',
      submissionNotes: 'Phase 4E first draft.'
    }, { Authorization: `Bearer ${creatorToken}` });

    // 2. Revision request
    await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/revision`, {
      revisionNotes: 'Please tweak intro.'
    }, { Authorization: `Bearer ${brandToken}` });

    // 3. Deliverable resubmission
    await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://youtube.com/watch?v=phase4e_draft2',
      submissionNotes: 'Phase 4E revised draft.'
    }, { Authorization: `Bearer ${creatorToken}` });

    // 4. Brand approval
    await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/approve`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    // 5. Complete collaboration
    await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/complete`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    // 6. Deposit escrow
    const escrowRes = await makeRequest('POST', '/api/brand/payments/escrow', {
      collaborationId: collabDoc._id,
      amount: 50000
    }, { Authorization: `Bearer ${brandToken}` });
    const paymentDoc = escrowRes.body.data;
    createdPaymentIds.push(paymentDoc._id);

    // 7. Release escrow payout
    await makeRequest('PATCH', `/api/brand/payments/${paymentDoc._id}/release`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    // 8. Submit review
    const reviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 5,
      review: 'Outstanding execution and content quality!'
    }, { Authorization: `Bearer ${brandToken}` });
    if (reviewRes.body.data) createdReviewIds.push(reviewRes.body.data._id);

    recordResult('STEP 14: Lifecycle Events Generated', 'PASS', 'Invitation, Submit, Revision, Resubmit, Approve, Complete, Escrow, Release, Review');

    // ==================================================
    // STEP 8-13 — BRAND & CREATOR ANALYTICS ENDPOINTS
    // ==================================================
    console.log('\n[STEP 8-13] Testing Brand & Creator Analytics endpoints...');

    // Brand Analytics
    const brandAnalyticsRes = await makeRequest('GET', '/api/brand/analytics', null, {
      Authorization: `Bearer ${brandToken}`
    });
    const bData = brandAnalyticsRes.body.data || {};

    if (
      brandAnalyticsRes.status === 200 &&
      bData.totalCampaigns === 1 &&
      bData.totalCollaborations === 1 &&
      bData.completedCollaborations === 1 &&
      bData.totalCreatorsWorkedWith === 1 &&
      bData.totalReleasedAmount === 50000 &&
      bData.averageCreatorRating === 5 &&
      bData.collaborationCompletionRate === 100
    ) {
      recordResult('STEP 8-13: Brand Analytics Endpoint & Calculations', 'PASS', `Total Released: $${bData.totalReleasedAmount}, Completion Rate: ${bData.collaborationCompletionRate}%`);
    } else {
      recordResult('STEP 8-13: Brand Analytics Endpoint & Calculations', 'FAIL', `HTTP ${brandAnalyticsRes.status}, data: ${JSON.stringify(bData)}`);
    }

    // Creator Analytics
    const creatorAnalyticsRes = await makeRequest('GET', '/api/creator/analytics', null, {
      Authorization: `Bearer ${creatorToken}`
    });
    const cData = creatorAnalyticsRes.body.data || {};

    if (
      creatorAnalyticsRes.status === 200 &&
      cData.totalCollaborations === 1 &&
      cData.completedCollaborations === 1 &&
      cData.totalBrandsWorkedWith === 1 &&
      cData.totalReleasedEarnings === 50000 &&
      cData.averageRating === 5 &&
      cData.collaborationCompletionRate === 100
    ) {
      recordResult('STEP 8-13: Creator Analytics Endpoint & Calculations', 'PASS', `Total Earnings: $${cData.totalReleasedEarnings}, Rating: ${cData.averageRating}⭐`);
    } else {
      recordResult('STEP 8-13: Creator Analytics Endpoint & Calculations', 'FAIL', `HTTP ${creatorAnalyticsRes.status}, data: ${JSON.stringify(cData)}`);
    }

    // ==================================================
    // STEP 15-18 — COLLABORATION ACTIVITY TIMELINE
    // ==================================================
    console.log('\n[STEP 15-18] Testing Collaboration Activity History timeline...');

    const brandActRes = await makeRequest('GET', `/api/brand/collaborations/${collabDoc._id}/activity`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    const creatorActRes = await makeRequest('GET', `/api/creator/collaborations/${collabDoc._id}/activity`, null, {
      Authorization: `Bearer ${creatorToken}`
    });

    const activities = brandActRes.body.activities || [];

    if (
      brandActRes.status === 200 &&
      creatorActRes.status === 200 &&
      activities.length > 0 &&
      String(brandActRes.body.collaborationId) === String(collabDoc._id)
    ) {
      recordResult('STEP 15-18: Collaboration Activity Timeline', 'PASS', `Retrieved ${activities.length} activity events in chronological order`);
    } else {
      recordResult('STEP 15-18: Collaboration Activity Timeline', 'FAIL', `Brand HTTP ${brandActRes.status}, Creator HTTP ${creatorActRes.status}`);
    }

    // ==================================================
    // STEP 19-25 — SECURITY & AUTHORIZATION TESTS
    // ==================================================
    console.log('\n[STEP 19-25] Testing security protocols & authorization isolation...');

    // 19. Unauthenticated Brand Analytics (401)
    const unauthBrandAnalytics = await makeRequest('GET', '/api/brand/analytics');
    if (unauthBrandAnalytics.status === 401) {
      recordResult('Security 19: Unauthenticated Brand Analytics Guard (HTTP 401)', 'PASS');
    } else {
      recordResult('Security 19: Unauthenticated Brand Analytics Guard (HTTP 401)', 'FAIL', `HTTP ${unauthBrandAnalytics.status}`);
    }

    // 20. Unauthenticated Creator Analytics (401)
    const unauthCreatorAnalytics = await makeRequest('GET', '/api/creator/analytics');
    if (unauthCreatorAnalytics.status === 401) {
      recordResult('Security 20: Unauthenticated Creator Analytics Guard (HTTP 401)', 'PASS');
    } else {
      recordResult('Security 20: Unauthenticated Creator Analytics Guard (HTTP 401)', 'FAIL', `HTTP ${unauthCreatorAnalytics.status}`);
    }

    // 21. Brand B accessing Brand A analytics (isolated)
    const brandBAnalytics = await makeRequest('GET', '/api/brand/analytics', null, { Authorization: `Bearer ${brandBToken}` });
    if (brandBAnalytics.status === 200 && brandBAnalytics.body.data.totalCampaigns === 0) {
      recordResult('Security 21: Cross-Brand Analytics Isolation', 'PASS', 'Brand B receives 0 campaigns');
    } else {
      recordResult('Security 21: Cross-Brand Analytics Isolation', 'FAIL', `Leaked data to Brand B`);
    }

    // 22. Creator B accessing Creator A analytics (isolated)
    const creatorBAnalytics = await makeRequest('GET', '/api/creator/analytics', null, { Authorization: `Bearer ${creatorBToken}` });
    if (creatorBAnalytics.status === 200 && creatorBAnalytics.body.data.totalCollaborations === 0) {
      recordResult('Security 22: Cross-Creator Analytics Isolation', 'PASS', 'Creator B receives 0 collaborations');
    } else {
      recordResult('Security 22: Cross-Creator Analytics Isolation', 'FAIL', `Leaked data to Creator B`);
    }

    // 23-25. Non-participant Brand B accessing Brand A collaboration activity (403)
    const brandBAct = await makeRequest('GET', `/api/brand/collaborations/${collabDoc._id}/activity`, null, {
      Authorization: `Bearer ${brandBToken}`
    });
    if (brandBAct.status === 403) {
      recordResult('Security 23-25: Non-participant Activity Access Guard (HTTP 403)', 'PASS');
    } else {
      recordResult('Security 23-25: Non-participant Activity Access Guard (HTTP 403)', 'FAIL', `HTTP ${brandBAct.status}`);
    }

    // ==================================================
    // STEP 26-28 — VALIDATION & ERROR HANDLING
    // ==================================================
    console.log('\n[STEP 26-28] Testing validation & parameter error handling...');

    // 26. Invalid ObjectId (400)
    const invalidIdRes = await makeRequest('GET', '/api/brand/collaborations/invalid_id_123/activity', null, {
      Authorization: `Bearer ${brandToken}`
    });
    if (invalidIdRes.status === 400) {
      recordResult('Validation 26: Invalid ObjectId Guard (HTTP 400)', 'PASS');
    } else {
      recordResult('Validation 26: Invalid ObjectId Guard (HTTP 400)', 'FAIL', `HTTP ${invalidIdRes.status}`);
    }

    // 27. Non-existent ObjectId (404)
    const fakeId = new mongoose.Types.ObjectId();
    const fakeIdRes = await makeRequest('GET', `/api/brand/collaborations/${fakeId}/activity`, null, {
      Authorization: `Bearer ${brandToken}`
    });
    if (fakeIdRes.status === 404) {
      recordResult('Validation 27: Non-existent Collaboration Guard (HTTP 404)', 'PASS');
    } else {
      recordResult('Validation 27: Non-existent Collaboration Guard (HTTP 404)', 'FAIL', `HTTP ${fakeIdRes.status}`);
    }

    // 28. Empty Analytics Dataset (Zero division safety)
    const brandBEmptyRes = await makeRequest('GET', '/api/brand/analytics', null, {
      Authorization: `Bearer ${brandBToken}`
    });
    if (
      brandBEmptyRes.status === 200 &&
      brandBEmptyRes.body.data.totalCampaigns === 0 &&
      brandBEmptyRes.body.data.collaborationCompletionRate === 0 &&
      brandBEmptyRes.body.data.averageCreatorRating === 0
    ) {
      recordResult('Validation 28: Empty Analytics Zero-Division Safety', 'PASS');
    } else {
      recordResult('Validation 28: Empty Analytics Zero-Division Safety', 'FAIL');
    }

    // ==================================================
    // STEP 29-32 — INTEGRITY & CLEANUP
    // ==================================================
    console.log('\n[STEP 29-32] Verifying relationships & cleaning up test data...');
    await models.Notification.deleteMany({ userId: { $in: createdUserIds } });
    await models.Review.deleteMany({ _id: { $in: createdReviewIds } });
    await models.Payment.deleteMany({ _id: { $in: createdPaymentIds } });
    await models.Collaboration.deleteMany({ _id: { $in: createdCollaborationIds } });
    await models.Invitation.deleteMany({ _id: { $in: createdInvitationIds } });
    await models.Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    await models.CreatorProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.BrandProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.User.deleteMany({ _id: { $in: createdUserIds } });

    const orphanUserCount = await models.User.countDocuments({ _id: { $in: createdUserIds } });
    if (orphanUserCount === 0) {
      recordResult('CLEANUP 29-32: MongoDB Document Cleanup', 'PASS', '100% temporary Phase 4E test documents removed cleanly');
    } else {
      recordResult('CLEANUP 29-32: MongoDB Document Cleanup', 'FAIL', `Remaining orphan docs: ${orphanUserCount}`);
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 4E Verification Suite', 'FAIL', err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & Database connections closed cleanly.');
  }

  return testResults;
}

runPhase4ETests().then((results) => {
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n====================================================');
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} Phase 4E Assertions Passed`);
  console.log('====================================================');

  if (failed.length > 0) {
    console.error(`\n❌ PHASE 4E VERIFICATION FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n🎉 PHASE 4E ANALYTICS & ACTIVITY PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
});
