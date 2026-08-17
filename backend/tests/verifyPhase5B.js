require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
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

async function runPhase5BTests() {
  console.log('====================================================');
  console.log('🛡️ COLLABX PHASE 5B SECURITY HARDENING VERIFICATION');
  console.log('====================================================\n');

  const testResults = [];
  const createdUserIds = [];
  const createdCampaignIds = [];
  const createdInvitationIds = [];
  const createdCollaborationIds = [];

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
    const brandAEmail = `sec_brandA_${timestamp}@collabx.com`;
    const brandBEmail = `sec_brandB_${timestamp}@collabx.com`;
    const creatorAEmail = `sec_creatorA_${timestamp}@collabx.com`;
    const creatorBEmail = `sec_creatorB_${timestamp}@collabx.com`;
    const password = 'SecurePassword123!';

    // ==================================================
    // 1. VALID AUTHENTICATION & REGISTRATION
    // ==================================================
    console.log('\n[TEST 1-2] Testing Valid Registration & Login...');
    const brandARegRes = await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Security Brand Alpha',
      email: brandAEmail,
      password: password
    });
    const brandAUser = await models.User.findOne({ email: brandAEmail });
    createdUserIds.push(brandAUser._id);
    const brandAToken = generateToken(brandAUser);

    const brandBUser = await models.User.create({
      fullName: 'Security Brand Beta',
      email: brandBEmail,
      password: 'hashed_pw_dummy',
      role: 'brand',
      isActive: true
    });
    createdUserIds.push(brandBUser._id);
    const brandBToken = generateToken(brandBUser);

    const creatorAUser = await models.User.create({
      fullName: 'Security Creator Alpha',
      email: creatorAEmail,
      password: 'hashed_pw_dummy',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorAUser._id);
    const creatorAToken = generateToken(creatorAUser);

    const creatorBUser = await models.User.create({
      fullName: 'Security Creator Beta',
      email: creatorBEmail,
      password: 'hashed_pw_dummy',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorBUser._id);
    const creatorBToken = generateToken(creatorBUser);

    if (brandARegRes.status === 201 && brandAToken && creatorAToken) {
      recordResult('1. Valid Authentication & Token Generation', 'PASS', 'Brand & Creator accounts created and JWT tokens generated');
    } else {
      recordResult('1. Valid Authentication & Token Generation', 'FAIL', `HTTP ${brandARegRes.status}`);
    }

    // ==================================================
    // 2. INVALID CREDENTIALS REJECTION
    // ==================================================
    console.log('\n[TEST 3] Testing Invalid Login Credentials...');
    const invalidLoginRes = await makeRequest('POST', '/api/brand/auth/login', {
      email: brandAEmail,
      password: 'WrongPassword123!'
    });

    if (invalidLoginRes.status === 401 || invalidLoginRes.status === 400) {
      recordResult('2. Invalid Credentials Protection', 'PASS', `Rejected with HTTP ${invalidLoginRes.status}`);
    } else {
      recordResult('2. Invalid Credentials Protection', 'FAIL', `HTTP ${invalidLoginRes.status}`);
    }

    // ==================================================
    // 3. JWT VALIDATION — MISSING TOKEN
    // ==================================================
    console.log('\n[TEST 4] Testing Missing Authorization Header (401)...');
    const missingTokenRes = await makeRequest('GET', '/api/brand/analytics');

    if (missingTokenRes.status === 401) {
      recordResult('3. JWT Validation — Missing Token', 'PASS', 'HTTP 401 returned for unauthenticated request');
    } else {
      recordResult('3. JWT Validation — Missing Token', 'FAIL', `HTTP ${missingTokenRes.status}`);
    }

    // ==================================================
    // 4. JWT VALIDATION — EXPIRED TOKEN
    // ==================================================
    console.log('\n[TEST 5] Testing Expired JWT Token (401)...');
    const expiredToken = jwt.sign(
      { userId: brandAUser._id, role: 'brand', email: brandAUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const expiredRes = await makeRequest('GET', '/api/brand/analytics', null, {
      Authorization: `Bearer ${expiredToken}`
    });

    if (expiredRes.status === 401) {
      recordResult('4. JWT Validation — Expired Token', 'PASS', 'HTTP 401 TOKEN_EXPIRED returned');
    } else {
      recordResult('4. JWT Validation — Expired Token', 'FAIL', `HTTP ${expiredRes.status}`);
    }

    // ==================================================
    // 5. JWT VALIDATION — MALFORMED / INVALID TOKEN
    // ==================================================
    console.log('\n[TEST 6] Testing Malformed / Invalid JWT Token (401)...');
    const malformedRes = await makeRequest('GET', '/api/brand/analytics', null, {
      Authorization: 'Bearer invalid.corrupted.jwt.signature'
    });

    if (malformedRes.status === 401) {
      recordResult('5. JWT Validation — Malformed Token', 'PASS', 'HTTP 401 INVALID_TOKEN returned');
    } else {
      recordResult('5. JWT Validation — Malformed Token', 'FAIL', `HTTP ${malformedRes.status}`);
    }

    // ==================================================
    // 6. BRAND-ONLY ROLE ISOLATION
    // ==================================================
    console.log('\n[TEST 7] Testing Brand User Accessing Creator Endpoint (403)...');
    const brandToCreatorRes = await makeRequest('GET', '/api/creator/analytics', null, {
      Authorization: `Bearer ${brandAToken}`
    });

    if (brandToCreatorRes.status === 403) {
      recordResult('6. Role Isolation — Brand Accessing Creator Route', 'PASS', 'HTTP 403 FORBIDDEN returned');
    } else {
      recordResult('6. Role Isolation — Brand Accessing Creator Route', 'FAIL', `HTTP ${brandToCreatorRes.status}`);
    }

    // ==================================================
    // 7. CREATOR-ONLY ROLE ISOLATION
    // ==================================================
    console.log('\n[TEST 8] Testing Creator User Accessing Brand Endpoint (403)...');
    const creatorToBrandRes = await makeRequest('GET', '/api/brand/analytics', null, {
      Authorization: `Bearer ${creatorAToken}`
    });

    if (creatorToBrandRes.status === 403) {
      recordResult('7. Role Isolation — Creator Accessing Brand Route', 'PASS', 'HTTP 403 FORBIDDEN returned');
    } else {
      recordResult('7. Role Isolation — Creator Accessing Brand Route', 'FAIL', `HTTP ${creatorToBrandRes.status}`);
    }

    // ==================================================
    // 8. OWNERSHIP ISOLATION — COLLABORATION & ACTIVITY
    // ==================================================
    console.log('\n[TEST 9] Testing Non-Participant Access to Collaboration (403)...');
    const campaignDoc = await models.Campaign.create({
      brandId: brandAUser._id,
      brandName: 'Security Brand Alpha',
      title: 'Security Hardening Campaign',
      description: 'Role and ownership isolation test',
      category: 'Lifestyle',
      budget: 20000,
      status: 'active'
    });
    createdCampaignIds.push(campaignDoc._id);

    const collabDoc = await models.Collaboration.create({
      campaignId: campaignDoc._id,
      campaignTitle: campaignDoc.title,
      brandId: brandAUser._id,
      brandName: 'Security Brand Alpha',
      creatorId: creatorAUser._id,
      creatorName: 'Security Creator Alpha',
      negotiationId: new mongoose.Types.ObjectId(),
      agreedPrice: 20000,
      agreedBudget: 20000,
      status: 'active'
    });
    createdCollaborationIds.push(collabDoc._id);

    const brandBCollabRes = await makeRequest('GET', `/api/brand/collaborations/${collabDoc._id}/activity`, null, {
      Authorization: `Bearer ${brandBToken}`
    });

    if (brandBCollabRes.status === 403) {
      recordResult('8. Ownership Isolation — Non-Participant Access', 'PASS', 'Brand B rejected with HTTP 403');
    } else {
      recordResult('8. Ownership Isolation — Non-Participant Access', 'FAIL', `HTTP ${brandBCollabRes.status}`);
    }

    // ==================================================
    // 9. DEACTIVATED ACCOUNT PROTECTION
    // ==================================================
    console.log('\n[TEST 10] Testing Deactivated Account Protection (403)...');
    const deactivatedUser = await models.User.create({
      fullName: 'Deactivated Brand',
      email: `deactivated_${timestamp}@collabx.com`,
      password: 'hashed_pw_dummy',
      role: 'brand',
      isActive: false
    });
    createdUserIds.push(deactivatedUser._id);
    const deactivatedToken = generateToken(deactivatedUser);

    const deactRes = await makeRequest('GET', '/api/brand/analytics', null, {
      Authorization: `Bearer ${deactivatedToken}`
    });

    if (deactRes.status === 403) {
      recordResult('9. Deactivated Account Protection', 'PASS', 'HTTP 403 ACCOUNT_DEACTIVATED returned');
    } else {
      recordResult('9. Deactivated Account Protection', 'FAIL', `HTTP ${deactRes.status}`);
    }

    // ==================================================
    // 10. HTTP STATUS CODE CONSISTENCY
    // ==================================================
    console.log('\n[TEST 11] Testing HTTP Status Code Security Consistency...');
    const invalidIdRes = await makeRequest('GET', '/api/brand/collaborations/invalid-id-123/activity', null, {
      Authorization: `Bearer ${brandAToken}`
    });

    if (invalidIdRes.status === 400) {
      recordResult('10. HTTP Status Code Security Consistency', 'PASS', 'Invalid ObjectId returns HTTP 400 Bad Request');
    } else {
      recordResult('10. HTTP Status Code Security Consistency', 'FAIL', `HTTP ${invalidIdRes.status}`);
    }

    // ==================================================
    // 11. MONGODB CLEANUP & DATA INTEGRITY
    // ==================================================
    console.log('\n[TEST 12] Cleaning up test data & verifying integrity...');
    await models.Collaboration.deleteMany({ _id: { $in: createdCollaborationIds } });
    await models.Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    await models.BrandProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.CreatorProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.User.deleteMany({ _id: { $in: createdUserIds } });

    const orphanCount = await models.User.countDocuments({ _id: { $in: createdUserIds } });
    if (orphanCount === 0) {
      recordResult('11. MongoDB Cleanup & Integrity', 'PASS', '100% temporary Phase 5B test records removed cleanly');
    } else {
      recordResult('11. MongoDB Cleanup & Integrity', 'FAIL', `Remaining orphan docs: ${orphanCount}`);
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 5B Verification Suite', 'FAIL', err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & Database connections closed cleanly.');
  }

  return testResults;
}

runPhase5BTests().then((results) => {
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n====================================================');
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} Phase 5B Assertions Passed`);
  console.log('====================================================');

  if (failed.length > 0) {
    console.error(`\n❌ PHASE 5B VERIFICATION FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n🎉 PHASE 5B SECURITY HARDENING PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
});
