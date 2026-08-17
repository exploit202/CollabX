/**
 * Test Suite for Add Social Platform -> Link Verification Flow
 * Tests YouTube, Instagram, and Twitter platform URL verification rules:
 * 1. Valid YouTube channel URL -> PASS
 * 2. Invalid YouTube video URL -> REJECTED (HTTP 400)
 * 3. Instagram URL entered for YouTube -> REJECTED (HTTP 400)
 * 4. Random website entered for YouTube -> REJECTED (HTTP 400)
 * 5. Valid Instagram profile URL -> PASS
 * 6. Invalid Instagram post URL -> REJECTED (HTTP 400)
 * 7. YouTube URL entered for Instagram -> REJECTED (HTTP 400)
 * 8. Valid Twitter/X profile URL -> PASS
 * 9. Invalid Tweet URL -> REJECTED (HTTP 400)
 * 10. Instagram URL entered for Twitter -> REJECTED (HTTP 400)
 * 11. Security Guard: Unauthenticated verification request -> REJECTED (HTTP 401)
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59977;

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
  console.log('🚀 COLLABX ADD SOCIAL PLATFORM -> LINK VERIFICATION SUITE');
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
        fullName: `Verification Creator ${timestamp}`,
        email: `verify.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true
      });

      creatorToken = generateToken({ userId: creatorUser._id, email: creatorUser.email, role: 'creator' });

      // TEST 11: Security Guard - Unauthenticated request rejected (HTTP 401)
      console.log('[TEST 11] Security Guard: Testing unauthenticated verification request...');
      const unauthRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        { platform: 'youtube', url: 'https://youtube.com/@mkbhd' }
      );
      if (unauthRes.status !== 401) {
        throw new Error(`Test 11 Failed: Expected HTTP 401 for unauthenticated request, got ${unauthRes.status}`);
      }
      console.log('  ✅ TEST 11 PASS (Unauthenticated request cleanly rejected with HTTP 401)');

      // TEST 1: Valid YouTube channel URL -> PASS
      console.log('\n[TEST 1] Testing valid YouTube channel URL (https://youtube.com/@mkbhd)...');
      const ytValidRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { platform: 'youtube', url: 'https://youtube.com/@mkbhd' }
      );
      if (ytValidRes.status !== 200 || !ytValidRes.body?.data?.verified) {
        throw new Error(`Test 1 Failed: Valid YouTube channel verification failed: ${JSON.stringify(ytValidRes.body)}`);
      }
      console.log('  ✅ TEST 1 PASS (Valid YouTube channel verified successfully)');

      // TEST 2: Invalid YouTube video URL -> REJECTED (HTTP 400)
      console.log('\n[TEST 2] Testing YouTube video URL (https://youtube.com/watch?v=dQw4w9WgXcQ)...');
      const ytVideoRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { platform: 'youtube', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' }
      );
      if (ytVideoRes.status !== 400) {
        throw new Error(`Test 2 Failed: Expected HTTP 400 for YouTube video URL, got ${ytVideoRes.status}`);
      }
      console.log(`  ✅ TEST 2 PASS (YouTube video URL cleanly rejected: "${ytVideoRes.body?.message}")`);

      // TEST 3: Instagram URL entered for YouTube -> REJECTED (HTTP 400)
      console.log('\n[TEST 3] Testing Instagram URL entered for YouTube platform...');
      const ytMismatchRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { platform: 'youtube', url: 'https://instagram.com/ananyasharma' }
      );
      if (ytMismatchRes.status !== 400) {
        throw new Error(`Test 3 Failed: Expected HTTP 400 for Instagram URL under YouTube, got ${ytMismatchRes.status}`);
      }
      console.log(`  ✅ TEST 3 PASS (Domain mismatch cleanly rejected: "${ytMismatchRes.body?.message}")`);

      // TEST 4: Random website entered for YouTube -> REJECTED (HTTP 400)
      console.log('\n[TEST 4] Testing random website URL entered for YouTube...');
      const randomWebRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { platform: 'youtube', url: 'https://example.com/somepage' }
      );
      if (randomWebRes.status !== 400) {
        throw new Error(`Test 4 Failed: Expected HTTP 400 for random website, got ${randomWebRes.status}`);
      }
      console.log(`  ✅ TEST 4 PASS (Random website cleanly rejected: "${randomWebRes.body?.message}")`);

      // TEST 5: Valid Instagram profile URL -> PASS
      console.log('\n[TEST 5] Testing valid Instagram profile URL (https://instagram.com/zuck)...');
      const instaValidRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { platform: 'instagram', url: 'https://instagram.com/zuck' }
      );
      if (instaValidRes.status !== 200 || !instaValidRes.body?.data?.verified) {
        throw new Error(`Test 5 Failed: Valid Instagram profile verification failed: ${JSON.stringify(instaValidRes.body)}`);
      }
      console.log('  ✅ TEST 5 PASS (Valid Instagram profile verified successfully)');

      // TEST 6: Invalid Instagram post URL -> REJECTED (HTTP 400)
      console.log('\n[TEST 6] Testing Instagram post URL (https://instagram.com/p/C123456789)...');
      const instaPostRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { platform: 'instagram', url: 'https://instagram.com/p/C123456789' }
      );
      if (instaPostRes.status !== 400) {
        throw new Error(`Test 6 Failed: Expected HTTP 400 for Instagram post URL, got ${instaPostRes.status}`);
      }
      console.log(`  ✅ TEST 6 PASS (Instagram post URL cleanly rejected: "${instaPostRes.body?.message}")`);

      // TEST 7: YouTube URL entered for Instagram -> REJECTED (HTTP 400)
      console.log('\n[TEST 7] Testing YouTube URL entered for Instagram platform...');
      const instaMismatchRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { platform: 'instagram', url: 'https://youtube.com/@mkbhd' }
      );
      if (instaMismatchRes.status !== 400) {
        throw new Error(`Test 7 Failed: Expected HTTP 400 for YouTube URL under Instagram, got ${instaMismatchRes.status}`);
      }
      console.log(`  ✅ TEST 7 PASS (Domain mismatch cleanly rejected: "${instaMismatchRes.body?.message}")`);

      // TEST 8: Valid Twitter/X profile URL -> PASS
      console.log('\n[TEST 8] Testing valid Twitter/X profile URL (https://twitter.com/elonmusk)...');
      const twitterValidRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { platform: 'twitter', url: 'https://twitter.com/elonmusk' }
      );
      if (twitterValidRes.status !== 200 || !twitterValidRes.body?.data?.verified) {
        throw new Error(`Test 8 Failed: Valid Twitter profile verification failed: ${JSON.stringify(twitterValidRes.body)}`);
      }
      console.log('  ✅ TEST 8 PASS (Valid Twitter/X profile verified successfully)');

      // TEST 9: Invalid Tweet status URL -> REJECTED (HTTP 400)
      console.log('\n[TEST 9] Testing Tweet status URL (https://twitter.com/elonmusk/status/123456789)...');
      const tweetStatusRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { platform: 'twitter', url: 'https://twitter.com/elonmusk/status/123456789' }
      );
      if (tweetStatusRes.status !== 400) {
        throw new Error(`Test 9 Failed: Expected HTTP 400 for Tweet status URL, got ${tweetStatusRes.status}`);
      }
      console.log(`  ✅ TEST 9 PASS (Tweet status URL cleanly rejected: "${tweetStatusRes.body?.message}")`);

      // TEST 10: Instagram URL entered for Twitter -> REJECTED (HTTP 400)
      console.log('\n[TEST 10] Testing Instagram URL entered for Twitter platform...');
      const twitterMismatchRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` }
        },
        { platform: 'twitter', url: 'https://instagram.com/zuck' }
      );
      if (twitterMismatchRes.status !== 400) {
        throw new Error(`Test 10 Failed: Expected HTTP 400 for Instagram URL under Twitter, got ${twitterMismatchRes.status}`);
      }
      console.log(`  ✅ TEST 10 PASS (Domain mismatch cleanly rejected: "${twitterMismatchRes.body?.message}")`);

      // Cleanup
      await User.deleteOne({ _id: creatorUser._id });

      console.log('\n=====================================================================');
      console.log('🎉 SOCIAL PLATFORM LINK VERIFICATION TEST SUITE PASSED 100%');
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
