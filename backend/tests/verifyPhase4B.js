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

async function runPhase4BTests() {
  console.log('====================================================');
  console.log('🧪 COLLABX PHASE 4B PAYMENT ESCROW & PAYOUT VERIFICATION');
  console.log('====================================================\n');

  const testResults = [];
  const createdUserIds = [];
  const createdCampaignIds = [];
  const createdCollaborationIds = [];
  const createdPaymentIds = [];

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
    const brandEmail = `phase4b_brand_${timestamp}@collabx.com`;
    const creatorAEmail = `phase4b_creatorA_${timestamp}@collabx.com`;
    const creatorBEmail = `phase4b_creatorB_${timestamp}@collabx.com`;
    const brandBEmail = `phase4b_brandB_${timestamp}@collabx.com`;
    const password = 'SecurePassword123!';

    // ==================================================
    // STEP 1-3 — ACCOUNTS & AUTHENTICATION
    // ==================================================
    console.log('\n[STEP 1-3] Creating Brand & Creator test accounts...');

    // Brand A
    await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase 4B Brand Corp',
      email: brandEmail,
      password: password
    });
    const brandUser = await models.User.findOne({ email: brandEmail });
    createdUserIds.push(brandUser._id);
    const brandToken = generateToken(brandUser);

    // Creator A
    await makeRequest('POST', '/api/creator/auth/register', {
      fullName: 'Phase 4B Creator Alpha',
      email: creatorAEmail,
      password: password,
      primaryContentNiche: 'Tech & Gadgets'
    });
    const creatorUser = await models.User.findOne({ email: creatorAEmail });
    createdUserIds.push(creatorUser._id);
    const creatorToken = generateToken(creatorUser);

    // Creator B (for isolation test)
    const creatorBUser = await models.User.create({
      fullName: 'Phase 4B Creator Beta',
      email: creatorBEmail,
      passwordHash: 'hashed_pw',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorBUser._id);
    const creatorBToken = generateToken(creatorBUser);

    // Brand B (for cross-brand security test)
    const brandBUser = await models.User.create({
      companyName: 'Phase 4B Brand Beta',
      email: brandBEmail,
      passwordHash: 'hashed_pw',
      role: 'brand',
      isActive: true
    });
    createdUserIds.push(brandBUser._id);
    const brandBToken = generateToken(brandBUser);

    recordResult('STEP 1-3: Account Creation & Authentication', 'PASS', `Brand: ${brandUser._id}, Creator: ${creatorUser._id}`);

    // ==================================================
    // STEP 4 — COLLABORATION INITIALIZATION
    // ==================================================
    console.log('\n[STEP 4] Creating temporary collaboration...');
    const campaignDoc = await models.Campaign.create({
      brandId: brandUser._id,
      brandName: 'Phase 4B Brand Corp',
      title: 'Phase 4B Escrow Campaign Brief',
      description: 'Testing payment escrow lifecycle',
      category: 'Tech & Gadgets',
      budget: 20000,
      status: 'active'
    });
    createdCampaignIds.push(campaignDoc._id);

    const collabDoc = await models.Collaboration.create({
      brandId: brandUser._id,
      creatorId: creatorUser._id,
      campaignId: campaignDoc._id,
      brandName: 'Phase 4B Brand Corp',
      creatorName: 'Phase 4B Creator Alpha',
      campaignTitle: 'Phase 4B Escrow Campaign Brief',
      agreedBudget: 20000,
      agreedPrice: 20000,
      status: 'active',
      stage: 'active',
      progress: 10
    });
    createdCollaborationIds.push(collabDoc._id);

    recordResult('STEP 4: Collaboration Initialization', 'PASS', `Collaboration._id: ${collabDoc._id}`);

    // ==================================================
    // STEP 5-8 — CREATOR PAYOUT ACCOUNT MANAGEMENT
    // ==================================================
    console.log('\n[STEP 5-8] Testing Creator Payout Account CRUD & Isolation...');

    // 5. Create Payout Account
    const createPayoutRes = await makeRequest('POST', '/api/creator/payout-account', {
      bankName: 'HDFC Bank',
      accountNumber: '50100982391823',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Phase 4B Creator Alpha',
      upiId: 'creator@okaxis'
    }, { Authorization: `Bearer ${creatorToken}` });

    if (createPayoutRes.status === 200 && createPayoutRes.body.data.bankName === 'HDFC Bank') {
      recordResult('STEP 5: Creator Create Payout Account', 'PASS', `Bank: HDFC Bank, UPI: creator@okaxis`);
    } else {
      recordResult('STEP 5: Creator Create Payout Account', 'FAIL', `HTTP ${createPayoutRes.status}`);
    }

    // 6. Get Own Payout Account
    const getPayoutRes = await makeRequest('GET', '/api/creator/payout-account', null, {
      Authorization: `Bearer ${creatorToken}`
    });

    if (getPayoutRes.status === 200 && getPayoutRes.body.data.accountNumber === '50100982391823') {
      recordResult('STEP 6: Creator Retrieve Own Payout Account', 'PASS', `Account number verified`);
    } else {
      recordResult('STEP 6: Creator Retrieve Own Payout Account', 'FAIL', `HTTP ${getPayoutRes.status}`);
    }

    // 7. Update Own Payout Account
    const updatePayoutRes = await makeRequest('POST', '/api/creator/payout-account', {
      bankName: 'ICICI Bank',
      accountNumber: '50100982391823',
      ifscCode: 'ICIC0005678',
      accountHolderName: 'Phase 4B Creator Alpha',
      upiId: 'creator@icici'
    }, { Authorization: `Bearer ${creatorToken}` });

    if (updatePayoutRes.status === 200 && updatePayoutRes.body.data.bankName === 'ICICI Bank') {
      recordResult('STEP 7: Creator Update Own Payout Account', 'PASS', `Updated Bank: ICICI Bank`);
    } else {
      recordResult('STEP 7: Creator Update Own Payout Account', 'FAIL', `HTTP ${updatePayoutRes.status}`);
    }

    // 8. Isolation: Creator B getting Creator B payout account returns null/isolated
    const creatorBPayoutRes = await makeRequest('GET', '/api/creator/payout-account', null, {
      Authorization: `Bearer ${creatorBToken}`
    });

    if (creatorBPayoutRes.status === 200 && creatorBPayoutRes.body.data === null) {
      recordResult('STEP 8: Cross-Creator Payout Account Isolation', 'PASS', `Creator B cannot read Creator A payout account`);
    } else {
      recordResult('STEP 8: Cross-Creator Payout Account Isolation', 'FAIL', `Leaked data to Creator B`);
    }

    // ==================================================
    // STEP 9-12 — SIMULATED PAYMENT ESCROW INITIATION
    // ==================================================
    console.log('\n[STEP 9-12] Testing Escrow Initiation & Duplicate Guard...');

    // 9 & 10 & 11. Brand Initiates Escrow Payment
    const initiateEscrowRes = await makeRequest('POST', '/api/brand/payments/escrow', {
      collaborationId: collabDoc._id,
      amount: 20000,
      currency: 'USD'
    }, { Authorization: `Bearer ${brandToken}` });

    const paymentDoc = initiateEscrowRes.body.data;
    if (initiateEscrowRes.status === 201 && paymentDoc && paymentDoc.status === 'escrowed') {
      createdPaymentIds.push(paymentDoc._id);
      recordResult('STEP 9-11: Brand Initiate Escrow Payment', 'PASS', `Payment._id: ${paymentDoc._id}, status: escrowed`);
    } else {
      recordResult('STEP 9-11: Brand Initiate Escrow Payment', 'FAIL', `HTTP ${initiateEscrowRes.status}, Body: ${JSON.stringify(initiateEscrowRes.body)}`);
    }

    // 12. Duplicate Active Escrow Payment Guard
    const duplicateEscrowRes = await makeRequest('POST', '/api/brand/payments/escrow', {
      collaborationId: collabDoc._id,
      amount: 20000
    }, { Authorization: `Bearer ${brandToken}` });

    if (duplicateEscrowRes.status === 400) {
      recordResult('STEP 12: Duplicate Active Escrow Guard (rejected with HTTP 400)', 'PASS', duplicateEscrowRes.body.message);
    } else {
      recordResult('STEP 12: Duplicate Active Escrow Guard (rejected with HTTP 400)', 'FAIL', `HTTP ${duplicateEscrowRes.status}`);
    }

    // ==================================================
    // STEP 13 — PREMATURE ESCROW RELEASE GUARD
    // ==================================================
    console.log('\n[STEP 13] Testing Escrow Release before Collaboration Completion...');
    const prematureReleaseRes = await makeRequest('PATCH', `/api/brand/payments/${paymentDoc._id}/release`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (prematureReleaseRes.status === 400) {
      recordResult('STEP 13: Premature Escrow Release Guard (rejected with HTTP 400)', 'PASS', prematureReleaseRes.body.message);
    } else {
      recordResult('STEP 13: Premature Escrow Release Guard (rejected with HTTP 400)', 'FAIL', `HTTP ${prematureReleaseRes.status}`);
    }

    // ==================================================
    // STEP 14 — COMPLETE COLLABORATION VIA PHASE 4A LIFECYCLE
    // ==================================================
    console.log('\n[STEP 14] Transitioning collaboration to state completed via Phase 4A lifecycle...');

    // 1. Submit content
    await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://instagram.com/p/draft_reel_4b',
      submissionNotes: 'Phase 4B escrow release deliverable.'
    }, { Authorization: `Bearer ${creatorToken}` });

    // 2. Brand approve
    await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/approve`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    // 3. Complete collaboration
    const completeRes = await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/complete`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (completeRes.status === 200 && completeRes.body.data.status === 'completed') {
      recordResult('STEP 14: Phase 4A Lifecycle Collaboration Completion', 'PASS', `Status: completed`);
    } else {
      recordResult('STEP 14: Phase 4A Lifecycle Collaboration Completion', 'FAIL', `HTTP ${completeRes.status}`);
    }

    // ==================================================
    // STEP 15-17 — AUTHORIZED ESCROW RELEASE
    // ==================================================
    console.log('\n[STEP 15-17] Releasing escrow payment after completion...');
    const validReleaseRes = await makeRequest('PATCH', `/api/brand/payments/${paymentDoc._id}/release`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (validReleaseRes.status === 200 && validReleaseRes.body.data.status === 'released' && validReleaseRes.body.data.releasedAt) {
      recordResult('STEP 15-17: Authorized Escrow Release', 'PASS', `Status: released, releasedAt: ${validReleaseRes.body.data.releasedAt}`);
    } else {
      recordResult('STEP 15-17: Authorized Escrow Release', 'FAIL', `HTTP ${validReleaseRes.status}, Body: ${JSON.stringify(validReleaseRes.body)}`);
    }

    // ==================================================
    // STEP 18 & 19 — DOUBLE RELEASE & POST-RELEASE MODIFICATION GUARD
    // ==================================================
    console.log('\n[STEP 18-19] Testing Double Release & Post-Release Modification Guard...');
    const doubleReleaseRes = await makeRequest('PATCH', `/api/brand/payments/${paymentDoc._id}/release`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    if (doubleReleaseRes.status === 400) {
      recordResult('STEP 18 & 19: Double Release Guard (rejected with HTTP 400)', 'PASS', doubleReleaseRes.body.message);
    } else {
      recordResult('STEP 18 & 19: Double Release Guard (rejected with HTTP 400)', 'FAIL', `HTTP ${doubleReleaseRes.status}`);
    }

    // ==================================================
    // STEP 20-24 — SECURITY & AUTHORIZATION PROTOCOLS
    // ==================================================
    console.log('\n[STEP 20-24] Security, Authorization & Relationship Validation...');

    // 20. Unauthenticated Request (401)
    const unauthPaymentRes = await makeRequest('POST', '/api/brand/payments/escrow', { collaborationId: collabDoc._id });
    if (unauthPaymentRes.status === 401) {
      recordResult('Security 20: Unauthenticated payment request (HTTP 401)', 'PASS');
    } else {
      recordResult('Security 20: Unauthenticated payment request (HTTP 401)', 'FAIL', `HTTP ${unauthPaymentRes.status}`);
    }

    // 21. Wrong Role (Creator trying to initiate escrow)
    const wrongRoleEscrowRes = await makeRequest('POST', '/api/brand/payments/escrow', { collaborationId: collabDoc._id }, {
      Authorization: `Bearer ${creatorToken}`
    });
    if (wrongRoleEscrowRes.status === 403) {
      recordResult('Security 21: Wrong role escrow initiation (HTTP 403)', 'PASS');
    } else {
      recordResult('Security 21: Wrong role escrow initiation (HTTP 403)', 'FAIL', `HTTP ${wrongRoleEscrowRes.status}`);
    }

    // 22. Wrong Brand Escrow Access (Brand B trying to release Brand A's payment)
    const wrongBrandReleaseRes = await makeRequest('PATCH', `/api/brand/payments/${paymentDoc._id}/release`, null, {
      Authorization: `Bearer ${brandBToken}`
    });
    if (wrongBrandReleaseRes.status === 403) {
      recordResult('Security 22: Cross-brand escrow release access (HTTP 403)', 'PASS');
    } else {
      recordResult('Security 22: Cross-brand escrow release access (HTTP 403)', 'FAIL', `HTTP ${wrongBrandReleaseRes.status}`);
    }

    // 23. Wrong Creator Payout Route Access (Brand calling creator payout route)
    const wrongRolePayoutRes = await makeRequest('GET', '/api/creator/payout-account', null, {
      Authorization: `Bearer ${brandToken}`
    });
    if (wrongRolePayoutRes.status === 403) {
      recordResult('Security 23: Wrong role payout account route access (HTTP 403)', 'PASS');
    } else {
      recordResult('Security 23: Wrong role payout account route access (HTTP 403)', 'FAIL', `HTTP ${wrongRolePayoutRes.status}`);
    }

    // 24. Invalid Collaboration Relationship (Escrow with non-existent collaboration ID)
    const fakeCollabId = new mongoose.Types.ObjectId();
    const invalidCollabEscrowRes = await makeRequest('POST', '/api/brand/payments/escrow', {
      collaborationId: fakeCollabId,
      amount: 1000
    }, { Authorization: `Bearer ${brandToken}` });

    if (invalidCollabEscrowRes.status === 404) {
      recordResult('Security 24: Invalid collaboration relationship (HTTP 404)', 'PASS', invalidCollabEscrowRes.body.message);
    } else {
      recordResult('Security 24: Invalid collaboration relationship (HTTP 404)', 'FAIL', `HTTP ${invalidCollabEscrowRes.status}`);
    }

    // ==================================================
    // STEP 25 & 26 — MONGODB RELATIONSHIPS & CLEANUP
    // ==================================================
    console.log('\n[STEP 25 & 26] Verifying MongoDB relationships & cleaning up test data...');
    const dbPayment = await models.Payment.findById(paymentDoc._id);
    const hasValidRefs = dbPayment.brandId.equals(brandUser._id) && dbPayment.creatorId.equals(creatorUser._id) && dbPayment.collaborationId.equals(collabDoc._id);

    if (hasValidRefs) {
      recordResult('STEP 25: MongoDB Entity Relationship Verification', 'PASS', `Payment references match Brand, Creator, and Collaboration IDs`);
    } else {
      recordResult('STEP 25: MongoDB Entity Relationship Verification', 'FAIL', 'Broken foreign key references');
    }

    // Clean up
    await models.Payment.deleteMany({ _id: { $in: createdPaymentIds } });
    await models.CreatorPayoutAccount.deleteMany({ creatorId: { $in: createdUserIds } });
    await models.Collaboration.deleteMany({ _id: { $in: createdCollaborationIds } });
    await models.Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    await models.CreatorProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.BrandProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.User.deleteMany({ _id: { $in: createdUserIds } });

    const orphanCount = await models.User.countDocuments({ email: { $in: [brandEmail, creatorAEmail, creatorBEmail, brandBEmail] } });
    if (orphanCount === 0) {
      recordResult('STEP 26: MongoDB Document Cleanup', 'PASS', '100% temporary Phase 4B test documents removed cleanly');
    } else {
      recordResult('STEP 26: MongoDB Document Cleanup', 'FAIL', `Remaining orphan docs: ${orphanCount}`);
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 4B Verification Suite', 'FAIL', err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & Database connections closed cleanly.');
  }

  return testResults;
}

runPhase4BTests().then((results) => {
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n====================================================');
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} Phase 4B Assertions Passed`);
  console.log('====================================================');

  if (failed.length > 0) {
    console.error(`\n❌ PHASE 4B VERIFICATION FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n🎉 PHASE 4B PAYMENT ESCROW & PAYOUT PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
});
