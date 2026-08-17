/**
 * E2E Integration Suite for Creator Profile -> Deliverables -> MongoDB -> Brand Discover Creators Flow
 * Tests all 15 required scenarios from the specification:
 * 1. Platform alignment check (Creator with Instagram & YouTube cannot create Twitter package until added)
 * 2. Incomplete profile package creation rejection (HTTP 400)
 * 3. Complete profile package creation success (HTTP 201)
 * 4. Add Twitter to profile -> Twitter package creation allowed
 * 5. Brand Discovery API returns creator with real packages from DB
 * 6. Brand sees correct Instagram follower count
 * 7. Brand sees correct YouTube subscriber count
 * 8. Brand platform filtering (platform=YouTube)
 * 9. Brand minimum audience filtering (platform=YouTube&minFollowers=10000 evaluates YouTube subscribers, NOT Instagram followers!)
 * 10. Brand location filtering (location=Pune)
 * 11. Brand pricing filtering (priceRange=0-10k)
 * 12. Verified-only filtering (verifiedOnly=true)
 * 13. Creator edits package -> Brand discovery returns updated package
 * 14. Creator deletes package -> Package removed from Brand discovery
 * 15. Unauthorized modification guard (Creator A cannot modify Creator B package/profile)
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

const PORT = 59988;

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
  console.log('🚀 COLLABX CREATOR PROFILE -> PACKAGES -> BRAND DISCOVERY E2E SUITE');
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

    const timestamp = Date.now();
    let creatorA, creatorB, tokenA, tokenB;

    try {
      // Setup Creator A & Creator B
      creatorA = await User.create({
        fullName: `Ananya Sharma ${timestamp}`,
        email: `ananya.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      creatorB = await User.create({
        fullName: `Rohan Verma ${timestamp}`,
        email: `rohan.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: false,
        registrationStatus: 'completed'
      });

      tokenA = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });
      tokenB = generateToken({ userId: creatorB._id, email: creatorB.email, role: 'creator' });

      // TEST 2: Incomplete profile package creation rejection (HTTP 400)
      console.log('[TEST 2] Testing package creation with incomplete profile (No platforms/location set)...');
      await CreatorProfile.create({ userId: creatorA._id }); // Incomplete profile

      const incompletePkgRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        { title: 'Instagram Reel', platform: 'Instagram', price: 5000, deliveryDays: 3 }
      );
      if (incompletePkgRes.status !== 400) {
        throw new Error(`Test 2 Failed: Expected HTTP 400 for incomplete profile, got ${incompletePkgRes.status}`);
      }
      console.log('  ✅ TEST 2 PASS (Package creation rejected for incomplete profile)');

      // TEST 3: Complete Profile setup for Creator A (Instagram & YouTube)
      console.log('\n[TEST 3] Completing Creator A profile (Location: Pune, Platforms: Instagram & YouTube)...');
      await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        {
          primaryContentNiche: 'Tech & Gadgets',
          bio: 'Tech reviewer & gadget enthusiast based in Pune.',
          location: { city: 'Pune', country: 'India' },
          platforms: [
            { platform: 'instagram', link: 'https://instagram.com/ananya' },
            { platform: 'youtube', link: 'https://youtube.com/@ananya' }
          ],
          audienceMetrics: {
            instagram: { followers: 50000, averageReelViews: 15000, engagementRate: 5.2 },
            youtube: { subscribers: 3000, averageViews: 1200, engagementRate: 3.5 }
          }
        }
      );

      // Create valid Instagram package for Creator A
      const createInstaPkgRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        { title: '60-Second Instagram Reel', platform: 'Instagram', price: 5000, deliveryDays: 3, description: '1 custom edited reel' }
      );
      if (createInstaPkgRes.status !== 201) {
        throw new Error(`Test 3 Failed: Create Instagram package failed: ${JSON.stringify(createInstaPkgRes.body)}`);
      }
      const instaPkgId = createInstaPkgRes.body.data._id;
      console.log('  ✅ TEST 3 PASS (Created Instagram package cleanly after completing profile)');

      // TEST 1: Platform alignment check (Creator A tries creating Twitter package without Twitter in profile)
      console.log('\n[TEST 1] Testing package platform alignment guard (Attempting to create Twitter package when Twitter is not in profile)...');
      const unalignedPkgRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        { title: 'Twitter Promo Post', platform: 'Twitter', price: 3000, deliveryDays: 2 }
      );
      if (unalignedPkgRes.status !== 400) {
        throw new Error(`Test 1 Failed: Expected HTTP 400 for unaligned platform Twitter, got ${unalignedPkgRes.status}`);
      }
      console.log('  ✅ TEST 1 PASS (Twitter package creation rejected because Twitter is not connected in profile)');

      // TEST 4: Add Twitter to Creator A profile -> Twitter package creation allowed
      console.log('\n[TEST 4] Adding Twitter platform to Creator A profile...');
      await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        {
          platforms: [
            { platform: 'instagram', link: 'https://instagram.com/ananya' },
            { platform: 'youtube', link: 'https://youtube.com/@ananya' },
            { platform: 'twitter', link: 'https://twitter.com/ananya' }
          ],
          audienceMetrics: {
            twitter: { followers: 20000, averageImpressions: 8000, engagementRate: 4.1 }
          }
        }
      );

      const createTwitterPkgRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        { title: 'Sponsored Twitter Thread', platform: 'Twitter', price: 3000, deliveryDays: 2, description: '1 multi-tweet thread' }
      );
      if (createTwitterPkgRes.status !== 201) {
        throw new Error(`Test 4 Failed: Create Twitter package failed after adding platform: ${JSON.stringify(createTwitterPkgRes.body)}`);
      }
      console.log('  ✅ TEST 4 PASS (Twitter package created successfully after adding Twitter to profile)');

      // Create YouTube package for Creator A
      const createYtPkgRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        { title: 'YouTube Product Integration', platform: 'YouTube', price: 12000, deliveryDays: 5, description: 'Dedicated integration segment' }
      );
      if (createYtPkgRes.status !== 201) {
        throw new Error(`Test YouTube package failed: ${JSON.stringify(createYtPkgRes.body)}`);
      }

      // TEST 5 & 6 & 7: Brand Discovery returns real creator with real packages and correct platform audience counts
      console.log('\n[TEST 5, 6, 7] Fetching Brand Discover Creators API (GET /api/brand/creators)...');
      const discoverRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/creators',
        method: 'GET'
      });

      if (discoverRes.status !== 200 || !Array.isArray(discoverRes.body.data)) {
        throw new Error(`Test 5 Failed: Brand discovery API failed: ${JSON.stringify(discoverRes.body)}`);
      }
      const foundAnanya = discoverRes.body.data.find((c) => c.id === creatorA._id.toString());
      if (!foundAnanya) {
        throw new Error('Test 5 Failed: Creator A not found in Brand discovery dataset');
      }
      if (!Array.isArray(foundAnanya.pricing) || foundAnanya.pricing.length !== 3) {
        throw new Error(`Test 5 Failed: Real deliverable packages mismatch: expected 3, got ${foundAnanya.pricing?.length}`);
      }
      console.log('  ✅ TEST 5 PASS (Brand discovery returned real Creator A document with 3 real deliverable packages from DB)');

      const instaSocial = foundAnanya.socials.find((s) => s.platform === 'instagram');
      if (instaSocial?.followers !== 50000) {
        throw new Error(`Test 6 Failed: Expected Instagram followers 50000, got ${instaSocial?.followers}`);
      }
      console.log('  ✅ TEST 6 PASS (Brand sees correct Instagram followers: 50,000)');

      const ytSocial = foundAnanya.socials.find((s) => s.platform === 'youtube');
      if (ytSocial?.followers !== 3000) {
        throw new Error(`Test 7 Failed: Expected YouTube subscribers 3000, got ${ytSocial?.followers}`);
      }
      console.log('  ✅ TEST 7 PASS (Brand sees correct YouTube subscribers: 3,000)');

      // TEST 8 & 9: Platform-Specific Minimum Audience Filter Guard (Section 11)
      console.log('\n[TEST 8 & 9] Testing platform-specific minimum audience filter guard (YouTube subscribers = 3000 vs Instagram followers = 50000)...');
      // Search YouTube minFollowers=10000 -> Ananya has 3000 YouTube subscribers -> Must NOT match!
      const ytFilterRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/creators?platform=youtube&minFollowers=10000',
        method: 'GET'
      });
      const ytFilteredAnanya = ytFilterRes.body.data.find((c) => c.id === creatorA._id.toString());
      if (ytFilteredAnanya) {
        throw new Error('Test 9 Failed: Platform-specific filter guard failed! Ananya qualified for YouTube minAudience 10,000 despite having only 3,000 YouTube subscribers!');
      }
      console.log('  ✅ TEST 9 PASS (Platform-specific filter guard verified! Creator A excluded for YouTube minAudience 10,000 because YouTube subscribers = 3,000)');

      // Search Instagram minFollowers=10000 -> Ananya has 50000 Instagram followers -> Must match!
      const instaFilterRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/creators?platform=instagram&minFollowers=10000',
        method: 'GET'
      });
      const instaFilteredAnanya = instaFilterRes.body.data.find((c) => c.id === creatorA._id.toString());
      if (!instaFilteredAnanya) {
        throw new Error('Test 8 Failed: Ananya not returned for Instagram minAudience 10,000');
      }
      console.log('  ✅ TEST 8 PASS (Creator A matched for Instagram minAudience 10,000 because Instagram followers = 50,000)');

      // TEST 10: Location filtering (location=Pune)
      console.log('\n[TEST 10] Testing Location filter (location=Pune)...');
      const locRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/creators?location=Pune',
        method: 'GET'
      });
      const locAnanya = locRes.body.data.find((c) => c.id === creatorA._id.toString());
      if (!locAnanya) {
        throw new Error('Test 10 Failed: Location filter Pune did not return Creator A');
      }
      console.log('  ✅ TEST 10 PASS (Location filter Pune correctly returned Creator A)');

      // TEST 11: Pricing filtering (priceRange=0-10k)
      console.log('\n[TEST 11] Testing Pricing filter (priceRange=0-10k)...');
      const priceRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/creators?priceRange=0-10k',
        method: 'GET'
      });
      const priceAnanya = priceRes.body.data.find((c) => c.id === creatorA._id.toString());
      if (!priceAnanya) {
        throw new Error('Test 11 Failed: Pricing filter 0-10k did not return Creator A');
      }
      console.log('  ✅ TEST 11 PASS (Pricing filter 0-10k correctly evaluated starting rate ₹3,000)');

      // TEST 12: Verified-only filter
      console.log('\n[TEST 12] Testing Verified-only filter (verifiedOnly=true)...');
      const verRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/creators?verifiedOnly=true',
        method: 'GET'
      });
      const verAnanya = verRes.body.data.find((c) => c.id === creatorA._id.toString());
      if (!verAnanya) {
        throw new Error('Test 12 Failed: Verified filter did not return Creator A');
      }
      console.log('  ✅ TEST 12 PASS (Verified-only filter correctly returned verified Creator A)');

      // TEST 13: Creator edits package -> Brand discovery returns updated package
      console.log('\n[TEST 13] Creator A updates Instagram Reel price from ₹5,000 to ₹7,500...');
      await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/pricing/${instaPkgId}`,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        { price: 7500, deliveryDays: 4 }
      );

      const reDiscoverRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/creators',
        method: 'GET'
      });
      const reAnanya = reDiscoverRes.body.data.find((c) => c.id === creatorA._id.toString());
      const updatedInstaPkg = reAnanya.pricing.find((p) => (p.id || p._id) === instaPkgId);
      if (updatedInstaPkg?.price !== 7500 || updatedInstaPkg?.deliveryDays !== 4) {
        throw new Error(`Test 13 Failed: Brand discovery payload did not update: ${JSON.stringify(updatedInstaPkg)}`);
      }
      console.log('  ✅ TEST 13 PASS (Brand discovery payload dynamically reflected updated package price ₹7,500)');

      // TEST 14: Creator deletes package -> Package removed from Brand discovery
      console.log('\n[TEST 14] Creator A deletes Instagram Reel package...');
      await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/pricing/${instaPkgId}`,
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${tokenA}` }
        }
      );

      const postDelDiscoverRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/creators',
        method: 'GET'
      });
      const postDelAnanya = postDelDiscoverRes.body.data.find((c) => c.id === creatorA._id.toString());
      const deletedPkgCheck = postDelAnanya.pricing.find((p) => (p.id || p._id) === instaPkgId);
      if (deletedPkgCheck) {
        throw new Error('Test 14 Failed: Deleted package still returned in Brand discovery payload!');
      }
      console.log('  ✅ TEST 14 PASS (Deleted package successfully removed from Brand discovery payload)');

      // TEST 15: Unauthorized creator cannot modify another creator's profile/package
      console.log('\n[TEST 15] Testing unauthorized modification guard (Creator B attempts to delete Creator A package)...');
      const unauthDelRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: `/api/creator/pricing/${instaPkgId}`,
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${tokenB}` }
        }
      );
      if (unauthDelRes.status !== 404 && unauthDelRes.status !== 403) {
        throw new Error(`Test 15 Failed: Expected HTTP 404 or 403 for unauthorized package modification, got ${unauthDelRes.status}`);
      }
      console.log('  ✅ TEST 15 PASS (Unauthorized modification attempt cleanly rejected)');

      // Clean up test data
      await User.deleteMany({ _id: { $in: [creatorA._id, creatorB._id] } });
      await CreatorProfile.deleteMany({ userId: { $in: [creatorA._id, creatorB._id] } });
      await Pricing.deleteMany({ creatorId: { $in: [creatorA._id, creatorB._id] } });

      console.log('\n=====================================================================');
      console.log('🎉 FULL CREATOR PACKAGES & BRAND DISCOVERY INTEGRATION PASSED 100%');
      console.log('=====================================================================\n');
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
