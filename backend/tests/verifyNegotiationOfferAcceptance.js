/**
 * E2E Negotiation Offer Acceptance & Collaboration Activation Verification Suite
 * Tests full negotiation offer/counter-offer exchange ($5000 -> $7000 -> $6000),
 * Accept offer execution, Negotiation status transition ('agreed'), Invitation status update ('accepted'),
 * Active Collaboration creation in MongoDB with final agreed price ($6000),
 * Security isolation, and Refresh persistence on both Creator and Brand sides.
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
const Collaboration = require('../src/models/collaboration.model');
const Notification = require('../src/models/notification.model');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59996;

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
  console.log('🚀 COLLABX OFFER ACCEPTANCE & COLLABORATION E2E SUITE');
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
    let brandUserA, brandUserB, creatorA, creatorB, campaign, invitation, dbNegotiation;

    try {
      // 1. Setup Test Users & Campaign
      brandUserA = await User.create({
        fullName: `AcceptFlow Brand A ${timestamp}`,
        email: `brand.accept.a.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });

      brandUserB = await User.create({
        fullName: `AcceptFlow Brand B ${timestamp}`,
        email: `brand.accept.b.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });

      creatorA = await User.create({
        fullName: `AcceptFlow Creator A ${timestamp}`,
        email: `creator.accept.a.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      creatorB = await User.create({
        fullName: `AcceptFlow Creator B ${timestamp}`,
        email: `creator.accept.b.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      campaign = await Campaign.create({
        title: `Offer Acceptance Campaign ${timestamp}`,
        description: 'Test campaign for negotiation offer acceptance flow',
        brandId: brandUserA._id,
        brandName: brandUserA.fullName,
        category: 'Tech & Gadgets',
        budget: 5000,
        status: 'active',
        isActive: true,
        targetPlatforms: ['instagram']
      });

      const brandAToken = generateToken({ userId: brandUserA._id, email: brandUserA.email, role: 'brand' });
      const brandBToken = generateToken({ userId: brandUserB._id, email: brandUserB.email, role: 'brand' });
      const creatorAToken = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });
      const creatorBToken = generateToken({ userId: creatorB._id, email: creatorB.email, role: 'creator' });

      // TEST 1: Creator A Express Interest
      console.log('[TEST 1] Creator A expressing interest in campaign...');
      const expressRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/creator/campaigns/${campaign._id}/express-interest`,
        method: 'POST',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (expressRes.status !== 200) throw new Error(`Test 1 Failed: ${JSON.stringify(expressRes.body)}`);
      
      invitation = await Invitation.findOne({ campaignId: campaign._id, creatorId: creatorA._id });
      if (!invitation) throw new Error('Test 1 Failed: Invitation document not found');
      console.log(`  ✅ TEST 1 PASS (Invitation created: ${invitation._id})`);

      // TEST 2: Brand A Opens Deal Room ($5,000 initial offer)
      console.log('\n[TEST 2] Brand A opening Deal Room ($5,000 initial offer)...');
      const createNegRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/negotiations',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${brandAToken}` }
        },
        { invitationId: invitation._id }
      );
      if (createNegRes.status !== 201 && createNegRes.status !== 200) {
        throw new Error(`Test 2 Failed: ${JSON.stringify(createNegRes.body)}`);
      }
      dbNegotiation = createNegRes.body.data;
      console.log(`  ✅ TEST 2 PASS (Negotiation created: ${dbNegotiation._id}, initial offer: $${dbNegotiation.currentBudget})`);

      // TEST 3: Creator A counters with $7,000
      console.log('\n[TEST 3] Creator A submitting counter offer of $7,000...');
      const counter1Res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/negotiations/${dbNegotiation._id}/offers`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorAToken}` }
        },
        { proposedPrice: 7000, notes: 'Counter offer: I can do it for $7,000' }
      );
      if (counter1Res.status !== 200) throw new Error(`Test 3 Failed: ${JSON.stringify(counter1Res.body)}`);
      console.log('  ✅ TEST 3 PASS (Creator A counter offer $7,000 submitted)');

      // TEST 4: Brand A counters with $6,000
      console.log('\n[TEST 4] Brand A submitting counter offer of $6,000...');
      const counter2Res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/brand/negotiations/${dbNegotiation._id}/offers`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${brandAToken}` }
        },
        { proposedPrice: 6000, notes: 'Counter offer: How about $6,000?' }
      );
      if (counter2Res.status !== 200) throw new Error(`Test 4 Failed: ${JSON.stringify(counter2Res.body)}`);
      console.log('  ✅ TEST 4 PASS (Brand A counter offer $6,000 submitted)');

      // TEST 5: Creator A accepts $6,000 offer
      console.log('\n[TEST 5] Creator A accepting Brand A\'s $6,000 offer...');
      const acceptRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/negotiations/${dbNegotiation._id}/accept`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorAToken}` }
        },
        {}
      );
      if (acceptRes.status !== 200 || !acceptRes.body.success) {
        throw new Error(`Test 5 Failed: Accept offer failed: ${JSON.stringify(acceptRes.body)}`);
      }
      console.log('  ✅ TEST 5 PASS (Creator A accepted $6,000 offer)');

      // TEST 6: Verify MongoDB Negotiation & Invitation state
      console.log('\n[TEST 6] Inspecting MongoDB Negotiation & Invitation status...');
      const updatedNeg = await Negotiation.findById(dbNegotiation._id);
      const updatedInv = await Invitation.findById(invitation._id);

      if (updatedNeg.status !== 'agreed' || updatedNeg.agreedBudget !== 6000) {
        throw new Error(`Test 6 Failed: Invalid Negotiation state: status=${updatedNeg.status}, agreedBudget=${updatedNeg.agreedBudget}`);
      }
      if (updatedInv.status !== 'accepted') {
        throw new Error(`Test 6 Failed: Invalid Invitation status: ${updatedInv.status}`);
      }
      console.log(`  ✅ TEST 6 PASS (Negotiation status: 'agreed', agreedBudget: $${updatedNeg.agreedBudget}, Invitation status: 'accepted')`);

      // TEST 7: Verify Active Collaboration creation in MongoDB
      console.log('\n[TEST 7] Inspecting MongoDB Active Collaboration document...');
      const dbCollab = await Collaboration.findOne({ invitationId: invitation._id });
      if (!dbCollab || dbCollab.status !== 'active' || dbCollab.agreedBudget !== 6000) {
        throw new Error(`Test 7 Failed: Invalid Collaboration document: ${JSON.stringify(dbCollab)}`);
      }
      console.log(`  ✅ TEST 7 PASS (Active Collaboration created: ${dbCollab._id}, status: '${dbCollab.status}', agreedBudget: $${dbCollab.agreedBudget})`);

      // TEST 8: Creator A & Brand A fetch Active Collaborations via API
      console.log('\n[TEST 8] Creator A & Brand A fetching active collaborations via API...');
      const creatorCollabRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/collaborations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      const brandCollabRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/collaborations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${brandAToken}` }
      });

      if (!creatorCollabRes.body.data?.length || !brandCollabRes.body.data?.length) {
        throw new Error('Test 8 Failed: Collaboration not visible to both participants!');
      }
      console.log('  ✅ TEST 8 PASS (Active collaboration visible to both Creator A and Brand A)');

      // TEST 9: Idempotency & Stale Acceptance Protection
      console.log('\n[TEST 9] Testing Idempotency on repeated Accept call...');
      const repeatAcceptRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/negotiations/${dbNegotiation._id}/accept`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorAToken}` }
        },
        {}
      );
      if (repeatAcceptRes.status !== 200) {
        throw new Error(`Test 9 Failed: ${JSON.stringify(repeatAcceptRes.body)}`);
      }
      const collabCount = await Collaboration.countDocuments({ invitationId: invitation._id });
      if (collabCount !== 1) {
        throw new Error(`Test 9 Failed: Duplicate collaborations created! Count: ${collabCount}`);
      }
      console.log('  ✅ TEST 9 PASS (Idempotency verified: exactly 1 Collaboration document in MongoDB)');

      // TEST 10: Security & Access Control Guard
      console.log('\n[TEST 10] Testing Security Isolation for Creator B...');
      const secRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/negotiations/${dbNegotiation._id}/accept`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorBToken}` }
        },
        {}
      );
      if (secRes.status !== 403) {
        throw new Error(`Test 10 Failed: Expected 403 Forbidden, got ${secRes.status}`);
      }
      console.log('  ✅ TEST 10 PASS (Non-participant accept attempt rejected with HTTP 403 Forbidden)');

      // Clean up temporary test data
      await User.deleteMany({ _id: { $in: [brandUserA._id, brandUserB._id, creatorA._id, creatorB._id] } });
      await Campaign.deleteOne({ _id: campaign._id });
      await Invitation.deleteMany({ campaignId: campaign._id });
      await Negotiation.deleteMany({ campaignId: campaign._id });
      await Collaboration.deleteMany({ campaignId: campaign._id });
      await Notification.deleteMany({ senderId: { $in: [creatorA._id, brandUserA._id] } });

      console.log('\n====================================================');
      console.log('🎉 OFFER ACCEPTANCE & COLLABORATION SUITE PASSED 100%');
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
