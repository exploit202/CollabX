/**
 * E2E Creator Active Collaborations Verification Suite
 * Tests GET /api/creator/collaborations endpoint data format, empty state,
 * active collaboration data mapping, Creator isolation, deliverable submission,
 * and persistent stage transitions.
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Campaign = require('../src/models/campaign.model');
const Collaboration = require('../src/models/collaboration.model');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59995;

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
  console.log('🚀 COLLABX CREATOR ACTIVE COLLABORATIONS E2E SUITE');
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
    let brandUserA, creatorA, creatorB, campaign, dbCollab;

    try {
      // 1. Setup Test Users & Campaign
      brandUserA = await User.create({
        fullName: `CollabPage Brand ${timestamp}`,
        email: `brand.collab.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });

      creatorA = await User.create({
        fullName: `CollabPage Creator A ${timestamp}`,
        email: `creator.collab.a.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      creatorB = await User.create({
        fullName: `CollabPage Creator B ${timestamp}`,
        email: `creator.collab.b.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      campaign = await Campaign.create({
        title: `Active Collab Campaign ${timestamp}`,
        description: 'Test campaign for Creator Active Collaborations page verification',
        brandId: brandUserA._id,
        brandName: brandUserA.fullName,
        category: 'Tech & Gadgets',
        budget: 6500,
        status: 'active',
        isActive: true,
        targetPlatforms: ['youtube']
      });

      const brandAToken = generateToken({ userId: brandUserA._id, email: brandUserA.email, role: 'brand' });
      const creatorAToken = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });
      const creatorBToken = generateToken({ userId: creatorB._id, email: creatorB.email, role: 'creator' });

      // TEST 1: Creator A with 0 collaborations (Empty State Test)
      console.log('[TEST 1] Testing Creator A fetching empty collaborations list...');
      const emptyRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/collaborations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (emptyRes.status !== 200 || !Array.isArray(emptyRes.body.data) || emptyRes.body.data.length !== 0) {
        throw new Error(`Test 1 Failed: Expected empty array, got ${JSON.stringify(emptyRes.body)}`);
      }
      console.log('  ✅ TEST 1 PASS (Empty state returned Array [] cleanly)');

      // TEST 2: Create Active Collaboration in MongoDB
      console.log('\n[TEST 2] Creating Active Collaboration document in MongoDB Atlas...');
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 14);

      dbCollab = await Collaboration.create({
        campaignId: campaign._id,
        campaignTitle: campaign.title,
        invitationId: new mongoose.Types.ObjectId(),
        negotiationId: new mongoose.Types.ObjectId(),
        brandId: brandUserA._id,
        brandName: brandUserA.fullName,
        creatorId: creatorA._id,
        creatorName: creatorA.fullName,
        deliverableType: 'Dedicated YouTube Video',
        agreedBudget: 6500,
        agreedPrice: 6500,
        status: 'active',
        stage: 'agreement_finalized',
        startDate: new Date(),
        deadline: deadlineDate
      });
      console.log(`  ✅ TEST 2 PASS (Collaboration created: ${dbCollab._id})`);

      // TEST 3: Creator A fetches active collaborations via GET /api/creator/collaborations
      console.log('\n[TEST 3] Creator A fetching GET /api/creator/collaborations...');
      const step3Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/collaborations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (step3Res.status !== 200 || !step3Res.body.data?.length) {
        throw new Error(`Test 3 Failed: ${JSON.stringify(step3Res.body)}`);
      }

      const fetchedCollab = step3Res.body.data[0];
      const brandName = fetchedCollab.brandName || fetchedCollab.brandId?.fullName || fetchedCollab.brandId?.name;
      const campaignTitle = fetchedCollab.campaignTitle || fetchedCollab.campaignId?.title;

      if (
        String(fetchedCollab._id) !== String(dbCollab._id) ||
        fetchedCollab.agreedBudget !== 6500 ||
        brandName !== brandUserA.fullName
      ) {
        throw new Error(`Test 3 Failed: Field mapping error in response: ${JSON.stringify(fetchedCollab)}`);
      }
      console.log(`  ✅ TEST 3 PASS (Creator A retrieved active collaboration: ${campaignTitle}, $${fetchedCollab.agreedBudget})`);

      // TEST 4: Creator B fetches active collaborations (Creator Isolation)
      console.log('\n[TEST 4] Testing Creator Isolation for Creator B...');
      const step4Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/collaborations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorBToken}` }
      });
      if (step4Res.status !== 200 || step4Res.body.data?.length !== 0) {
        throw new Error(`Test 4 Failed: Isolation breach! Creator B received: ${JSON.stringify(step4Res.body)}`);
      }
      console.log('  ✅ TEST 4 PASS (Creator B received Array [], security isolation verified)');

      // TEST 5: Creator A submits deliverables
      console.log('\n[TEST 5] Creator A submitting draft content deliverables...');
      const submitRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/collaborations/${dbCollab._id}/submit`,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorAToken}` }
        },
        {
          contentUrl: 'https://youtube.com/watch?v=unlisted_draft_preview',
          submissionNotes: 'Unlisted video ready for brand approval'
        }
      );
      if (submitRes.status !== 200 || submitRes.body.data?.status !== 'content_submitted') {
        throw new Error(`Test 5 Failed: Deliverable submission failed: ${JSON.stringify(submitRes.body)}`);
      }
      console.log('  ✅ TEST 5 PASS (Deliverables submitted, stage updated to content_submitted)');

      // TEST 6: Creator A re-fetches active collaborations
      console.log('\n[TEST 6] Creator A re-fetching active collaborations (State Persistence)...');
      const step6Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/collaborations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      const reFetchedCollab = step6Res.body.data[0];
      if (reFetchedCollab.submissionUrl !== 'https://youtube.com/watch?v=unlisted_draft_preview') {
        throw new Error(`Test 6 Failed: Submission URL missing: ${JSON.stringify(reFetchedCollab)}`);
      }
      console.log('  ✅ TEST 6 PASS (Submitted content URL & state persistent)');

      // Clean up temporary test data
      await User.deleteMany({ _id: { $in: [brandUserA._id, creatorA._id, creatorB._id] } });
      await Campaign.deleteOne({ _id: campaign._id });
      await Collaboration.deleteOne({ _id: dbCollab._id });

      console.log('\n====================================================');
      console.log('🎉 CREATOR ACTIVE COLLABORATIONS SUITE PASSED 100%');
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
