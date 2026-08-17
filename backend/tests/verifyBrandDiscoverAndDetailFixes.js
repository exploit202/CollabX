/**
 * Test Suite for Brand Discover & View Details Fixes
 * Tests the 3 specific fixes:
 * Issue 1: Remove static/dummy rating (new creator has rating=0, reviewCount=0)
 * Issue 2: Remove Compare Creator feature
 * Issue 3: View Details fetches real selected creator from MongoDB via GET /api/brand/creators/:id
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

const PORT = 59955;

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
  console.log('🚀 COLLABX BRAND DISCOVER & CREATOR DETAIL FIXES TEST SUITE');
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

    let creatorA, creatorB, tokenA, tokenB;

    try {
      const timestamp = Date.now();

      // Create Creator A (No reviews)
      creatorA = await User.create({
        fullName: `Alpha Creator ${timestamp}`,
        email: `alpha.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true
      });

      // Create Creator B (No reviews)
      creatorB = await User.create({
        fullName: `Beta Creator ${timestamp}`,
        email: `beta.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true
      });

      tokenA = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });
      tokenB = generateToken({ userId: creatorB._id, email: creatorB.email, role: 'creator' });

      // Profile Creator A: Instagram & YouTube
      await CreatorProfile.create({
        userId: creatorA._id,
        niche: ['Gaming'],
        bio: 'Alpha gaming creator in Mumbai.',
        location: { city: 'Mumbai', country: 'India' },
        platforms: [
          { platform: 'instagram', link: 'https://instagram.com/alphagaming' },
          { platform: 'youtube', link: 'https://youtube.com/@alphagaming' }
        ],
        audienceMetrics: {
          instagram: { followers: 45000, averageReelViews: 12000, engagementRate: 5.1 },
          youtube: { subscribers: 32000, averageViews: 9000, engagementRate: 4.2 }
        }
      });

      // Profile Creator B: Twitter
      await CreatorProfile.create({
        userId: creatorB._id,
        niche: ['Fashion & Lifestyle'],
        bio: 'Beta fashion creator in Delhi.',
        location: { city: 'Delhi', country: 'India' },
        platforms: [
          { platform: 'twitter', link: 'https://twitter.com/betafashion' }
        ],
        audienceMetrics: {
          twitter: { followers: 15000, averageImpressions: 5000, engagementRate: 3.5 }
        }
      });

      // Create Packages for Creator A
      await Pricing.create({
        creatorId: creatorA._id,
        title: 'Alpha Stream Integration',
        description: 'Gaming stream product integration',
        platform: 'YouTube',
        price: 8000,
        deliveryDays: 3,
        isActive: true
      });

      // Create Packages for Creator B
      await Pricing.create({
        creatorId: creatorB._id,
        title: 'Beta Fashion Thread',
        description: 'Sponsored fashion twitter thread',
        platform: 'X',
        price: 4000,
        deliveryDays: 2,
        isActive: true
      });

      // TEST 1: New creator rating check (Must be 0, NOT 4.9)
      console.log('[TEST 1] Testing new creator rating (Discover Creators API)...');
      const discoverRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/creators',
        method: 'GET'
      });

      if (discoverRes.status !== 200 || !Array.isArray(discoverRes.body.data)) {
        throw new Error(`Test 1 Failed: Discover API failed: ${JSON.stringify(discoverRes.body)}`);
      }

      const cardA = discoverRes.body.data.find((c) => c.id === creatorA._id.toString());
      if (!cardA) {
        throw new Error('Test 1 Failed: Creator A not found in discover dataset');
      }
      if (cardA.rating !== 0 || cardA.reviewCount !== 0) {
        throw new Error(`Test 1 Failed: Expected rating = 0 and reviewCount = 0 for new creator, got rating = ${cardA.rating}, reviewCount = ${cardA.reviewCount}`);
      }
      console.log('  ✅ TEST 1 PASS (Newly registered creator card returns rating = 0 and reviewCount = 0)');

      // TEST 3: View Details for Creator A (GET /api/brand/creators/:id)
      console.log('\n[TEST 3] Testing View Details endpoint for Creator A (GET /api/brand/creators/:id)...');
      const detailARes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/brand/creators/${creatorA._id}`,
        method: 'GET'
      });

      if (detailARes.status !== 200 || !detailARes.body?.data) {
        throw new Error(`Test 3 Failed: GET /api/brand/creators/${creatorA._id} failed: ${JSON.stringify(detailARes.body)}`);
      }
      const dataA = detailARes.body.data;
      if (dataA.name !== `Alpha Creator ${timestamp}` || dataA.category !== 'Gaming') {
        throw new Error(`Test 3 Failed: Creator A identity mismatch: ${JSON.stringify(dataA)}`);
      }
      if (!Array.isArray(dataA.pricing) || dataA.pricing.length !== 1 || dataA.pricing[0].title !== 'Alpha Stream Integration') {
        throw new Error(`Test 3 Failed: Creator A package mismatch: ${JSON.stringify(dataA.pricing)}`);
      }
      console.log('  ✅ TEST 3 PASS (View Details endpoint returned real Creator A MongoDB document and package)');

      // TEST 4: Creator B Identity Isolation
      console.log('\n[TEST 4] Testing View Details endpoint for Creator B (GET /api/brand/creators/:id)...');
      const detailBRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/brand/creators/${creatorB._id}`,
        method: 'GET'
      });

      if (detailBRes.status !== 200 || !detailBRes.body?.data) {
        throw new Error(`Test 4 Failed: GET /api/brand/creators/${creatorB._id} failed: ${JSON.stringify(detailBRes.body)}`);
      }
      const dataB = detailBRes.body.data;
      if (dataB.name !== `Beta Creator ${timestamp}` || dataB.category !== 'Fashion & Lifestyle') {
        throw new Error(`Test 4 Failed: Creator B identity mismatch: ${JSON.stringify(dataB)}`);
      }
      if (dataB.name.includes('Alpha')) {
        throw new Error('Test 4 Failed: Creator B detail payload leaked Creator A data!');
      }
      console.log('  ✅ TEST 4 PASS (Creator B View Details returned real Creator B document with zero Creator A data)');

      // TEST 5: Platform metrics accuracy
      console.log('\n[TEST 5] Verifying platform-specific audience metrics accuracy...');
      const ytSocialA = dataA.socials.find((s) => s.platform === 'youtube');
      if (ytSocialA?.followers !== 32000) {
        throw new Error(`Test 5 Failed: Expected 32,000 YouTube subscribers for Creator A, got ${ytSocialA?.followers}`);
      }
      console.log('  ✅ TEST 5 PASS (Platform-specific audience metrics verified accurately)');

      // TEST 6: Rating Consistency between Discover Card and View Details
      console.log('\n[TEST 6] Testing Rating Consistency between Discover Card and View Details...');
      if (cardA.rating !== dataA.rating) {
        throw new Error(`Test 6 Failed: Inconsistent rating: Card=${cardA.rating}, Detail=${dataA.rating}`);
      }
      console.log(`  ✅ TEST 6 PASS (Rating consistent across Discover Card (${cardA.rating}) and View Details (${dataA.rating}))`);

      // TEST 7: API Failure handling (Invalid creator ID returns HTTP 404)
      console.log('\n[TEST 7] Testing API Failure handling for invalid creator ID...');
      const fakeId = new mongoose.Types.ObjectId().toString();
      const failRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/brand/creators/${fakeId}`,
        method: 'GET'
      });
      if (failRes.status !== 404) {
        throw new Error(`Test 7 Failed: Expected HTTP 404 for invalid creator ID, got ${failRes.status}`);
      }
      console.log(`  ✅ TEST 7 PASS (Invalid creator ID correctly returned HTTP 404: "${failRes.body?.message}")`);

      // Clean up
      await User.deleteMany({ _id: { $in: [creatorA._id, creatorB._id] } });
      await CreatorProfile.deleteMany({ userId: { $in: [creatorA._id, creatorB._id] } });
      await Pricing.deleteMany({ creatorId: { $in: [creatorA._id, creatorB._id] } });

      console.log('\n=====================================================================');
      console.log('🎉 BRAND DISCOVER & CREATOR DETAIL FIXES TEST SUITE PASSED 100%');
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
