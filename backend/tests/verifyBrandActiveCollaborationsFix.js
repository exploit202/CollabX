/**
 * Comprehensive Test Suite for Brand Active Collaborations Campaign Name & Deadline Fixes
 * Verifies:
 * 1. Brand A creates 2 distinct campaigns with different names & deadlines:
 *    - Campaign 1: "Indus Pro Dock - Smart Thunderbolt Dock Launch" (Deadline: 2026-08-28)
 *    - Campaign 2: "ZenBook OLED Creative Series Promotion" (Deadline: 2026-09-14)
 * 2. Creator A accepts invitations for both campaigns, creating 2 active collaborations.
 * 3. GET /api/brand/collaborations returns:
 *    - Collab 1: campaignTitle = "Indus Pro Dock - Smart Thunderbolt Dock Launch", deadline = 2026-08-28
 *    - Collab 2: campaignTitle = "ZenBook OLED Creative Series Promotion", deadline = 2026-09-14
 * 4. Zero hard-coded campaign names or "Open" deadlines.
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

const PORT = 59933;

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
  console.log('🚀 COLLABX BRAND ACTIVE COLLABORATIONS & ESCROW FIX TEST SUITE');
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

    let brandA, creatorA;
    let tokenBrandA, tokenCreatorA;
    let campaign1, campaign2;
    let inv1, inv2;

    try {
      const ts = Date.now();

      // 1. Create Brand A & Creator A
      brandA = await User.create({
        fullName: `Hardware Brand ${ts}`,
        email: `hardware.${ts}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });
      tokenBrandA = generateToken({ userId: brandA._id, email: brandA.email, role: 'brand' });

      creatorA = await User.create({
        fullName: `Reviewer Creator ${ts}`,
        email: `reviewer.${ts}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true
      });
      tokenCreatorA = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });

      await CreatorProfile.create({
        userId: creatorA._id,
        niche: ['Tech & Gadgets'],
        bio: 'Tech Hardware Reviewer',
        location: { city: 'Pune', country: 'India' },
        platforms: [{ platform: 'youtube', link: 'https://youtube.com/@reviewer' }]
      });

      await Pricing.create({
        creatorId: creatorA._id,
        title: 'Dedicated Hardware Video',
        description: 'Dedicated YouTube hardware review video',
        platform: 'YouTube',
        price: 25000,
        deliveryDays: 5,
        isActive: true
      });

      // 2. Create Campaign 1 with deadline 2026-08-28
      const deadline1 = new Date('2026-08-28T00:00:00.000Z');
      const camp1Res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/campaigns',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          title: 'Indus Pro Dock - Smart Thunderbolt Dock Launch',
          description: 'High-end Thunderbolt dock launch campaign.',
          category: 'Tech & Gadgets',
          budget: 50000,
          deadline: deadline1,
          status: 'active'
        }
      );
      if (camp1Res.status !== 201) throw new Error(`Failed to create Campaign 1: ${JSON.stringify(camp1Res.body)}`);
      campaign1 = camp1Res.body.data;

      // 3. Create Campaign 2 with deadline 2026-09-14
      const deadline2 = new Date('2026-09-14T00:00:00.000Z');
      const camp2Res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/campaigns',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          title: 'ZenBook OLED Creative Series Promotion',
          description: 'OLED Laptop promotional campaign.',
          category: 'Tech & Gadgets',
          budget: 75000,
          deadline: deadline2,
          status: 'active'
        }
      );
      if (camp2Res.status !== 201) throw new Error(`Failed to create Campaign 2: ${JSON.stringify(camp2Res.body)}`);
      campaign2 = camp2Res.body.data;

      console.log('✅ Created 2 distinct Brand A campaigns:');
      console.log(`   - Campaign 1: "${campaign1.title}" (Deadline: 2026-08-28)`);
      console.log(`   - Campaign 2: "${campaign2.title}" (Deadline: 2026-09-14)`);

      // 4. Send Invitations for both campaigns
      const inv1Res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/invitations',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          campaignId: campaign1.id || campaign1._id,
          creatorId: creatorA._id.toString(),
          proposedPrice: 25000,
          deliverables: ['Dedicated Hardware Video'],
          message: 'Invitation for Indus Pro Dock'
        }
      );
      inv1 = inv1Res.body.data;

      const inv2Res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/invitations',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          campaignId: campaign2.id || campaign2._id,
          creatorId: creatorA._id.toString(),
          proposedPrice: 35000,
          deliverables: ['Dedicated Hardware Video'],
          message: 'Invitation for ZenBook OLED'
        }
      );
      inv2 = inv2Res.body.data;

      // 5. Creator A accepts both invitations
      await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/requests/${inv1._id}/respond`,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCreatorA}` }
        },
        { status: 'accepted' }
      );

      await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/requests/${inv2._id}/respond`,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCreatorA}` }
        },
        { status: 'accepted' }
      );

      console.log('\n[STEP 6] Fetching Brand Active Collaborations (GET /api/brand/collaborations)...');
      const collabRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/collaborations',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenBrandA}` }
      });

      if (collabRes.status !== 200 || !Array.isArray(collabRes.body.data)) {
        throw new Error(`Failed to fetch brand collaborations: ${JSON.stringify(collabRes.body)}`);
      }

      const collabs = collabRes.body.data;
      if (collabs.length !== 2) {
        throw new Error(`Expected 2 active collaborations, got ${collabs.length}`);
      }

      const c1 = collabs.find((c) => (c.campaignId?._id || c.campaignId) === (campaign1.id || campaign1._id));
      const c2 = collabs.find((c) => (c.campaignId?._id || c.campaignId) === (campaign2.id || campaign2._id));

      if (!c1) throw new Error('Collaboration 1 not found in response payload');
      if (!c2) throw new Error('Collaboration 2 not found in response payload');

      // Verify Campaign 1 Title & Deadline
      console.log(`\n  🔎 Collab 1 Campaign Title: "${c1.campaignTitle}"`);
      console.log(`  🔎 Collab 1 Deadline: ${c1.deadline}`);
      if (c1.campaignTitle !== 'Indus Pro Dock - Smart Thunderbolt Dock Launch') {
        throw new Error(`Collab 1 Title Mismatch! Expected "Indus Pro Dock - Smart Thunderbolt Dock Launch", got "${c1.campaignTitle}"`);
      }
      if (!c1.deadline || String(c1.deadline).includes('Open')) {
        throw new Error(`Collab 1 Deadline Mismatch! Got placeholder: ${c1.deadline}`);
      }

      // Verify Campaign 2 Title & Deadline
      console.log(`\n  🔎 Collab 2 Campaign Title: "${c2.campaignTitle}"`);
      console.log(`  🔎 Collab 2 Deadline: ${c2.deadline}`);
      if (c2.campaignTitle !== 'ZenBook OLED Creative Series Promotion') {
        throw new Error(`Collab 2 Title Mismatch! Expected "ZenBook OLED Creative Series Promotion", got "${c2.campaignTitle}"`);
      }
      if (!c2.deadline || String(c2.deadline).includes('Open')) {
        throw new Error(`Collab 2 Deadline Mismatch! Got placeholder: ${c2.deadline}`);
      }

      console.log('\n  ✅ PASS: Both active collaborations returned exact dynamic campaign names and formatted deadlines!');

      // Cleanup
      await User.deleteMany({ _id: { $in: [brandA._id, creatorA._id] } });
      await Campaign.deleteMany({ _id: { $in: [campaign1._id || campaign1.id, campaign2._id || campaign2.id] } });
      await CreatorProfile.deleteMany({ userId: creatorA._id });
      await Pricing.deleteMany({ creatorId: creatorA._id });
      await Invitation.deleteMany({ brandId: brandA._id });
      await Collaboration.deleteMany({ brandId: brandA._id });

      console.log('\n=====================================================================');
      console.log('🎉 BRAND ACTIVE COLLABORATIONS FIX TEST SUITE PASSED 100%');
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
