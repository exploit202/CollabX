/**
 * E2E Creator Express Interest Verification Suite
 * Tests Creator interest creation, DB persistence, Brand retrieval,
 * Creator refresh persistence, duplicate protection, and Creator isolation.
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Campaign = require('../src/models/campaign.model');
const Invitation = require('../src/models/invitation.model');
const Notification = require('../src/models/notification.model');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59998;

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTest = async () => {
  console.log('====================================================');
  console.log('🚀 COLLABX CREATOR EXPRESS INTEREST E2E SUITE');
  console.log('====================================================\n');

  try {
    await connectDB();
    console.log('🔌 Database connected cleanly.');
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }

  const server = app.listen(PORT, async () => {
    console.log(`📡 Test server listening on http://localhost:${PORT}\n`);

    const timestamp = Date.now();
    let brandUser, creatorA, creatorB, campaign;

    try {
      // 1. Setup Test Users & Campaign
      brandUser = await User.create({
        fullName: `Test Brand Owner ${timestamp}`,
        email: `brand.owner.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });

      creatorA = await User.create({
        fullName: `Test Creator A ${timestamp}`,
        email: `creator.a.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      creatorB = await User.create({
        fullName: `Test Creator B ${timestamp}`,
        email: `creator.b.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      campaign = await Campaign.create({
        title: `Flagship Express Interest Campaign ${timestamp}`,
        description: 'Test active campaign for creator express interest validation',
        brandId: brandUser._id,
        brandName: brandUser.fullName,
        category: 'Tech & Gadgets',
        budget: 5000,
        status: 'active',
        isActive: true,
        targetPlatforms: ['instagram', 'youtube']
      });

      const brandToken = generateToken({ userId: brandUser._id, email: brandUser.email, role: 'brand' });
      const creatorAToken = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });
      const creatorBToken = generateToken({ userId: creatorB._id, email: creatorB.email, role: 'creator' });

      // TEST 1: Creator A discovers campaign before applying
      console.log('[TEST 1] Creator A fetching discover campaigns before applying...');
      const step1Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/campaigns/discover',
        method: 'GET',
        headers: {
          'cookie': `token=${creatorAToken}`,
          'Authorization': `Bearer ${creatorAToken}`
        }
      });

      if (step1Res.status !== 200 || !step1Res.body.success) {
        throw new Error(`Test 1 Failed: ${JSON.stringify(step1Res.body)}`);
      }

      const discoveredCamp1 = (step1Res.body.data || []).find((c) => String(c._id) === String(campaign._id));
      if (!discoveredCamp1 || discoveredCamp1.hasApplied !== false) {
        throw new Error(`Test 1 Failed: Expected hasApplied === false before express interest`);
      }
      console.log('  ✅ TEST 1 PASS (Campaign discovered, hasApplied: false)');

      // TEST 2: Creator A expresses interest
      console.log('\n[TEST 2] Creator A expressing interest in campaign...');
      const step2Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/creator/campaigns/${campaign._id}/express-interest`,
        method: 'POST',
        headers: {
          'cookie': `token=${creatorAToken}`,
          'Authorization': `Bearer ${creatorAToken}`
        }
      });

      if (step2Res.status !== 200 || !step2Res.body.success) {
        throw new Error(`Test 2 Failed: ${JSON.stringify(step2Res.body)}`);
      }
      console.log('  ✅ TEST 2 PASS (Express Interest API returned 200 OK)');

      // TEST 3: Verify MongoDB document creation
      console.log('\n[TEST 3] Inspecting MongoDB Invitation document persistence...');
      const dbInvitation = await Invitation.findOne({
        campaignId: campaign._id,
        creatorId: creatorA._id
      });

      if (!dbInvitation) {
        throw new Error('Test 3 Failed: Invitation document not found in MongoDB!');
      }

      if (
        String(dbInvitation.brandId) !== String(brandUser._id) ||
        dbInvitation.status !== 'pending' ||
        dbInvitation.creatorName !== creatorA.fullName
      ) {
        throw new Error(`Test 3 Failed: Invalid document fields in MongoDB: ${JSON.stringify(dbInvitation)}`);
      }
      console.log('  ✅ TEST 3 PASS (MongoDB Invitation document verified cleanly)');

      // TEST 4: Creator A refreshes discover page (Persistence test)
      console.log('\n[TEST 4] Creator A refreshing discover page (Page Refresh Persistence)...');
      const step4Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/campaigns/discover',
        method: 'GET',
        headers: {
          'cookie': `token=${creatorAToken}`,
          'Authorization': `Bearer ${creatorAToken}`
        }
      });

      const discoveredCamp4 = (step4Res.body.data || []).find((c) => String(c._id) === String(campaign._id));
      if (!discoveredCamp4 || discoveredCamp4.hasApplied !== true) {
        throw new Error(`Test 4 Failed: Expected hasApplied === true after page refresh`);
      }
      console.log('  ✅ TEST 4 PASS (Page refresh returned hasApplied: true)');

      // TEST 5: Brand Owner retrieves invitations
      console.log('\n[TEST 5] Brand Owner fetching /api/brand/invitations (Brand Visibility)...');
      const step5Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/invitations',
        method: 'GET',
        headers: {
          'cookie': `token=${brandToken}`,
          'Authorization': `Bearer ${brandToken}`
        }
      });

      if (step5Res.status !== 200 || !step5Res.body.success) {
        throw new Error(`Test 5 Failed: ${JSON.stringify(step5Res.body)}`);
      }

      const brandInv = (step5Res.body.data || []).find(
        (i) => String(i.campaignId._id || i.campaignId) === String(campaign._id)
      );

      if (!brandInv || String(brandInv.creatorId._id || brandInv.creatorId) !== String(creatorA._id)) {
        throw new Error(`Test 5 Failed: Creator A interest not retrieved on Brand side: ${JSON.stringify(step5Res.body)}`);
      }
      console.log('  ✅ TEST 5 PASS (Brand retrieved Creator A interest successfully)');

      // TEST 6: Idempotency / Duplicate protection
      console.log('\n[TEST 6] Creator A clicking Express Interest again (Duplicate Protection)...');
      const step6Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/creator/campaigns/${campaign._id}/express-interest`,
        method: 'POST',
        headers: {
          'cookie': `token=${creatorAToken}`,
          'Authorization': `Bearer ${creatorAToken}`
        }
      });

      const invitationsCount = await Invitation.countDocuments({
        campaignId: campaign._id,
        creatorId: creatorA._id
      });

      if (invitationsCount !== 1) {
        throw new Error(`Test 6 Failed: Duplicate invitation document created! Count: ${invitationsCount}`);
      }
      console.log('  ✅ TEST 6 PASS (Idempotency verified: exactly 1 Invitation document in MongoDB)');

      // TEST 7: Creator Isolation Test
      console.log('\n[TEST 7] Creator B fetching discover campaigns (Creator Isolation)...');
      const step7Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/campaigns/discover',
        method: 'GET',
        headers: {
          'cookie': `token=${creatorBToken}`,
          'Authorization': `Bearer ${creatorBToken}`
        }
      });

      const discoveredCamp7 = (step7Res.body.data || []).find((c) => String(c._id) === String(campaign._id));
      if (!discoveredCamp7 || discoveredCamp7.hasApplied !== false) {
        throw new Error(`Test 7 Failed: Creator A's application leaked to Creator B! hasApplied: ${discoveredCamp7.hasApplied}`);
      }
      console.log('  ✅ TEST 7 PASS (Creator isolation verified: Creator B sees hasApplied: false)');

      // Clean up test data
      await User.deleteMany({ _id: { $in: [brandUser._id, creatorA._id, creatorB._id] } });
      await Campaign.deleteOne({ _id: campaign._id });
      await Invitation.deleteMany({ campaignId: campaign._id });
      await Notification.deleteMany({ senderId: { $in: [creatorA._id, creatorB._id] } });

      console.log('\n====================================================');
      console.log('🎉 E2E CREATOR EXPRESS INTEREST SUITE PASSED 100%');
      console.log('====================================================\n');
    } catch (err) {
      console.error('\n❌ TEST FAILED:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await mongoose.connection.close();
      console.log('🔌 Connections closed cleanly.');
    }
  });
};

runTest();
