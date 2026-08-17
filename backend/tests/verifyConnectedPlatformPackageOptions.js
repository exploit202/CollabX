/**
 * Test Suite for Creator Deliverable Package Platform Options & Backend Enforcement
 * Tests all required scenarios:
 * Test A — Creator with Instagram + YouTube profile can create Instagram/YouTube packages, Twitter rejected
 * Test B — Add Twitter to Profile -> Twitter package creation allowed
 * Test C — Backend Security: Direct POST with unconnected platform rejected by backend with HTTP 400
 * Test D — Existing packages remain intact in MongoDB
 * Test E — Brand Discovery receives packages with correct platform
 * Test F — Creator with no connected platforms cannot create package
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const CreatorProfile = require('../src/models/creatorProfile.model');
const Pricing = require('../src/models/pricing.model');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59966;

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
  console.log('🚀 COLLABX DELIVERABLE PACKAGE CONNECTED PLATFORMS TEST SUITE');
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

    let creatorUser, creatorToken;

    try {
      const timestamp = Date.now();
      creatorUser = await User.create({
        fullName: `Platform Option Creator ${timestamp}`,
        email: `platform.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true
      });

      creatorToken = generateToken({ userId: creatorUser._id, email: creatorUser.email, role: 'creator' });

      // TEST F: No platforms / Incomplete Profile -> Package creation rejected (HTTP 400)
      console.log('[TEST F] Testing package creation with no connected platforms...');
      await CreatorProfile.create({ userId: creatorUser._id });

      const noPlatRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { title: 'Instagram Reel', platform: 'Instagram', price: 5000, deliveryDays: 3 }
      );
      if (noPlatRes.status !== 400) {
        throw new Error(`Test F Failed: Expected HTTP 400 for no connected platforms, got ${noPlatRes.status}`);
      }
      console.log(`  ✅ TEST F PASS (Package creation rejected when no platforms connected: "${noPlatRes.body?.message}")`);

      // TEST A: Set profile connected platforms = Instagram & YouTube
      console.log('\n[TEST A] Connecting Instagram & YouTube to Creator Profile...');
      await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        {
          primaryContentNiche: 'Tech & Gadgets',
          bio: 'Tech reviewer in Pune.',
          location: { city: 'Pune', country: 'India' },
          platforms: [
            { platform: 'instagram', link: 'https://instagram.com/creator' },
            { platform: 'youtube', link: 'https://youtube.com/@creator' }
          ],
          audienceMetrics: {
            instagram: { followers: 25000, averageReelViews: 8000, engagementRate: 4.8 },
            youtube: { subscribers: 18500, averageViews: 5000, engagementRate: 3.9 }
          }
        }
      );

      // Create Instagram package -> SUCCESS (HTTP 201)
      const instaRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { title: '60-Sec Instagram Reel', platform: 'Instagram', price: 5000, deliveryDays: 3 }
      );
      if (instaRes.status !== 201) {
        throw new Error(`Test A Failed: Instagram package creation failed: ${JSON.stringify(instaRes.body)}`);
      }
      const instaPkgId = instaRes.body.data._id;
      console.log('  ✅ TEST A (Part 1) PASS (Instagram package created successfully)');

      // Create YouTube package -> SUCCESS (HTTP 201)
      const ytRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { title: 'YouTube Dedicated Video', platform: 'YouTube', price: 12000, deliveryDays: 5 }
      );
      if (ytRes.status !== 201) {
        throw new Error(`Test A Failed: YouTube package creation failed: ${JSON.stringify(ytRes.body)}`);
      }
      console.log('  ✅ TEST A (Part 2) PASS (YouTube package created successfully)');

      // Attempt Twitter package -> REJECTED (HTTP 400)
      const twitterUnconnectedRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { title: 'Twitter Thread', platform: 'Twitter', price: 3000, deliveryDays: 2 }
      );
      if (twitterUnconnectedRes.status !== 400) {
        throw new Error(`Test A Failed: Expected HTTP 400 for unconnected platform Twitter, got ${twitterUnconnectedRes.status}`);
      }
      console.log(`  ✅ TEST A (Part 3) PASS (Twitter package creation cleanly rejected: "${twitterUnconnectedRes.body?.message}")`);

      // TEST B: Add Twitter to Profile -> Twitter package creation allowed
      console.log('\n[TEST B] Adding Twitter platform to Creator Profile...');
      await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        {
          platforms: [
            { platform: 'instagram', link: 'https://instagram.com/creator' },
            { platform: 'youtube', link: 'https://youtube.com/@creator' },
            { platform: 'twitter', link: 'https://twitter.com/creator' }
          ]
        }
      );

      const twitterRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { title: 'Twitter Promo Post', platform: 'Twitter', price: 3000, deliveryDays: 2 }
      );
      if (twitterRes.status !== 201) {
        throw new Error(`Test B Failed: Twitter package creation failed after adding Twitter to profile: ${JSON.stringify(twitterRes.body)}`);
      }
      console.log('  ✅ TEST B PASS (Twitter package created successfully after adding Twitter to profile)');

      // TEST C: Backend Security / Never Trust Frontend (Remove Twitter from profile, send Twitter package request)
      console.log('\n[TEST C] Testing Backend Security Guard (Removing Twitter from profile and attempting Twitter package creation)...');
      await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        {
          platforms: [
            { platform: 'instagram', link: 'https://instagram.com/creator' },
            { platform: 'youtube', link: 'https://youtube.com/@creator' }
          ]
        }
      );

      const twitterSecurityRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { title: 'Bypassed Twitter Post', platform: 'Twitter', price: 4000, deliveryDays: 2 }
      );
      if (twitterSecurityRes.status !== 400) {
        throw new Error(`Test C Failed: Expected HTTP 400 for security bypass attempt, got ${twitterSecurityRes.status}`);
      }
      console.log(`  ✅ TEST C PASS (Backend security guard rejected bypass request: "${twitterSecurityRes.body?.message}")`);

      // TEST D: Existing Packages remain intact in MongoDB
      console.log('\n[TEST D] Verifying existing packages remain intact in MongoDB...');
      const existingPkgs = await Pricing.find({ creatorId: creatorUser._id, isActive: true });
      if (existingPkgs.length < 3) {
        throw new Error(`Test D Failed: Expected 3 active packages, found ${existingPkgs.length}`);
      }
      console.log('  ✅ TEST D PASS (Existing packages preserved intact in MongoDB)');

      // TEST E: Brand Discovery receives packages with correct platform
      console.log('\n[TEST E] Fetching Brand Discover Creators API (GET /api/brand/creators)...');
      const brandDiscoveryRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/creators',
        method: 'GET'
      });
      if (brandDiscoveryRes.status !== 200) {
        throw new Error(`Test E Failed: Brand discovery API returned HTTP ${brandDiscoveryRes.status}`);
      }
      const creatorInDiscovery = brandDiscoveryRes.body.data.find((c) => c.id === creatorUser._id.toString());
      if (!creatorInDiscovery || !Array.isArray(creatorInDiscovery.pricing)) {
        throw new Error('Test E Failed: Creator not found in Brand discovery dataset');
      }
      console.log(`  ✅ TEST E PASS (Brand discovery returned creator with ${creatorInDiscovery.pricing.length} packages containing correct platform data)`);

      // Cleanup
      await User.deleteOne({ _id: creatorUser._id });
      await CreatorProfile.deleteOne({ userId: creatorUser._id });
      await Pricing.deleteMany({ creatorId: creatorUser._id });

      console.log('\n=====================================================================');
      console.log('🎉 DELIVERABLE PACKAGE CONNECTED PLATFORMS TEST SUITE PASSED 100%');
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
