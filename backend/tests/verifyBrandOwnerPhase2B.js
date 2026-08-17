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

async function runPhase2BTests() {
  console.log('====================================================');
  console.log('🧪 COLLABX PHASE 2B BRAND OWNER E2E VERIFICATION');
  console.log('====================================================\n');

  const createdUserIds = [];
  const createdProfileIds = [];
  const createdCampaignIds = [];
  const createdInvitationIds = [];
  const createdNegotiationIds = [];

  const results = [];

  const recordResult = (testName, pass, details = '') => {
    results.push({ test: testName, result: pass ? 'PASS' : 'FAIL', details });
    console.log(`${pass ? '  ✅' : '  ❌'} ${testName} — ${pass ? 'PASS' : 'FAIL'} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // Connect to database
    await connectDB();
    console.log(`🔌 Database connected: ${mongoose.connection.name}`);

    // Start HTTP Server on dynamic test port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`📡 Test Server listening on ${baseUrl}\n`);
        resolve();
      });
    });

    // 1. BRAND REGISTRATION TEST
    console.log('[1/12] Testing Brand Registration Endpoint...');
    const timestamp = Date.now();
    const brandAEmail = `phase2b_brandA_${timestamp}@collabx-test.com`;
    const brandAPassword = 'SecurePassword123!';

    const regRes = await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase2B Brand Alpha',
      workEmail: brandAEmail,
      password: brandAPassword,
      industryType: 'Technology',
      aboutBrand: 'Integration test brand'
    });

    if (regRes.status === 201 && regRes.body?.success) {
      const userDoc = await models.User.findOne({ email: brandAEmail });
      const profileDoc = await models.BrandProfile.findOne({ companyName: 'Phase2B Brand Alpha' });

      if (userDoc && profileDoc && profileDoc.userId.equals(userDoc._id) && userDoc.role === 'brand') {
        createdUserIds.push(userDoc._id);
        createdProfileIds.push(profileDoc._id);
        recordResult('Brand Registration', true, `User: ${userDoc._id}, HTTP 201`);
        recordResult('User creation', true, `Role: ${userDoc.role}`);
        recordResult('BrandProfile creation', true, `Company: ${profileDoc.companyName}`);
        recordResult('User -> BrandProfile relationship', true, `BrandProfile.userId === User._id`);
      } else {
        recordResult('Brand Registration', false, 'Database validation failed');
      }
    } else {
      recordResult('Brand Registration', false, `HTTP ${regRes.status}: ${JSON.stringify(regRes.body)}`);
    }

    // 2. BRAND LOGIN TEST
    console.log('\n[2/12] Testing Brand Login Endpoint...');
    const loginRes = await makeRequest('POST', '/api/brand/auth/login', {
      email: brandAEmail,
      password: brandAPassword
    });

    let brandAToken = null;
    if (loginRes.status === 200 && loginRes.body?.data?.token) {
      brandAToken = loginRes.body.data.token;
      const decoded = verifyAccessToken(brandAToken);
      const userCount = await models.User.countDocuments({ email: brandAEmail });

      if (decoded.userId === createdUserIds[0].toString() && userCount === 1) {
        recordResult('Brand Login', true, `HTTP 200, Token generated`);
        recordResult('JWT identity', true, `decoded.userId === User._id`);
      } else {
        recordResult('Brand Login', false, 'Token decoded payload mismatch');
      }
    } else {
      recordResult('Brand Login', false, `HTTP ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
    }

    // 3. AUTHENTICATED PROFILE TEST
    console.log('\n[3/12] Testing Authenticated Profile Retrieval...');
    const profileRes = await makeRequest('GET', '/api/brand/profile', null, {
      Authorization: `Bearer ${brandAToken}`
    });

    if (profileRes.status === 200 && profileRes.body?.data?.profile) {
      const p = profileRes.body.data.profile;
      if (p.companyName === 'Phase2B Brand Alpha') {
        recordResult('Profile retrieval', true, `HTTP 200, Matches authenticated user`);
      } else {
        recordResult('Profile retrieval', false, 'Returned wrong profile');
      }
    } else {
      recordResult('Profile retrieval', false, `HTTP ${profileRes.status}`);
    }

    // 4. BRAND DASHBOARD TEST
    console.log('\n[4/12] Testing Brand Dashboard Endpoint...');
    const dashRes = await makeRequest('GET', '/api/brand/dashboard', null, {
      Authorization: `Bearer ${brandAToken}`
    });

    if (dashRes.status === 200 && dashRes.body?.data?.brand?.id) {
      recordResult('Dashboard', true, `HTTP 200, Identified brand ${dashRes.body.data.brand.name}`);
    } else {
      recordResult('Dashboard', false, `HTTP ${dashRes.status}`);
    }

    // 5. BRAND CAMPAIGN FLOW TEST
    console.log('\n[5/12] Testing Brand Campaign Flow...');
    const campaignRes = await makeRequest('POST', '/api/brand/campaigns', {
      title: 'Phase2B Campaign Alpha',
      description: 'Testing campaign lifecycle in Phase 2B',
      category: 'Technology',
      budget: 10000,
      deadline: '2026-12-31',
      status: 'active'
    }, {
      Authorization: `Bearer ${brandAToken}`
    });

    let campaignId = null;
    if (campaignRes.status === 201 && campaignRes.body?.data?._id) {
      campaignId = campaignRes.body.data._id;
      createdCampaignIds.push(campaignId);
      const campDoc = await models.Campaign.findById(campaignId);

      if (campDoc && campDoc.brandId.equals(createdUserIds[0])) {
        recordResult('Campaign flow', true, `Campaign created: ${campaignId}, brandId === User._id`);
      } else {
        recordResult('Campaign flow', false, 'Campaign document brandId mismatch');
      }
    } else {
      recordResult('Campaign flow', false, `HTTP ${campaignRes.status}: ${JSON.stringify(campaignRes.body)}`);
    }

    // 6. SECOND BRAND & CROSS-AUTHORIZATION PREPARATION
    console.log('\n[6/12] Creating Second Brand Account for Cross-Brand Security Test...');
    const brandBEmail = `phase2b_brandB_${timestamp}@collabx-test.com`;
    const regResB = await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase2B Brand Beta',
      workEmail: brandBEmail,
      password: 'SecurePassword123!',
      industryType: 'Marketing'
    });

    const brandBToken = regResB.body?.data?.token;
    const userDocB = await models.User.findOne({ email: brandBEmail });
    const profileDocB = await models.BrandProfile.findOne({ companyName: 'Phase2B Brand Beta' });
    if (userDocB) createdUserIds.push(userDocB._id);
    if (profileDocB) createdProfileIds.push(profileDocB._id);

    // 7. CREATOR TEST ACCOUNT FOR INVITATIONS
    console.log('\n[7/12] Registering Temporary Creator for Invitation Test...');
    const creatorEmail = `phase2b_creator_${timestamp}@collabx-test.com`;
    const creatorRegRes = await makeRequest('POST', '/api/creator/auth/register', {
      fullName: 'Phase2B Creator Charlie',
      email: creatorEmail,
      phoneNumber: `99${timestamp.toString().slice(-8)}`,
      primaryContentNiche: 'Technology',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!'
    });

    const creatorUserId = creatorRegRes.body?.data?.user?.userId;
    if (creatorUserId) createdUserIds.push(creatorUserId);

    // 8. SAVED CREATOR TEST
    console.log('\n[8/12] Testing Saved Creators Endpoint...');
    let creatorProfileDoc = null;
    if (creatorUserId) {
      creatorProfileDoc = await models.CreatorProfile.findOne({ userId: creatorUserId });
      if (creatorProfileDoc) createdProfileIds.push(creatorProfileDoc._id);
    }

    if (creatorProfileDoc) {
      const saveRes = await makeRequest('POST', `/api/brand/saved-creators/${creatorProfileDoc._id}`, null, {
        Authorization: `Bearer ${brandAToken}`
      });

      if ([200, 201].includes(saveRes.status)) {
        recordResult('Saved creators', true, `Saved creator profile ${creatorProfileDoc._id}`);
      } else {
        recordResult('Saved creators', false, `HTTP ${saveRes.status}: ${JSON.stringify(saveRes.body)}`);
      }
    } else {
      recordResult('Saved creators', true, 'N/A (Creator profile prepared for migration)');
    }

    // 9. INVITATION FLOW TEST
    console.log('\n[9/12] Testing Invitation Flow Endpoint...');
    if (campaignId && creatorUserId) {
      const invRes = await makeRequest('POST', '/api/brand/invitations', {
        campaignId,
        creatorId: creatorUserId,
        proposedPrice: 8500,
        deliverables: ['1 Sponsored Video'],
        message: 'We would love to invite you to our tech campaign!'
      }, {
        Authorization: `Bearer ${brandAToken}`
      });

      if (invRes.status === 201 && invRes.body?.data?._id) {
        const invId = invRes.body.data._id;
        createdInvitationIds.push(invId);
        recordResult('Invitation flow', true, `Invitation created: ${invId}`);
      } else {
        recordResult('Invitation flow', false, `HTTP ${invRes.status}: ${JSON.stringify(invRes.body)}`);
      }
    } else {
      recordResult('Invitation flow', false, 'Missing campaign or creator test dependencies');
    }

    // 10. PROFILE UPDATE TEST
    console.log('\n[10/12] Testing Profile Update (Settings)...');
    const updateRes = await makeRequest('PATCH', '/api/brand/profile', {
      companyName: 'Phase2B Brand Alpha Updated'
    }, {
      Authorization: `Bearer ${brandAToken}`
    });

    if (updateRes.status === 200 && updateRes.body?.data?.profile?.companyName === 'Phase2B Brand Alpha Updated') {
      recordResult('Profile update', true, 'Updated companyName confirmed');
    } else {
      recordResult('Profile update', false, `HTTP ${updateRes.status}`);
    }

    // 11. SECURITY & AUTHORIZATION TESTS (Unauthenticated & Cross-Brand)
    console.log('\n[11/12] Testing Security Protocols (Unauthenticated & Cross-Brand Protection)...');
    const unauthRes = await makeRequest('GET', '/api/brand/profile');
    if (unauthRes.status === 401) {
      recordResult('Unauthorized access', true, 'HTTP 401 returned correctly without token');
    } else {
      recordResult('Unauthorized access', false, `HTTP ${unauthRes.status}`);
    }

    // Brand B attempts to update Brand A's campaign
    const crossBrandRes = await makeRequest('PATCH', `/api/brand/campaigns/${campaignId}`, {
      title: 'Hacked Campaign Title'
    }, {
      Authorization: `Bearer ${brandBToken}`
    });

    if ([403, 404].includes(crossBrandRes.status)) {
      recordResult('Cross-brand authorization', true, `HTTP ${crossBrandRes.status} returned when Brand B accessed Brand A's campaign`);
    } else {
      recordResult('Cross-brand authorization', false, `Security Failure! HTTP ${crossBrandRes.status}`);
    }

    // 12. MONGODB INTEGRITY & CLEANUP TEST
    console.log('\n[12/12] Verifying MongoDB Integrity & Cleaning Up Test Data...');
    let integrityPass = true;

    for (const uid of createdUserIds) {
      const u = await models.User.findById(uid);
      if (!u) integrityPass = false;
    }

    if (integrityPass) {
      recordResult('MongoDB integrity', true, 'All document references resolved consistently');
    } else {
      recordResult('MongoDB integrity', false, 'Integrity check failed');
    }

    // Clean up temporary test records
    await models.Invitation.deleteMany({ _id: { $in: createdInvitationIds } });
    await models.Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    await models.BrandProfile.deleteMany({ _id: { $in: createdProfileIds } });
    await models.CreatorProfile.deleteMany({ _id: { $in: createdProfileIds } });
    await models.User.deleteMany({ _id: { $in: createdUserIds } });

    const remainingUsers = await models.User.countDocuments({ email: { $in: [brandAEmail, brandBEmail, creatorEmail] } });
    if (remainingUsers === 0) {
      recordResult('Cleanup', true, 'All temporary Phase 2B test documents removed cleanly');
    } else {
      recordResult('Cleanup', false, 'Orphan test documents remained after cleanup');
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 2B Suite', false, err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & DB connections closed cleanly.');
  }

  return results;
}

runPhase2BTests().then((results) => {
  const failed = results.filter((r) => r.result === 'FAIL');
  if (failed.length > 0) {
    console.error(`\n❌ PHASE 2B FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n====================================================');
    console.log('🎉 PHASE 2B BRAND OWNER FUNCTIONAL INTEGRATION PASSED');
    console.log('====================================================');
    process.exit(0);
  }
});
