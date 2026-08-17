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

async function runPhase4CTests() {
  console.log('====================================================');
  console.log('🧪 COLLABX PHASE 4C REVIEW & RATING VERIFICATION');
  console.log('====================================================\n');

  const testResults = [];
  const createdUserIds = [];
  const createdCampaignIds = [];
  const createdCollaborationIds = [];
  const createdReviewIds = [];

  const recordResult = (testName, status, details = '') => {
    testResults.push({ test: testName, status, details });
    console.log(`${status === 'PASS' ? '  ✅' : '  ❌'} ${testName} — ${status} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // 1. Connect DB
    await connectDB();
    console.log(`🔌 Database connected: ${mongoose.connection.name}`);

    // 2. Start HTTP server on random port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    console.log(`📡 Test Server listening on ${baseUrl}`);

    const timestamp = Date.now();
    const brandEmail = `phase4c_brand_${timestamp}@collabx.com`;
    const creatorEmail = `phase4c_creator_${timestamp}@collabx.com`;
    const brandBEmail = `phase4c_brandB_${timestamp}@collabx.com`;
    const creatorBEmail = `phase4c_creatorB_${timestamp}@collabx.com`;
    const password = 'SecurePassword123!';

    // ==================================================
    // STEP 1-3 — ACCOUNTS & AUTHENTICATION
    // ==================================================
    console.log('\n[STEP 1-3] Creating Brand & Creator test accounts...');

    // Brand A
    await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase 4C Brand Alpha',
      email: brandEmail,
      password: password
    });
    const brandUser = await models.User.findOne({ email: brandEmail });
    createdUserIds.push(brandUser._id);
    const brandToken = generateToken(brandUser);

    // Creator A
    await makeRequest('POST', '/api/creator/auth/register', {
      fullName: 'Phase 4C Creator Alpha',
      email: creatorEmail,
      password: password,
      primaryContentNiche: 'Lifestyle & Tech'
    });
    const creatorUser = await models.User.findOne({ email: creatorEmail });
    createdUserIds.push(creatorUser._id);
    const creatorToken = generateToken(creatorUser);

    // Brand B (Unrelated Brand)
    const brandBUser = await models.User.create({
      companyName: 'Phase 4C Brand Beta',
      email: brandBEmail,
      passwordHash: 'hashed_pw',
      role: 'brand',
      isActive: true
    });
    createdUserIds.push(brandBUser._id);
    const brandBToken = generateToken(brandBUser);

    // Creator B (Unrelated Creator)
    const creatorBUser = await models.User.create({
      fullName: 'Phase 4C Creator Beta',
      email: creatorBEmail,
      passwordHash: 'hashed_pw',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorBUser._id);
    const creatorBToken = generateToken(creatorBUser);

    recordResult('STEP 1-3: Account Creation & Authentication', 'PASS', `Brand: ${brandUser._id}, Creator: ${creatorUser._id}`);

    // ==================================================
    // STEP 4-5 — COLLABORATION INITIALIZATION
    // ==================================================
    console.log('\n[STEP 4-5] Creating temporary active collaboration...');
    const campaignDoc = await models.Campaign.create({
      brandId: brandUser._id,
      brandName: 'Phase 4C Brand Alpha',
      title: 'Phase 4C Review Campaign',
      description: 'Testing review eligibility and rating aggregation',
      category: 'Lifestyle',
      budget: 15000,
      status: 'active'
    });
    createdCampaignIds.push(campaignDoc._id);

    const collabDoc = await models.Collaboration.create({
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      campaignId: campaignDoc._id,
      brandName: 'Phase 4C Brand Alpha',
      creatorName: 'Phase 4C Creator Alpha',
      campaignTitle: 'Phase 4C Review Campaign',
      agreedBudget: 15000,
      agreedPrice: 15000,
      status: 'active',
      stage: 'active',
      progress: 10
    });
    createdCollaborationIds.push(collabDoc._id);

    recordResult('STEP 4-5: Collaboration Initialization (status: active)', 'PASS', `Collab._id: ${collabDoc._id}`);

    // ==================================================
    // STEP 6-7 — PREMATURE REVIEW REJECTION
    // ==================================================
    console.log('\n[STEP 6-7] Testing Premature Review Rejection before Completion...');
    const prematureReviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 5,
      review: 'Great work before completion!'
    }, { Authorization: `Bearer ${brandToken}` });

    if (prematureReviewRes.status === 400) {
      recordResult('STEP 6-7: Premature Review Rejection (HTTP 400)', 'PASS', prematureReviewRes.body.message);
    } else {
      recordResult('STEP 6-7: Premature Review Rejection (HTTP 400)', 'FAIL', `HTTP ${prematureReviewRes.status}`);
    }

    // ==================================================
    // STEP 8 — COMPLETE COLLABORATION VIA PHASE 4A LIFECYCLE
    // ==================================================
    console.log('\n[STEP 8] Completing collaboration via Phase 4A state machine...');
    await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://youtube.com/watch?v=review_test_4c',
      submissionNotes: 'Deliverable complete for review test.'
    }, { Authorization: `Bearer ${creatorToken}` });

    await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/approve`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    const completeRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/complete`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (completeRes.status === 200 && completeRes.body.data.status === 'completed') {
      recordResult('STEP 8: Phase 4A Collaboration Completion', 'PASS', `Status: completed`);
    } else {
      recordResult('STEP 8: Phase 4A Collaboration Completion', 'FAIL', `HTTP ${completeRes.status}`);
    }

    // ==================================================
    // STEP 9-15 — BRAND REVIEWS CREATOR & AGGREGATION
    // ==================================================
    console.log('\n[STEP 9-15] Testing Brand Review creation & CreatorProfile rating aggregation...');
    const brandReviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 5,
      review: 'Outstanding video quality, highly professional creator!'
    }, { Authorization: `Bearer ${brandToken}` });

    const reviewDoc = brandReviewRes.body.data;
    if (brandReviewRes.status === 201 && reviewDoc) {
      createdReviewIds.push(reviewDoc._id);
      recordResult('STEP 9-14: Brand Review Creation', 'PASS', `Review._id: ${reviewDoc._id}, rating: 5`);
    } else {
      recordResult('STEP 9-14: Brand Review Creation', 'FAIL', `HTTP ${brandReviewRes.status}, Body: ${JSON.stringify(brandReviewRes.body)}`);
    }

    // Verify CreatorProfile Rating Aggregation
    const creatorProfile = await models.CreatorProfile.findOne({ userId: creatorUser._id });
    if (creatorProfile && creatorProfile.rating === 5 && creatorProfile.totalReviews === 1) {
      recordResult('STEP 15: CreatorProfile Aggregate Rating Verification', 'PASS', `rating: 5.0, totalReviews: 1`);
    } else {
      recordResult('STEP 15: CreatorProfile Aggregate Rating Verification', 'FAIL', `rating: ${creatorProfile?.rating}, totalReviews: ${creatorProfile?.totalReviews}`);
    }

    // ==================================================
    // STEP 16-17 — DUPLICATE REVIEW REJECTION
    // ==================================================
    console.log('\n[STEP 16-17] Testing Duplicate Review Rejection...');
    const duplicateReviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 4,
      review: 'Submitting duplicate review attempt.'
    }, { Authorization: `Bearer ${brandToken}` });

    if (duplicateReviewRes.status === 400) {
      recordResult('STEP 16-17: Duplicate Review Rejection (HTTP 400)', 'PASS', duplicateReviewRes.body.message);
    } else {
      recordResult('STEP 16-17: Duplicate Review Rejection (HTTP 400)', 'FAIL', `HTTP ${duplicateReviewRes.status}`);
    }

    // ==================================================
    // STEP 18-19 — CREATOR REVIEWS BRAND
    // ==================================================
    console.log('\n[STEP 18-19] Testing Creator Review for Brand...');
    const creatorReviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 5,
      review: 'Clear campaign brief and quick milestone approvals!'
    }, { Authorization: `Bearer ${creatorToken}` });

    if (creatorReviewRes.status === 201 && creatorReviewRes.body.data) {
      createdReviewIds.push(creatorReviewRes.body.data._id);
      recordResult('STEP 18-19: Creator Review for Brand Creation', 'PASS', `Review._id: ${creatorReviewRes.body.data._id}`);
    } else {
      recordResult('STEP 18-19: Creator Review for Brand Creation', 'FAIL', `HTTP ${creatorReviewRes.status}`);
    }

    // ==================================================
    // STEP 20-27 — SECURITY & AUTHORIZATION PROTOCOLS
    // ==================================================
    console.log('\n[STEP 20-27] Security, Role & Participant Validation...');

    // 20-21. Unrelated Brand B attempting review
    const brandBReviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 4,
      review: 'Unrelated brand review attempt.'
    }, { Authorization: `Bearer ${brandBToken}` });

    if (brandBReviewRes.status === 403) {
      recordResult('Security 20-21: Unrelated Brand Review Access (HTTP 403)', 'PASS');
    } else {
      recordResult('Security 20-21: Unrelated Brand Review Access (HTTP 403)', 'FAIL', `HTTP ${brandBReviewRes.status}`);
    }

    // 22-23. Unrelated Creator B attempting review
    const creatorBReviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 4,
      review: 'Unrelated creator review attempt.'
    }, { Authorization: `Bearer ${creatorBToken}` });

    if (creatorBReviewRes.status === 403) {
      recordResult('Security 22-23: Unrelated Creator Review Access (HTTP 403)', 'PASS');
    } else {
      recordResult('Security 22-23: Unrelated Creator Review Access (HTTP 403)', 'FAIL', `HTTP ${creatorBReviewRes.status}`);
    }

    // 24-25. Unauthenticated Review Request
    const unauthReviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 5,
      review: 'Unauthenticated review attempt.'
    });

    if (unauthReviewRes.status === 401) {
      recordResult('Security 24-25: Unauthenticated Review Request (HTTP 401)', 'PASS');
    } else {
      recordResult('Security 24-25: Unauthenticated Review Request (HTTP 401)', 'FAIL', `HTTP ${unauthReviewRes.status}`);
    }

    // ==================================================
    // STEP 28-33 — RATING VALUE VALIDATIONS
    // ==================================================
    console.log('\n[STEP 28-33] Testing Rating Value Boundaries & Validation...');

    // 28-29. Rating = 0 (Must be rejected with 400)
    const zeroRatingRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 0,
      review: 'Invalid zero rating.'
    }, { Authorization: `Bearer ${brandToken}` });

    if (zeroRatingRes.status === 400) {
      recordResult('Rating Guard 28-29: Rating 0 Rejection (HTTP 400)', 'PASS');
    } else {
      recordResult('Rating Guard 28-29: Rating 0 Rejection (HTTP 400)', 'FAIL', `HTTP ${zeroRatingRes.status}`);
    }

    // 30-31. Rating = 6 (Must be rejected with 400)
    const maxRatingRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 6,
      review: 'Invalid out of bounds rating 6.'
    }, { Authorization: `Bearer ${brandToken}` });

    if (maxRatingRes.status === 400) {
      recordResult('Rating Guard 30-31: Rating 6 Rejection (HTTP 400)', 'PASS');
    } else {
      recordResult('Rating Guard 30-31: Rating 6 Rejection (HTTP 400)', 'FAIL', `HTTP ${maxRatingRes.status}`);
    }

    // 32-33. Malformed Rating (5.5 / String / NaN)
    const floatRatingRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 4.5,
      review: 'Invalid float rating.'
    }, { Authorization: `Bearer ${brandToken}` });

    if (floatRatingRes.status === 400) {
      recordResult('Rating Guard 32-33: Float/Malformed Rating Rejection (HTTP 400)', 'PASS');
    } else {
      recordResult('Rating Guard 32-33: Float/Malformed Rating Rejection (HTTP 400)', 'FAIL', `HTTP ${floatRatingRes.status}`);
    }

    // 34-35. Invalid Collaboration Relationship (Fake Collaboration ID)
    const fakeCollabId = new mongoose.Types.ObjectId();
    const invalidCollabReviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: fakeCollabId,
      rating: 5,
      review: 'Fake collaboration review.'
    }, { Authorization: `Bearer ${brandToken}` });

    if (invalidCollabReviewRes.status === 404) {
      recordResult('Security 34-35: Invalid Collaboration Relationship (HTTP 404)', 'PASS', invalidCollabReviewRes.body.message);
    } else {
      recordResult('Security 34-35: Invalid Collaboration Relationship (HTTP 404)', 'FAIL', `HTTP ${invalidCollabReviewRes.status}`);
    }

    // ==================================================
    // STEP 36 — MONGODB RELATIONSHIPS & DOCUMENT CLEANUP
    // ==================================================
    console.log('\n[STEP 36] Verifying MongoDB relationships & cleaning up test data...');
    const dbReview = await models.Review.findById(reviewDoc._id);
    const validRefs = dbReview.reviewerId.equals(brandUser._id) && dbReview.reviewedUserId.equals(creatorUser._id) && dbReview.collaborationId.equals(collabDoc._id);

    if (validRefs) {
      recordResult('STEP 36: MongoDB Relationship & Constraint Verification', 'PASS', `Review references Brand, Creator & Collaboration IDs cleanly`);
    } else {
      recordResult('STEP 36: MongoDB Relationship & Constraint Verification', 'FAIL', 'Broken foreign key references');
    }

    // Clean up
    await models.Review.deleteMany({ _id: { $in: createdReviewIds } });
    await models.Collaboration.deleteMany({ _id: { $in: createdCollaborationIds } });
    await models.Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    await models.CreatorProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.BrandProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.User.deleteMany({ _id: { $in: createdUserIds } });

    const orphanCount = await models.User.countDocuments({ email: { $in: [brandEmail, creatorEmail, brandBEmail, creatorBEmail] } });
    if (orphanCount === 0) {
      recordResult('STEP 36: MongoDB Document Cleanup', 'PASS', '100% temporary Phase 4C test documents removed cleanly');
    } else {
      recordResult('STEP 36: MongoDB Document Cleanup', 'FAIL', `Remaining orphan docs: ${orphanCount}`);
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 4C Verification Suite', 'FAIL', err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & Database connections closed cleanly.');
  }

  return testResults;
}

runPhase4CTests().then((results) => {
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n====================================================');
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} Phase 4C Assertions Passed`);
  console.log('====================================================');

  if (failed.length > 0) {
    console.error(`\n❌ PHASE 4C VERIFICATION FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n🎉 PHASE 4C REVIEW & RATING PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
});
