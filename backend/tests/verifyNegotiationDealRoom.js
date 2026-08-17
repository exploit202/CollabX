/**
 * E2E Negotiation / Deal Room Architecture Verification Suite
 * Tests Creator interest creation, Invitation persistence, Deal Room creation,
 * Creator/Brand shared negotiation access, Security isolation, Offer/Counter-offer
 * exchange persistence, and Idempotency (no duplicate negotiations).
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Campaign = require('../src/models/campaign.model');
const Invitation = require('../src/models/invitation.model');
const Negotiation = require('../src/models/negotiation.model');
const Notification = require('../src/models/notification.model');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59997;

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
  console.log('🚀 COLLABX NEGOTIATION / DEAL ROOM E2E TEST SUITE');
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
    let brandUserA, brandUserB, creatorA, creatorB, campaign;

    try {
      // 1. Setup Test Users & Campaign
      brandUserA = await User.create({
        fullName: `DealRoom Brand A ${timestamp}`,
        email: `brand.a.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });

      brandUserB = await User.create({
        fullName: `DealRoom Brand B ${timestamp}`,
        email: `brand.b.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });

      creatorA = await User.create({
        fullName: `DealRoom Creator A ${timestamp}`,
        email: `creator.a.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      creatorB = await User.create({
        fullName: `DealRoom Creator B ${timestamp}`,
        email: `creator.b.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      campaign = await Campaign.create({
        title: `Flagship Negotiation Campaign ${timestamp}`,
        description: 'Test campaign for negotiation deal room validation',
        brandId: brandUserA._id,
        brandName: brandUserA.fullName,
        category: 'Tech & Gadgets',
        budget: 4500,
        status: 'active',
        isActive: true,
        targetPlatforms: ['instagram', 'youtube']
      });

      const brandAToken = generateToken({ userId: brandUserA._id, email: brandUserA.email, role: 'brand' });
      const brandBToken = generateToken({ userId: brandUserB._id, email: brandUserB.email, role: 'brand' });
      const creatorAToken = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });
      const creatorBToken = generateToken({ userId: creatorB._id, email: creatorB.email, role: 'creator' });

      // TEST 1: Creator A discovers campaign
      console.log('[TEST 1] Creator A discovering active campaign...');
      const step1Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/campaigns/discover',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (step1Res.status !== 200) throw new Error(`Test 1 Failed: ${JSON.stringify(step1Res.body)}`);
      console.log('  ✅ TEST 1 PASS (Campaign discovered)');

      // TEST 2: Creator A expresses interest
      console.log('\n[TEST 2] Creator A expressing interest in campaign...');
      const step2Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/creator/campaigns/${campaign._id}/express-interest`,
        method: 'POST',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (step2Res.status !== 200) throw new Error(`Test 2 Failed: ${JSON.stringify(step2Res.body)}`);
      console.log('  ✅ TEST 2 PASS (Express interest successful)');

      // TEST 3: Verify Invitation document in MongoDB
      console.log('\n[TEST 3] Verifying Invitation document in MongoDB...');
      const invitation = await Invitation.findOne({ campaignId: campaign._id, creatorId: creatorA._id });
      if (!invitation) throw new Error('Test 3 Failed: Invitation document not found in MongoDB');
      console.log(`  ✅ TEST 3 PASS (Invitation document verified: ${invitation._id})`);

      // TEST 4: Brand A retrieves invitation
      console.log('\n[TEST 4] Brand A retrieving invitations...');
      const step4Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/invitations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${brandAToken}` }
      });
      if (step4Res.status !== 200) throw new Error(`Test 4 Failed: ${JSON.stringify(step4Res.body)}`);
      console.log('  ✅ TEST 4 PASS (Brand A retrieved invitation)');

      // TEST 5: Creator A opens Deal Room (status: negotiating)
      console.log('\n[TEST 5] Creator A responding with status=negotiating...');
      const step5Res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/requests/${invitation._id}/respond`,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorAToken}` }
        },
        { status: 'negotiating' }
      );
      if (step5Res.status !== 200 || !step5Res.body.data?.negotiation) {
        throw new Error(`Test 5 Failed: ${JSON.stringify(step5Res.body)}`);
      }
      const negotiationFromStep5 = step5Res.body.data.negotiation;
      console.log(`  ✅ TEST 5 PASS (Deal Room created/opened, negotiation ID: ${negotiationFromStep5._id})`);

      // TEST 6: Verify Negotiation document in MongoDB
      console.log('\n[TEST 6] Verifying Negotiation document in MongoDB...');
      const dbNegotiation = await Negotiation.findById(negotiationFromStep5._id);
      if (!dbNegotiation || dbNegotiation.status !== 'open') {
        throw new Error(`Test 6 Failed: Invalid negotiation document in MongoDB: ${JSON.stringify(dbNegotiation)}`);
      }
      console.log(`  ✅ TEST 6 PASS (MongoDB Negotiation verified, status: ${dbNegotiation.status})`);

      // TEST 7: Creator A retrieves negotiation
      console.log('\n[TEST 7] Creator A fetching GET /api/creator/negotiations...');
      const step7Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/negotiations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (step7Res.status !== 200 || !step7Res.body.data?.length) {
        throw new Error(`Test 7 Failed: Creator A retrieved 0 negotiations: ${JSON.stringify(step7Res.body)}`);
      }
      const creatorNegotiationItem = step7Res.body.data[0];
      if (['open', 'active', 'pending', 'in_progress'].indexOf(creatorNegotiationItem.status) === -1) {
        throw new Error(`Test 7 Failed: Unexpected negotiation status: ${creatorNegotiationItem.status}`);
      }
      console.log('  ✅ TEST 7 PASS (Creator A retrieved active negotiation)');

      // TEST 8: Brand A retrieves same negotiation
      console.log('\n[TEST 8] Brand A fetching GET /api/brand/negotiations...');
      const step8Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/negotiations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${brandAToken}` }
      });
      if (step8Res.status !== 200 || !step8Res.body.data?.length) {
        throw new Error(`Test 8 Failed: Brand A retrieved 0 negotiations: ${JSON.stringify(step8Res.body)}`);
      }
      const brandNegotiationItem = step8Res.body.data[0];
      console.log('  ✅ TEST 8 PASS (Brand A retrieved active negotiation)');

      // TEST 9: Verify BOTH Creator A and Brand A see the EXACT SAME negotiation document
      console.log('\n[TEST 9] Verifying Creator A and Brand A share the EXACT SAME negotiation...');
      if (String(creatorNegotiationItem._id) !== String(brandNegotiationItem._id)) {
        throw new Error(`Test 9 Failed: ID Mismatch! Creator: ${creatorNegotiationItem._id}, Brand: ${brandNegotiationItem._id}`);
      }
      console.log('  ✅ TEST 9 PASS (Creator A and Brand A share identical Negotiation ID)');

      // TEST 10: Security & Ownership Isolation
      console.log('\n[TEST 10] Testing Security Isolation for Creator B and Brand B...');
      const step10Creator = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/negotiations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorBToken}` }
      });
      const step10Brand = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/negotiations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${brandBToken}` }
      });

      if (step10Creator.body.data?.length !== 0 || step10Brand.body.data?.length !== 0) {
        throw new Error('Test 10 Failed: Negotiation leaked to unauthorized users!');
      }
      console.log('  ✅ TEST 10 PASS (Security isolation verified: 0 negotiations returned for non-participants)');

      // TEST 11: Refresh Persistence
      console.log('\n[TEST 11] Testing Refresh Persistence across multiple GET calls...');
      const step11Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/negotiations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (!step11Res.body.data || step11Res.body.data.length === 0) {
        throw new Error('Test 11 Failed: Negotiation state lost after re-fetch');
      }
      console.log('  ✅ TEST 11 PASS (Negotiation state persistent across re-fetches)');

      // TEST 12: Offer / Counter-Offer Exchange Persistence
      console.log('\n[TEST 12] Testing Offer / Counter-Offer Submission & History Persistence...');
      // Creator submits counter offer $5000
      const counterRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/negotiations/${dbNegotiation._id}/offers`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorAToken}` }
        },
        { proposedPrice: 5000, notes: 'Creator counter offer for $5000' }
      );
      if (counterRes.status !== 200 || !counterRes.body.success) {
        throw new Error(`Test 12 Counter Offer Failed: ${JSON.stringify(counterRes.body)}`);
      }

      // Brand fetches updated negotiation
      const brandRefreshRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/brand/negotiations/${dbNegotiation._id}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${brandAToken}` }
      });

      const updatedNeg = brandRefreshRes.body.data;
      if (updatedNeg.currentBudget !== 5000 || updatedNeg.offers.length < 2) {
        throw new Error(`Test 12 Failed: Counter offer not persisted! Offers length: ${updatedNeg?.offers?.length}`);
      }
      console.log('  ✅ TEST 12 PASS (Counter offer of $5000 persisted into negotiation history)');

      // TEST 13: Idempotency Protection (No Duplicate Negotiations)
      console.log('\n[TEST 13] Opening Deal Room repeatedly (Idempotency Test)...');
      const createAgainRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/negotiations',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${brandAToken}` }
        },
        { invitationId: invitation._id }
      );
      const negotiationCount = await Negotiation.countDocuments({ invitationId: invitation._id });
      if (negotiationCount !== 1) {
        throw new Error(`Test 13 Failed: Duplicate negotiations created! Count: ${negotiationCount}`);
      }
      console.log('  ✅ TEST 13 PASS (Idempotency verified: exactly 1 Negotiation document in MongoDB)');

      // Clean up test data
      await User.deleteMany({ _id: { $in: [brandUserA._id, brandUserB._id, creatorA._id, creatorB._id] } });
      await Campaign.deleteOne({ _id: campaign._id });
      await Invitation.deleteMany({ campaignId: campaign._id });
      await Negotiation.deleteMany({ campaignId: campaign._id });
      await Notification.deleteMany({ senderId: { $in: [creatorA._id, brandUserA._id] } });

      console.log('\n====================================================');
      console.log('🎉 E2E NEGOTIATION DEAL ROOM SUITE PASSED 100%');
      console.log('====================================================\n');
    } catch (err) {
      console.error('\n❌ E2E TEST FAILED:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await mongoose.connection.close();
      console.log('🔌 Connections closed cleanly.');
    }
  });
};

runTest();
