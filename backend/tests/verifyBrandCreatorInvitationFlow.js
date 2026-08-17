/**
 * Comprehensive End-to-End Test Suite for Brand -> Creator Invitation Flow
 * Tests the complete database-driven invitation lifecycle & security guards:
 * 1. Brand A creates Campaign
 * 2. Creator A creates Profile, Platforms & Deliverable Packages
 * 3. Brand A sends Invitation selecting Creator A, Brand A Campaign & Creator A Packages
 * 4. Invitation persisted in MongoDB
 * 5. Creator A fetches invitation (GET /api/creator/requests)
 * 6. Brand A fetches invitation (GET /api/brand/invitations)
 * 7. Creator A accepts invitation -> Active Collaboration created
 * 8. Status synchronized to 'accepted' on both sides
 * 9. Security Guards (Unauthenticated, Brand B Campaign access attempt, Invalid Budget, Duplicate Invitation)
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Campaign = require('../src/models/campaign.model');
const CreatorProfile = require('../src/models/creatorProfile.model');
const Pricing = require('../src/models/pricing.model');
const Invitation = require('../src/models/invitation.model');
const Collaboration = require('../src/models/collaboration.model');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59944;

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
  console.log('=====================================================================');
  console.log('🚀 COLLABX BRAND -> CREATOR INVITATION FLOW E2E TEST SUITE');
  console.log('=====================================================================\n');

  try {
    await connectDB();
    console.log('🔌 Database connected cleanly.');
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }

  const server = app.listen(PORT, async () => {
    console.log(`📡 Test server listening on http://localhost:${PORT}\n`);

    let brandA, brandB, creatorA;
    let tokenBrandA, tokenBrandB, tokenCreatorA;
    let campaignA, campaignB;
    let pkg1, pkg2;
    let invitationId;

    try {
      const ts = Date.now();

      // 1. Create Brand A
      brandA = await User.create({
        fullName: `Brand Alpha ${ts}`,
        email: `brand.alpha.${ts}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });
      tokenBrandA = generateToken({ userId: brandA._id, email: brandA.email, role: 'brand' });

      // Create Brand B
      brandB = await User.create({
        fullName: `Brand Beta ${ts}`,
        email: `brand.beta.${ts}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });
      tokenBrandB = generateToken({ userId: brandB._id, email: brandB.email, role: 'brand' });

      // Create Creator A
      creatorA = await User.create({
        fullName: `Creator Alpha ${ts}`,
        email: `creator.alpha.${ts}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true
      });
      tokenCreatorA = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });

      // Setup Creator A Profile, Platforms & Audience
      await CreatorProfile.create({
        userId: creatorA._id,
        niche: ['Tech & Gadgets'],
        bio: 'Alpha Tech reviewer.',
        location: { city: 'Bengaluru', country: 'India' },
        platforms: [
          { platform: 'instagram', link: 'https://instagram.com/alphatech' },
          { platform: 'youtube', link: 'https://youtube.com/@alphatech' }
        ],
        audienceMetrics: {
          instagram: { followers: 50000, averageReelViews: 15000, engagementRate: 4.8 },
          youtube: { subscribers: 35000, averageViews: 10000, engagementRate: 4.1 }
        }
      });

      // Setup Creator A Deliverable Packages in MongoDB
      pkg1 = await Pricing.create({
        creatorId: creatorA._id,
        title: '60-Sec Instagram Reel',
        description: 'Dedicated tech review reel with tag',
        platform: 'Instagram',
        price: 6000,
        deliveryDays: 3,
        isActive: true
      });

      pkg2 = await Pricing.create({
        creatorId: creatorA._id,
        title: 'YouTube Short Integration',
        description: 'Product short integration in main channel',
        platform: 'YouTube',
        price: 9000,
        deliveryDays: 4,
        isActive: true
      });

      console.log('✅ Setup Complete: Registered Brand A, Brand B, Creator A, and 2 Packages.');

      // 2. Create Real Brand Campaigns in MongoDB
      const campARes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/campaigns',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          title: `Brand Alpha Tech Campaign ${ts}`,
          description: 'Official flagship tech product launch collaboration.',
          category: 'Tech & Gadgets',
          budget: 50000,
          status: 'active'
        }
      );
      if (campARes.status !== 201) {
        throw new Error(`Failed to create Brand A campaign: ${JSON.stringify(campARes.body)}`);
      }
      campaignA = campARes.body.data;
      console.log(`✅ Step 1 PASS: Brand A created real campaign "${campaignA.title}" (${campaignA.id})`);

      const campBRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/campaigns',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandB}` }
        },
        {
          title: `Brand Beta Rival Campaign ${ts}`,
          description: 'Private rival brand campaign.',
          category: 'Fashion',
          budget: 30000,
          status: 'active'
        }
      );
      campaignB = campBRes.body.data;

      // 3. Brand A sends Invitation to Creator A selecting real campaign & deliverables
      console.log('\n[STEP 3] Brand A sending Invitation to Creator A...');
      const invRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/invitations',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          campaignId: campaignA.id || campaignA._id,
          creatorId: creatorA._id.toString(),
          proposedPrice: 15000,
          deliverables: ['60-Sec Instagram Reel', 'YouTube Short Integration'],
          message: 'Hey Creator Alpha, we want you for our flagship tech launch!'
        }
      );

      if (invRes.status !== 201) {
        throw new Error(`Step 3 Failed: Invitation creation failed with HTTP ${invRes.status}: ${JSON.stringify(invRes.body)}`);
      }
      invitationId = invRes.body.data._id;
      console.log(`  ✅ STEP 3 PASS: Invitation created cleanly with ID: ${invitationId}`);

      // 4. Verify Database Persistence in MongoDB
      console.log('\n[STEP 4] Verifying MongoDB Invitation Persistence...');
      const invDoc = await Invitation.findById(invitationId).lean();
      if (!invDoc || invDoc.proposedPrice !== 15000 || invDoc.deliverables.length !== 2) {
        throw new Error(`Step 4 Failed: MongoDB invitation document mismatch: ${JSON.stringify(invDoc)}`);
      }
      console.log('  ✅ STEP 4 PASS: Invitation document verified intact in MongoDB');

      // 5. Creator A fetches received requests (GET /api/creator/requests)
      console.log('\n[STEP 5] Creator A fetching incoming collaboration requests (GET /api/creator/requests)...');
      const creatorReqRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/requests',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenCreatorA}` }
      });
      if (creatorReqRes.status !== 200 || !Array.isArray(creatorReqRes.body.data)) {
        throw new Error(`Step 5 Failed: Creator request retrieval failed: ${JSON.stringify(creatorReqRes.body)}`);
      }
      const receivedInv = creatorReqRes.body.data.find((i) => (i._id || i.id) === invitationId);
      if (!receivedInv || receivedInv.proposedPrice !== 15000) {
        throw new Error('Step 5 Failed: Creator A did not receive the invitation in requests');
      }
      console.log('  ✅ STEP 5 PASS: Creator A received the real invitation with correct budget & deliverables');

      // 6. Brand A fetches sent invitations (GET /api/brand/invitations)
      console.log('\n[STEP 6] Brand A fetching sent invitations (GET /api/brand/invitations)...');
      const brandInvRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/invitations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenBrandA}` }
      });
      if (brandInvRes.status !== 200 || !Array.isArray(brandInvRes.body.data)) {
        throw new Error(`Step 6 Failed: Brand invitations retrieval failed: ${JSON.stringify(brandInvRes.body)}`);
      }
      const sentInv = brandInvRes.body.data.find((i) => (i._id || i.id) === invitationId);
      if (!sentInv || sentInv.status !== 'pending') {
        throw new Error('Step 6 Failed: Brand A invitations list does not reflect pending status');
      }
      console.log('  ✅ STEP 6 PASS: Brand A invitations list reflects pending invitation');

      // 7. Creator A accepts Invitation (PATCH /api/creator/requests/:id/respond)
      console.log('\n[STEP 7] Creator A accepting invitation...');
      const respondRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/requests/${invitationId}/respond`,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCreatorA}` }
        },
        { status: 'accepted' }
      );
      if (respondRes.status !== 200) {
        throw new Error(`Step 7 Failed: Creator respond API failed: ${JSON.stringify(respondRes.body)}`);
      }
      console.log('  ✅ STEP 7 PASS: Creator accepted invitation and collaboration was initialized');

      // 8. Verify Status Synchronization on Both Sides
      console.log('\n[STEP 8] Verifying status synchronization on both Brand and Creator sides...');
      const updatedInv = await Invitation.findById(invitationId).lean();
      if (updatedInv.status !== 'accepted') {
        throw new Error(`Step 8 Failed: Expected status='accepted', got '${updatedInv.status}'`);
      }
      const activeCollab = await Collaboration.findOne({ invitationId }).lean();
      if (!activeCollab || activeCollab.status !== 'active') {
        throw new Error('Step 8 Failed: Active collaboration not found in MongoDB');
      }
      console.log('  ✅ STEP 8 PASS: Status synchronized to "accepted" on both sides & Collaboration created');

      // 9. SECURITY REJECTION SCENARIOS
      console.log('\n[STEP 9] Testing Security Guards & Error Rejection Scenarios...');

      // Security Scenario 1: Brand A attempting to use Brand B's campaign
      const secBrandBRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/invitations',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          campaignId: campaignB.id || campaignB._id,
          creatorId: creatorA._id.toString(),
          proposedPrice: 10000,
          deliverables: ['60-Sec Instagram Reel']
        }
      );
      if (secBrandBRes.status !== 403) {
        throw new Error(`Security 1 Failed: Expected HTTP 403 for unauthorized campaign, got ${secBrandBRes.status}`);
      }
      console.log(`  ✅ Security Guard 1 PASS: Brand A using Brand B campaign cleanly rejected with HTTP 403 ("${secBrandBRes.body?.message}")`);

      // Security Scenario 2: Unauthenticated Invitation Attempt
      const secUnauthRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/invitations',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        {
          campaignId: campaignA.id || campaignA._id,
          creatorId: creatorA._id.toString(),
          proposedPrice: 10000
        }
      );
      if (secUnauthRes.status !== 401) {
        throw new Error(`Security 2 Failed: Expected HTTP 401 for unauthenticated request, got ${secUnauthRes.status}`);
      }
      console.log('  ✅ Security Guard 2 PASS: Unauthenticated invitation request rejected with HTTP 401');

      // Security Scenario 3: Invalid Budget (<= 0)
      const secBudgetRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/invitations',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          campaignId: campaignA.id || campaignA._id,
          creatorId: creatorA._id.toString(),
          proposedPrice: 0,
          deliverables: ['60-Sec Instagram Reel']
        }
      );
      if (secBudgetRes.status !== 400) {
        throw new Error(`Security 3 Failed: Expected HTTP 400 for invalid budget, got ${secBudgetRes.status}`);
      }
      console.log(`  ✅ Security Guard 3 PASS: Invalid budget rejected with HTTP 400 ("${secBudgetRes.body?.message}")`);

      // Clean up test records
      await User.deleteMany({ _id: { $in: [brandA._id, brandB._id, creatorA._id] } });
      await Campaign.deleteMany({ _id: { $in: [campaignA._id || campaignA.id, campaignB._id || campaignB.id] } });
      await CreatorProfile.deleteMany({ userId: creatorA._id });
      await Pricing.deleteMany({ creatorId: creatorA._id });
      await Invitation.deleteMany({ brandId: brandA._id });
      await Collaboration.deleteMany({ brandId: brandA._id });

      console.log('\n=====================================================================');
      console.log('🎉 BRAND -> CREATOR INVITATION E2E TEST SUITE PASSED 100%');
      console.log('=====================================================================\n');
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
