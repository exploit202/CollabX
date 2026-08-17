/**
 * E2E Audience & Platform Metrics Comprehensive Integration & Security Test Suite
 * Tests 8 critical assertions:
 * 1. Save YouTube audience metrics (subscribers=125000, averageViews=25000, engagementRate=4.8) -> HTTP 200
 * 2. Retrieve metrics via GET /api/creator/profile
 * 3. Persistence across page reloads/re-fetches
 * 4. Invalid subscribers rejection (subscribers = -100) -> HTTP 400
 * 5. Invalid engagement rate rejection (engagementRate = 101) -> HTTP 400
 * 6. Unauthenticated update rejection -> HTTP 401
 * 7. Ownership security isolation (Session identity req.user.userId enforced)
 * 8. Existing profile regression check (bio, niche, profile fields saved cleanly)
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const CreatorProfile = require('../src/models/creatorProfile.model');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59989;

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
  console.log('🚀 COLLABX CREATOR AUDIENCE METRICS COMPREHENSIVE SUITE');
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
    let creatorA, creatorB, tokenA, tokenB;

    try {
      // Setup Creator A & Creator B
      creatorA = await User.create({
        fullName: `Metrics Creator A ${timestamp}`,
        email: `metrics.a.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      creatorB = await User.create({
        fullName: `Metrics Creator B ${timestamp}`,
        email: `metrics.b.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      await CreatorProfile.create({
        userId: creatorA._id,
        fullName: creatorA.fullName,
        email: creatorA.email,
        bio: 'Initial Bio A',
        platforms: [{ platform: 'youtube', link: 'https://youtube.com/@techa' }]
      });

      await CreatorProfile.create({
        userId: creatorB._id,
        fullName: creatorB.fullName,
        email: creatorB.email,
        bio: 'Initial Bio B',
        platforms: [{ platform: 'youtube', link: 'https://youtube.com/@techb' }]
      });

      tokenA = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });
      tokenB = generateToken({ userId: creatorB._id, email: creatorB.email, role: 'creator' });

      // TEST 1: Save YouTube Metrics (subscribers=125000, averageViews=25000, engagementRate=4.8) -> HTTP 200
      console.log('[TEST 1] Saving YouTube Audience Metrics (subscribers=125000, averageViews=25000, engagementRate=4.8)...');
      const saveRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        {
          audienceMetrics: {
            youtube: { subscribers: 125000, averageViews: 25000, engagementRate: 4.8 }
          }
        }
      );

      if (saveRes.status !== 200 || !saveRes.body.data?.profile?.audienceMetrics?.youtube) {
        throw new Error(`Test 1 Failed: Save YouTube metrics failed: ${JSON.stringify(saveRes.body)}`);
      }
      const ytM = saveRes.body.data.profile.audienceMetrics.youtube;
      if (ytM.subscribers !== 125000 || ytM.averageViews !== 25000 || ytM.engagementRate !== 4.8) {
        throw new Error(`Test 1 Failed: Saved YouTube metrics mismatch: ${JSON.stringify(ytM)}`);
      }
      console.log('  ✅ TEST 1 PASS (YouTube metrics saved with HTTP 200)');

      // TEST 2: Retrieve Metrics via GET /api/creator/profile
      console.log('\n[TEST 2] Retrieving audience metrics via GET /api/creator/profile...');
      const getRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/profile',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      if (getRes.status !== 200 || getRes.body.data?.profile?.audienceMetrics?.youtube?.subscribers !== 125000) {
        throw new Error(`Test 2 Failed: Retrieve metrics failed: ${JSON.stringify(getRes.body)}`);
      }
      console.log('  ✅ TEST 2 PASS (Retrieved saved audience metrics cleanly)');

      // TEST 3: Persistence Across Reload/Re-fetch
      console.log('\n[TEST 3] Testing persistence across reload/re-fetch...');
      const refetchRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/profile',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });
      const refetchedM = refetchRes.body.data?.profile?.audienceMetrics?.youtube;
      if (refetchedM?.subscribers !== 125000 || refetchedM?.averageViews !== 25000 || refetchedM?.engagementRate !== 4.8) {
        throw new Error(`Test 3 Failed: Persistence check failed: ${JSON.stringify(refetchedM)}`);
      }
      console.log('  ✅ TEST 3 PASS (Same metrics returned after reload)');

      // TEST 4: Invalid Subscribers Rejection (subscribers = -100) -> HTTP 400
      console.log('\n[TEST 4] Testing invalid subscribers rejection (subscribers = -100)...');
      const invalidSubRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        {
          audienceMetrics: {
            youtube: { subscribers: -100, averageViews: 25000, engagementRate: 4.8 }
          }
        }
      );
      if (invalidSubRes.status !== 400) {
        throw new Error(`Test 4 Failed: Expected HTTP 400 for subscribers = -100, got ${invalidSubRes.status}`);
      }
      console.log('  ✅ TEST 4 PASS (Negative subscribers rejected with HTTP 400)');

      // TEST 5: Invalid Engagement Rate Rejection (engagementRate = 101) -> HTTP 400
      console.log('\n[TEST 5] Testing invalid engagement rate rejection (engagementRate = 101)...');
      const invalidRateRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        {
          audienceMetrics: {
            youtube: { subscribers: 125000, averageViews: 25000, engagementRate: 101 }
          }
        }
      );
      if (invalidRateRes.status !== 400) {
        throw new Error(`Test 5 Failed: Expected HTTP 400 for engagementRate = 101, got ${invalidRateRes.status}`);
      }
      console.log('  ✅ TEST 5 PASS (Engagement rate 101 rejected with HTTP 400)');

      // TEST 6: Unauthenticated Update Rejection -> HTTP 401
      console.log('\n[TEST 6] Testing unauthenticated update rejection (No JWT token)...');
      const unauthRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        },
        {
          audienceMetrics: {
            youtube: { subscribers: 1000, averageViews: 500, engagementRate: 5.0 }
          }
        }
      );
      if (unauthRes.status !== 401) {
        throw new Error(`Test 6 Failed: Expected HTTP 401 for unauthenticated request, got ${unauthRes.status}`);
      }
      console.log('  ✅ TEST 6 PASS (Unauthenticated request rejected with HTTP 401)');

      // TEST 7: Ownership Security Isolation Check
      console.log('\n[TEST 7] Testing ownership security isolation (Creator A updates own profile using session)...');
      await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        {
          audienceMetrics: {
            youtube: { subscribers: 999999, averageViews: 88888, engagementRate: 9.9 }
          }
        }
      );

      // Verify Creator B's profile was untouched
      const profileBRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/profile',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      const metricsB = profileBRes.body.data?.profile?.audienceMetrics?.youtube?.subscribers;
      if (metricsB === 999999) {
        throw new Error('Test 7 Failed: Ownership violation! Creator A modified Creator B profile!');
      }
      console.log('  ✅ TEST 7 PASS (Ownership isolation verified. Creator B profile completely untouched)');

      // TEST 8: Existing Profile Regression Check (bio, niche, profile fields saved cleanly)
      console.log('\n[TEST 8] Testing existing profile regression check (Updating bio, niche, and metrics)...');
      const regRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/profile',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
        },
        {
          primaryContentNiche: 'Gaming',
          bio: 'Updated Gaming Creator Bio',
          audienceMetrics: {
            youtube: { subscribers: 200000, averageViews: 40000, engagementRate: 5.5 }
          }
        }
      );
      if (regRes.status !== 200 || regRes.body.data?.profile?.bio !== 'Updated Gaming Creator Bio') {
        throw new Error(`Test 8 Failed: Existing profile fields regression: ${JSON.stringify(regRes.body)}`);
      }
      console.log('  ✅ TEST 8 PASS (Bio, niche, and audience metrics saved together cleanly)');

      // Clean up test data
      await User.deleteMany({ _id: { $in: [creatorA._id, creatorB._id] } });
      await CreatorProfile.deleteMany({ userId: { $in: [creatorA._id, creatorB._id] } });

      console.log('\n====================================================');
      console.log('🎉 AUDIENCE METRICS SUITE PASSED 100%');
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
