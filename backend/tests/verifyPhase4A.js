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

async function runPhase4ATests() {
  console.log('====================================================');
  console.log('🧪 COLLABX PHASE 4A COLLABORATION LIFECYCLE VERIFICATION');
  console.log('====================================================\n');

  const testResults = [];
  const createdUserIds = [];
  const createdProfileIds = [];
  const createdCampaignIds = [];
  const createdCollaborationIds = [];

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
    const brandEmail = `phase4a_brand_${timestamp}@collabx.com`;
    const creatorAEmail = `phase4a_creatorA_${timestamp}@collabx.com`;
    const creatorBEmail = `phase4a_creatorB_${timestamp}@collabx.com`;
    const brandBEmail = `phase4a_brandB_${timestamp}@collabx.com`;
    const password = 'SecurePassword123!';

    // ==================================================
    // STEP 1 — ACCOUNT CREATION & JWT AUTHENTICATION
    // ==================================================
    console.log('\n[STEP 1] Creating temporary Brand & Creator accounts...');

    // Brand A
    const brandRes = await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase 4A Brand Corp',
      email: brandEmail,
      password: password,
      website: 'https://brand4a.com'
    });
    const brandUser = await models.User.findOne({ email: brandEmail });
    createdUserIds.push(brandUser._id);
    const brandToken = generateToken(brandUser);

    // Creator A
    const creatorRes = await makeRequest('POST', '/api/creator/auth/register', {
      fullName: 'Phase 4A Creator Alpha',
      email: creatorAEmail,
      password: password,
      primaryContentNiche: 'Tech & Gadgets'
    });
    const creatorUser = await models.User.findOne({ email: creatorAEmail });
    createdUserIds.push(creatorUser._id);
    const creatorToken = generateToken(creatorUser);

    // Creator B (for cross-user security test)
    const creatorBUser = await models.User.create({
      fullName: 'Phase 4A Creator Beta',
      email: creatorBEmail,
      passwordHash: 'hashed_pw',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorBUser._id);
    const creatorBToken = generateToken(creatorBUser);

    // Brand B (for cross-brand security test)
    const brandBUser = await models.User.create({
      companyName: 'Phase 4A Brand Beta',
      email: brandBEmail,
      passwordHash: 'hashed_pw',
      role: 'brand',
      isActive: true
    });
    createdUserIds.push(brandBUser._id);
    const brandBToken = generateToken(brandBUser);

    recordResult('STEP 1: Account Creation & JWT Authentication', 'PASS', `Brand: ${brandUser._id}, Creator: ${creatorUser._id}`);

    // ==================================================
    // STEP 2 — COLLABORATION INITIALIZATION (ACTIVE)
    // ==================================================
    console.log('\n[STEP 2] Initializing Collaboration in state active...');
    const campaignDoc = await models.Campaign.create({
      brandId: brandUser._id,
      brandName: 'Phase 4A Brand Corp',
      title: 'Phase 4A Campaign Brief',
      description: 'Testing lifecycle transitions',
      category: 'Tech & Gadgets',
      budget: 15000,
      status: 'active'
    });
    createdCampaignIds.push(campaignDoc._id);

    const collabDoc = await models.Collaboration.create({
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      campaignId: campaignDoc._id,
      brandName: 'Phase 4A Brand Corp',
      creatorName: 'Phase 4A Creator Alpha',
      campaignTitle: 'Phase 4A Campaign Brief',
      agreedBudget: 15000,
      agreedPrice: 15000,
      status: 'active',
      stage: 'active',
      progress: 10
    });
    createdCollaborationIds.push(collabDoc._id);

    if (collabDoc.status === 'active') {
      recordResult('STEP 2: Initial Collaboration Status === active', 'PASS', `Collaboration._id: ${collabDoc._id}`);
    } else {
      recordResult('STEP 2: Initial Collaboration Status === active', 'FAIL', `Status: ${collabDoc.status}`);
    }

    // ==================================================
    // STEP 3 — CREATOR SUBMITS DELIVERABLES (CONTENT_SUBMITTED)
    // ==================================================
    console.log('\n[STEP 3] Creator submits content deliverables...');
    const submitRes = await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://instagram.com/p/draft_reel_4a',
      submissionNotes: 'Initial draft for Phase 4A lifecycle test.'
    }, { Authorization: `Bearer ${creatorToken}` });

    if (submitRes.status === 200 && submitRes.body.data.status === 'content_submitted') {
      recordResult('STEP 3: Creator Submit Deliverables (active -> content_submitted)', 'PASS', `HTTP 200, status: content_submitted`);
    } else {
      recordResult('STEP 3: Creator Submit Deliverables (active -> content_submitted)', 'FAIL', `HTTP ${submitRes.status}, Body: ${JSON.stringify(submitRes.body)}`);
    }

    // ==================================================
    // STEP 4 — BRAND REQUESTS REVISION (REVISION_REQUESTED)
    // ==================================================
    console.log('\n[STEP 4] Brand requests content revision...');
    const revisionRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/revision`, {
      revisionNotes: 'Please adjust lighting in the second scene and add product tag.'
    }, { Authorization: `Bearer ${brandToken}` });

    if (revisionRes.status === 200 && revisionRes.body.data.status === 'revision_requested' && revisionRes.body.data.revisionNotes.includes('lighting')) {
      recordResult('STEP 4: Brand Request Revision (content_submitted -> revision_requested)', 'PASS', `Revision reason stored: "${revisionRes.body.data.revisionNotes}"`);
    } else {
      recordResult('STEP 4: Brand Request Revision (content_submitted -> revision_requested)', 'FAIL', `HTTP ${revisionRes.status}, Body: ${JSON.stringify(revisionRes.body)}`);
    }

    // ==================================================
    // STEP 5 — CREATOR RESUBMITS DELIVERABLES (REVISION_REQUESTED -> CONTENT_SUBMITTED)
    // ==================================================
    console.log('\n[STEP 5] Creator resubmits revised content...');
    const resubmitRes = await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://instagram.com/p/draft_reel_4a_v2',
      submissionNotes: 'Adjusted scene 2 lighting and re-uploaded.'
    }, { Authorization: `Bearer ${creatorToken}` });

    if (resubmitRes.status === 200 && resubmitRes.body.data.status === 'content_submitted') {
      recordResult('STEP 5: Creator Resubmit Deliverables (revision_requested -> content_submitted)', 'PASS', `HTTP 200, status: content_submitted`);
    } else {
      recordResult('STEP 5: Creator Resubmit Deliverables (revision_requested -> content_submitted)', 'FAIL', `HTTP ${resubmitRes.status}`);
    }

    // ==================================================
    // STEP 6 — BRAND APPROVES DELIVERABLES (BRAND_APPROVED)
    // ==================================================
    console.log('\n[STEP 6] Brand approves deliverables...');
    const approveRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/approve`, {
      feedback: 'Looks fantastic, approved!'
    }, { Authorization: `Bearer ${brandToken}` });

    if (approveRes.status === 200 && approveRes.body.data.status === 'brand_approved' && approveRes.body.data.approvedAt) {
      recordResult('STEP 6: Brand Approve Deliverable (content_submitted -> brand_approved)', 'PASS', `approvedAt timestamp set`);
    } else {
      recordResult('STEP 6: Brand Approve Deliverable (content_submitted -> brand_approved)', 'FAIL', `HTTP ${approveRes.status}`);
    }

    // ==================================================
    // STEP 7 — COMPLETE COLLABORATION (COMPLETED)
    // ==================================================
    console.log('\n[STEP 7] Completing collaboration...');
    const completeRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/complete`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (completeRes.status === 200 && completeRes.body.data.status === 'completed' && completeRes.body.data.completedAt) {
      recordResult('STEP 7: Complete Collaboration (brand_approved -> completed)', 'PASS', `completedAt timestamp set`);
    } else {
      recordResult('STEP 7: Complete Collaboration (brand_approved -> completed)', 'FAIL', `HTTP ${completeRes.status}`);
    }

    // ==================================================
    // STEP 8 — ATTEMPT MUTATION ON COMPLETED COLLABORATION (REJECTED)
    // ==================================================
    console.log('\n[STEP 8] Attempting post-completion mutation (must be rejected)...');
    const postCompleteResubmit = await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://instagram.com/p/hack'
    }, { Authorization: `Bearer ${creatorToken}` });

    if (postCompleteResubmit.status === 400) {
      recordResult('STEP 8: Post-Completion Mutation Guard (rejected with HTTP 400)', 'PASS', `Blocked: ${postCompleteResubmit.body.message}`);
    } else {
      recordResult('STEP 8: Post-Completion Mutation Guard (rejected with HTTP 400)', 'FAIL', `Expected HTTP 400, got HTTP ${postCompleteResubmit.status}`);
    }

    // ==================================================
    // STEP 9 — SECURITY & INVALID STATE TRANSITIONS
    // ==================================================
    console.log('\n[STEP 9] Security & Authorization & State Machine Tests...');

    // 1. Unauthenticated Request
    const unauthRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/approve`);
    if (unauthRes.status === 401) {
      recordResult('Security 1: Unauthenticated request rejected (HTTP 401)', 'PASS');
    } else {
      recordResult('Security 1: Unauthenticated request rejected (HTTP 401)', 'FAIL', `HTTP ${unauthRes.status}`);
    }

    // 2. Wrong Role (Creator trying to approve)
    const wrongRoleRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/approve`, null, {
      Authorization: `Bearer ${creatorToken}`
    });
    if (wrongRoleRes.status === 403) {
      recordResult('Security 2: Wrong role request rejected (HTTP 403)', 'PASS');
    } else {
      recordResult('Security 2: Wrong role request rejected (HTTP 403)', 'FAIL', `HTTP ${wrongRoleRes.status}`);
    }

    // 3. Wrong Brand (Brand B trying to request revision on Brand A collab)
    const newCollabForBrandB = await models.Collaboration.create({
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      campaignId: campaignDoc._id,
      brandName: 'Phase 4A Brand Corp',
      creatorName: 'Phase 4A Creator Alpha',
      campaignTitle: 'Phase 4A Campaign Brief',
      agreedBudget: 15000,
      status: 'content_submitted'
    });
    createdCollaborationIds.push(newCollabForBrandB._id);

    const wrongBrandRes = await makeRequest('PATCH', `/api/brand/collaborations/${newCollabForBrandB._id}/revision`, {
      revisionNotes: 'Hack attempt'
    }, { Authorization: `Bearer ${brandBToken}` });

    if (wrongBrandRes.status === 403) {
      recordResult('Security 3: Wrong brand request rejected (HTTP 403)', 'PASS');
    } else {
      recordResult('Security 3: Wrong brand request rejected (HTTP 403)', 'FAIL', `HTTP ${wrongBrandRes.status}`);
    }

    // 4. Wrong Creator (Creator B trying to submit on Creator A collab)
    const wrongCreatorRes = await makeRequest('PATCH', `/api/creator/collaborations/${newCollabForBrandB._id}/submit`, {
      submissionUrl: 'https://instagram.com/p/hack'
    }, { Authorization: `Bearer ${creatorBToken}` });

    if (wrongCreatorRes.status === 403) {
      recordResult('Security 4: Wrong creator request rejected (HTTP 403)', 'PASS');
    } else {
      recordResult('Security 4: Wrong creator request rejected (HTTP 403)', 'FAIL', `HTTP ${wrongCreatorRes.status}`);
    }

    // 5. Invalid State Transition (Active -> Approved)
    const activeCollab = await models.Collaboration.create({
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      campaignId: campaignDoc._id,
      brandName: 'Phase 4A Brand Corp',
      creatorName: 'Phase 4A Creator Alpha',
      campaignTitle: 'Phase 4A Campaign Brief',
      agreedBudget: 15000,
      status: 'active'
    });
    createdCollaborationIds.push(activeCollab._id);

    const invalidTransitionRes = await makeRequest('PATCH', `/api/brand/collaborations/${activeCollab._id}/approve`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (invalidTransitionRes.status === 400) {
      recordResult('Security 5: Invalid state transition rejected (active -> brand_approved HTTP 400)', 'PASS', invalidTransitionRes.body.message);
    } else {
      recordResult('Security 5: Invalid state transition rejected (active -> brand_approved HTTP 400)', 'FAIL', `HTTP ${invalidTransitionRes.status}`);
    }

    // ==================================================
    // STEP 10 — MONGODB INTEGRITY & CLEANUP
    // ==================================================
    console.log('\n[STEP 10] MongoDB integrity check & test document cleanup...');
    const dbCollab = await models.Collaboration.findById(collabDoc._id);
    const hasValidRefs = dbCollab.brandId.equals(brandUser._id) && dbCollab.creatorId.equals(creatorUser._id);

    if (hasValidRefs) {
      recordResult('STEP 10: MongoDB Relationship Verification', 'PASS', `Brand & Creator foreign key references match User._id`);
    } else {
      recordResult('STEP 10: MongoDB Relationship Verification', 'FAIL', 'Broken foreign key references');
    }

    // Clean up
    await models.Collaboration.deleteMany({ _id: { $in: createdCollaborationIds } });
    await models.Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    await models.CreatorProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.BrandProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.User.deleteMany({ _id: { $in: createdUserIds } });

    const orphanCount = await models.User.countDocuments({ email: { $in: [brandEmail, creatorAEmail, creatorBEmail, brandBEmail] } });
    if (orphanCount === 0) {
      recordResult('STEP 10: MongoDB Document Cleanup', 'PASS', '100% temporary Phase 4A test records removed cleanly');
    } else {
      recordResult('STEP 10: MongoDB Document Cleanup', 'FAIL', `Remaining orphan docs: ${orphanCount}`);
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 4A Verification Suite', 'FAIL', err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & Database connections closed cleanly.');
  }

  return testResults;
}

runPhase4ATests().then((results) => {
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n====================================================');
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} Phase 4A Assertions Passed`);
  console.log('====================================================');

  if (failed.length > 0) {
    console.error(`\n❌ PHASE 4A VERIFICATION FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n🎉 PHASE 4A COLLABORATION LIFECYCLE PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
});
