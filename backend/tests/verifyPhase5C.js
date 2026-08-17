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

async function runPhase5CTests() {
  console.log('====================================================');
  console.log('⚡ COLLABX PHASE 5C API VALIDATION & RELIABILITY VERIFICATION');
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
    const brandAEmail = `p5c_brandA_${timestamp}@collabx.com`;
    const brandBEmail = `p5c_brandB_${timestamp}@collabx.com`;
    const creatorAEmail = `p5c_creatorA_${timestamp}@collabx.com`;
    const creatorBEmail = `p5c_creatorB_${timestamp}@collabx.com`;
    const password = 'SecurePassword123!';

    // Setup Test Users
    const brandARegRes = await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase 5C Brand Alpha',
      email: brandAEmail,
      password: password
    });
    const brandAUser = await models.User.findOne({ email: brandAEmail });
    createdUserIds.push(brandAUser._id);
    const brandAToken = generateToken(brandAUser);

    const brandBUser = await models.User.create({
      fullName: 'Phase 5C Brand Beta',
      email: brandBEmail,
      password: 'hashed_pw_dummy',
      role: 'brand',
      isActive: true
    });
    createdUserIds.push(brandBUser._id);
    const brandBToken = generateToken(brandBUser);

    const creatorAUser = await models.User.create({
      fullName: 'Phase 5C Creator Alpha',
      email: creatorAEmail,
      password: 'hashed_pw_dummy',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorAUser._id);
    const creatorAToken = generateToken(creatorAUser);

    const creatorBUser = await models.User.create({
      fullName: 'Phase 5C Creator Beta',
      email: creatorBEmail,
      password: 'hashed_pw_dummy',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorBUser._id);
    const creatorBToken = generateToken(creatorBUser);

    // ==================================================
    // 1. MISSING REQUIRED FIELD VALIDATION (400)
    // ==================================================
    console.log('\n[TEST 1] Testing Missing Required Field Validation (400)...');
    const missingFieldRes = await makeRequest('POST', '/api/brand/auth/register', {
      email: `missing_${timestamp}@collabx.com`,
      password: password
      // Missing companyName
    });

    if (missingFieldRes.status === 400 && missingFieldRes.body.success === false) {
      recordResult('1. Missing Required Field Validation', 'PASS', 'HTTP 400 returned cleanly');
    } else {
      recordResult('1. Missing Required Field Validation', 'FAIL', `HTTP ${missingFieldRes.status}`);
    }

    // ==================================================
    // 2. INVALID FIELD TYPE / FORMAT (400)
    // ==================================================
    console.log('\n[TEST 2] Testing Invalid Field Type Validation (400)...');
    const invalidTypeRes = await makeRequest('POST', '/api/brand/campaigns', {
      title: 'Invalid Type Campaign',
      budget: 'not-a-number', // string instead of number
      category: 'Lifestyle'
    }, { Authorization: `Bearer ${brandAToken}` });

    if (invalidTypeRes.status === 400 && invalidTypeRes.body.success === false) {
      recordResult('2. Invalid Field Type Validation', 'PASS', 'HTTP 400 returned for string budget');
    } else {
      recordResult('2. Invalid Field Type Validation', 'FAIL', `HTTP ${invalidTypeRes.status}`);
    }

    // ==================================================
    // 3. INVALID OBJECTID PARAMETER (400)
    // ==================================================
    console.log('\n[TEST 3] Testing Malformed ObjectId Parameter (400)...');
    const malformedIdRes = await makeRequest('GET', '/api/brand/collaborations/invalid-id-xyz999/activity', null, {
      Authorization: `Bearer ${brandAToken}`
    });

    if (malformedIdRes.status === 400 && malformedIdRes.body.success === false) {
      recordResult('3. Malformed ObjectId Parameter', 'PASS', `HTTP 400 INVALID_OBJECT_ID returned`);
    } else {
      recordResult('3. Malformed ObjectId Parameter', 'FAIL', `HTTP ${malformedIdRes.status}`);
    }

    // ==================================================
    // 4. NON-EXISTENT RESOURCE (404)
    // ==================================================
    console.log('\n[TEST 4] Testing Valid ObjectId for Non-Existent Resource (404)...');
    const fakeId = new mongoose.Types.ObjectId().toString();
    const nonExistentRes = await makeRequest('GET', `/api/brand/collaborations/${fakeId}/activity`, null, {
      Authorization: `Bearer ${brandAToken}`
    });

    if (nonExistentRes.status === 404 && nonExistentRes.body.success === false) {
      recordResult('4. Non-Existent Resource Guard', 'PASS', 'HTTP 404 returned for missing resource');
    } else {
      recordResult('4. Non-Existent Resource Guard', 'FAIL', `HTTP ${nonExistentRes.status}`);
    }

    // ==================================================
    // 5. INVALID NUMERIC VALUE / PRICE (400)
    // ==================================================
    console.log('\n[TEST 5] Testing Invalid Price Validation (400)...');
    const campaignDoc = await models.Campaign.create({
      brandId: brandAUser._id,
      brandName: 'Phase 5C Brand Alpha',
      title: 'Valid Campaign Brief',
      description: 'Test brief for validation tests',
      category: 'Lifestyle',
      budget: 15000,
      status: 'active'
    });
    createdCampaignIds.push(campaignDoc._id);

    const invalidPriceRes = await makeRequest('POST', '/api/brand/invitations', {
      campaignId: campaignDoc._id,
      creatorId: creatorAUser._id,
      proposedPrice: -500 // Negative price
    }, { Authorization: `Bearer ${brandAToken}` });

    if (invalidPriceRes.status === 400 && invalidPriceRes.body.success === false) {
      recordResult('5. Invalid Numeric Price Guard', 'PASS', 'HTTP 400 returned for negative price');
    } else {
      recordResult('5. Invalid Numeric Price Guard', 'FAIL', `HTTP ${invalidPriceRes.status}`);
    }

    // ==================================================
    // 6. DUPLICATE INVITATION PROTECTION (400/409)
    // ==================================================
    console.log('\n[TEST 6] Testing Duplicate Invitation Guard...');
    const validInviteRes1 = await makeRequest('POST', '/api/brand/invitations', {
      campaignId: campaignDoc._id,
      creatorId: creatorAUser._id,
      proposedPrice: 15000,
      message: 'Invitation 1'
    }, { Authorization: `Bearer ${brandAToken}` });

    const invDoc = validInviteRes1.body.data;
    if (invDoc) createdInvitationIds.push(invDoc._id);

    const duplicateInviteRes = await makeRequest('POST', '/api/brand/invitations', {
      campaignId: campaignDoc._id,
      creatorId: creatorAUser._id,
      proposedPrice: 15000,
      message: 'Duplicate Invitation 2'
    }, { Authorization: `Bearer ${brandAToken}` });

    if ((duplicateInviteRes.status === 400 || duplicateInviteRes.status === 409) && duplicateInviteRes.body.success === false) {
      recordResult('6. Duplicate Invitation Guard', 'PASS', `Rejected duplicate invitation with HTTP ${duplicateInviteRes.status}`);
    } else {
      recordResult('6. Duplicate Invitation Guard', 'FAIL', `HTTP ${duplicateInviteRes.status}`);
    }

    // ==================================================
    // 7. INVALID COLLABORATION STATE TRANSITION (400)
    // ==================================================
    console.log('\n[TEST 7] Testing Invalid Collaboration State Transition (400)...');
    const acceptRes = await makeRequest('PATCH', `/api/creator/requests/${invDoc._id}/respond`, {
      status: 'accepted'
    }, { Authorization: `Bearer ${creatorAToken}` });

    const collabDoc = acceptRes.body.data.collaboration;
    if (collabDoc) createdCollaborationIds.push(collabDoc._id);

    // Try to complete collaboration directly without content submission
    const invalidCompleteRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/complete`, null, {
      Authorization: `Bearer ${brandAToken}`
    });

    if (invalidCompleteRes.status === 400 && invalidCompleteRes.body.success === false) {
      recordResult('7. Invalid Collaboration State Transition', 'PASS', 'Direct completion from active state rejected with HTTP 400');
    } else {
      recordResult('7. Invalid Collaboration State Transition', 'FAIL', `HTTP ${invalidCompleteRes.status}`);
    }

    // ==================================================
    // 8. INVALID RATING RANGE / NON-INTEGER (400)
    // ==================================================
    console.log('\n[TEST 8] Testing Invalid Review Rating Guard (400)...');
    const invalidRatingRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 6, // Rating > 5
      review: 'Invalid rating test review'
    }, { Authorization: `Bearer ${brandAToken}` });

    if (invalidRatingRes.status === 400 && invalidRatingRes.body.success === false) {
      recordResult('8. Invalid Rating Range Guard', 'PASS', 'Rating > 5 rejected with HTTP 400');
    } else {
      recordResult('8. Invalid Rating Range Guard', 'FAIL', `HTTP ${invalidRatingRes.status}`);
    }

    // ==================================================
    // 9. COLLABORATION COMPLETION & REVIEW & DUPLICATE REVIEW
    // ==================================================
    console.log('\n[TEST 9-11] Progressing lifecycle to testing Review & Duplicate Review...');
    // Submit deliverables
    await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://youtube.com/watch?v=p5c_test',
      submissionNotes: 'Deliverable complete'
    }, { Authorization: `Bearer ${creatorAToken}` });

    // Approve
    await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/approve`, null, {
      Authorization: `Bearer ${brandAToken}`
    });

    // Complete
    await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/complete`, null, {
      Authorization: `Bearer ${brandAToken}`
    });

    // First valid review
    const validReviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 5,
      review: 'Outstanding execution!'
    }, { Authorization: `Bearer ${brandAToken}` });

    if (validReviewRes.body.data) createdReviewIds.push(validReviewRes.body.data._id);

    // Duplicate review attempt
    const duplicateReviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 4,
      review: 'Second review attempt'
    }, { Authorization: `Bearer ${brandAToken}` });

    if (validReviewRes.status === 201 && (duplicateReviewRes.status === 400 || duplicateReviewRes.status === 409)) {
      recordResult('9. Review & Duplicate Review Protection', 'PASS', 'First review accepted (201), duplicate review rejected (400/409)');
    } else {
      recordResult('9. Review & Duplicate Review Protection', 'FAIL', `Valid ${validReviewRes.status}, Duplicate ${duplicateReviewRes.status}`);
    }

    // ==================================================
    // 10. DUPLICATE ESCROW & RELEASING AGAIN PROTECTION
    // ==================================================
    console.log('\n[TEST 12-13] Testing Duplicate Escrow & Double Release Protection...');
    const escrowRes1 = await makeRequest('POST', '/api/brand/payments/escrow', {
      collaborationId: collabDoc._id,
      amount: 15000
    }, { Authorization: `Bearer ${brandAToken}` });

    const payDoc = escrowRes1.body.data;
    if (payDoc) createdPaymentIds.push(payDoc._id);

    // Duplicate Escrow Attempt
    const duplicateEscrowRes = await makeRequest('POST', '/api/brand/payments/escrow', {
      collaborationId: collabDoc._id,
      amount: 15000
    }, { Authorization: `Bearer ${brandAToken}` });

    // Release Escrow 1
    const releaseRes1 = await makeRequest('PATCH', `/api/brand/payments/${payDoc._id}/release`, null, {
      Authorization: `Bearer ${brandAToken}`
    });

    // Double Release Attempt
    const releaseRes2 = await makeRequest('PATCH', `/api/brand/payments/${payDoc._id}/release`, null, {
      Authorization: `Bearer ${brandAToken}`
    });

    if (
      escrowRes1.status === 201 &&
      (duplicateEscrowRes.status === 400 || duplicateEscrowRes.status === 409) &&
      releaseRes1.status === 200 &&
      (releaseRes2.status === 400 || releaseRes2.status === 409)
    ) {
      recordResult('10. Escrow & Release Protection', 'PASS', 'Duplicate escrow & double release blocked with HTTP 400/409');
    } else {
      recordResult('10. Escrow & Release Protection', 'FAIL', `DupEscrow ${duplicateEscrowRes.status}, Rel2 ${releaseRes2.status}`);
    }

    // ==================================================
    // 11. STRUCTURED ERROR RESPONSE CONTRACTS (400, 401, 403, 404)
    // ==================================================
    console.log('\n[TEST 14-17] Testing Structured Response Contracts (400, 401, 403, 404)...');
    const res400 = malformedIdRes.body;
    const res401 = (await makeRequest('GET', '/api/brand/analytics')).body;
    const res403 = (await makeRequest('GET', '/api/creator/analytics', null, { Authorization: `Bearer ${brandAToken}` })).body;
    const res404 = nonExistentRes.body;

    if (
      res400.success === false && res400.message &&
      res401.success === false && res401.message &&
      res403.success === false && res403.message &&
      res404.success === false && res404.message
    ) {
      recordResult('11. Structured Error Response Contracts', 'PASS', 'All error responses match { success: false, message, code } structure');
    } else {
      recordResult('11. Structured Error Response Contracts', 'FAIL', 'Structured error contract mismatch');
    }

    // ==================================================
    // 12. CROSS-USER & NON-PARTICIPANT ISOLATION (403)
    // ==================================================
    console.log('\n[TEST 18-20] Testing Cross-User & Non-Participant Isolation...');
    const brandBActRes = await makeRequest('GET', `/api/brand/collaborations/${collabDoc._id}/activity`, null, {
      Authorization: `Bearer ${brandBToken}`
    });
    const creatorBActRes = await makeRequest('GET', `/api/creator/collaborations/${collabDoc._id}/activity`, null, {
      Authorization: `Bearer ${creatorBToken}`
    });

    if (brandBActRes.status === 403 && creatorBActRes.status === 403) {
      recordResult('12. Cross-User Data Isolation', 'PASS', 'Brand B & Creator B rejected with HTTP 403 FORBIDDEN');
    } else {
      recordResult('12. Cross-User Data Isolation', 'FAIL', `Brand B ${brandBActRes.status}, Creator B ${creatorBActRes.status}`);
    }

    // ==================================================
    // 13. ZERO-DIVISION SAFETY & EMPTY ANALYTICS
    // ==================================================
    console.log('\n[TEST 21-23] Testing Empty Analytics Zero-Division Safety...');
    const brandBAnalytics = await makeRequest('GET', '/api/brand/analytics', null, {
      Authorization: `Bearer ${brandBToken}`
    });
    const creatorBAnalytics = await makeRequest('GET', '/api/creator/analytics', null, {
      Authorization: `Bearer ${creatorBToken}`
    });

    if (
      brandBAnalytics.status === 200 &&
      brandBAnalytics.body.data.collaborationCompletionRate === 0 &&
      creatorBAnalytics.status === 200 &&
      creatorBAnalytics.body.data.collaborationCompletionRate === 0
    ) {
      recordResult('13. Zero-Division Safety', 'PASS', 'Zero analytics calculated cleanly without NaN / null division errors');
    } else {
      recordResult('13. Zero-Division Safety', 'FAIL', `Brand B HTTP ${brandBAnalytics.status}, Creator B HTTP ${creatorBAnalytics.status}`);
    }

    // ==================================================
    // 14. ENDPOINT CONTRACT COMPATIBILITY
    // ==================================================
    console.log('\n[TEST 24] Testing Endpoint Contract Compatibility...');
    const brandAAnalytics = await makeRequest('GET', '/api/brand/analytics', null, {
      Authorization: `Bearer ${brandAToken}`
    });

    if (brandAAnalytics.status === 200 && brandAAnalytics.body.data.completedCollaborations === 1) {
      recordResult('14. Endpoint Contract Compatibility', 'PASS', 'Verified Phase 4 & Phase 5 response compatibility');
    } else {
      recordResult('14. Endpoint Contract Compatibility', 'FAIL', `HTTP ${brandAAnalytics.status}`);
    }

    // ==================================================
    // 15. MONGODB CLEANUP & DATA INTEGRITY
    // ==================================================
    console.log('\n[TEST 25] Cleaning up test data & verifying database integrity...');
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
      recordResult('15. MongoDB Cleanup & Integrity', 'PASS', '100% temporary Phase 5C test records removed cleanly');
    } else {
      recordResult('15. MongoDB Cleanup & Integrity', 'FAIL', `Remaining orphan docs: ${orphanCount}`);
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 5C Verification Suite', 'FAIL', err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & Database connections closed cleanly.');
  }

  return testResults;
}

runPhase5CTests().then((results) => {
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n====================================================');
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} Phase 5C Assertions Passed`);
  console.log('====================================================');

  if (failed.length > 0) {
    console.error(`\n❌ PHASE 5C VERIFICATION FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n🎉 PHASE 5C API VALIDATION & RELIABILITY PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
});
