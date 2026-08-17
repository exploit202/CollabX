/**
 * E2E Creator Signup Architecture Verification Suite
 * Tests the complete 5-step Creator Registration lifecycle programmatically.
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const CreatorProfile = require('../src/models/creatorProfile.model');
const Otp = require('../src/models/otp.model');

const PORT = 59999;

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

const runE2ETest = async () => {
  console.log('====================================================');
  console.log('🚀 COLLABX CREATOR SIGNUP ARCHITECTURE E2E TEST');
  console.log('====================================================\n');

  try {
    await connectDB();
    console.log('🔌 Database connected cleanly.');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, async () => {
    console.log(`📡 Test server listening on http://localhost:${PORT}\n`);

    const timestamp = Date.now();
    const testEmail = `creator.e2e.${timestamp}@example.com`;
    const testPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    const testPassword = 'Password123!';
    let userId = null;
    let signupCookie = '';
    let fullTokenCookie = '';

    try {
      // ----------------------------------------------------
      // STEP 0: BASIC INFORMATION REGISTRATION
      // ----------------------------------------------------
      console.log('[STEP 0] Submitting Creator Basic Information...');
      const step0Res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        {
          fullName: 'Architecture E2E Creator',
          email: testEmail,
          phoneNumber: testPhone,
          primaryContentNiche: 'Tech & Gadgets',
          password: testPassword,
          confirmPassword: testPassword
        }
      );

      if (step0Res.status !== 201 || !step0Res.body.success) {
        throw new Error(`Step 0 Failed: ${JSON.stringify(step0Res.body)}`);
      }

      userId = step0Res.body.data.user._id || step0Res.body.data.user.userId;
      const rawCookies = step0Res.headers['set-cookie'] || [];

      const signupCookieHeader = rawCookies.find((c) => c.startsWith('signupToken='));
      if (!signupCookieHeader) {
        throw new Error('Step 0 Failed: signupToken Set-Cookie header missing');
      }
      signupCookie = signupCookieHeader.split(';')[0];
      const signupTokenVal = step0Res.body.data.signupToken;
      console.log(`  ✅ STEP 0 PASS (User created: ${userId})`);

      // ----------------------------------------------------
      // STEP 1: PLATFORM SELECTION
      // ----------------------------------------------------
      console.log('\n[STEP 1] Saving Social Platforms...');
      const step1Res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platforms',
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'cookie': signupCookie,
            'Authorization': `Bearer ${signupTokenVal}`
          }
        },
        { platforms: ['instagram', 'youtube', 'twitter'] }
      );

      if (step1Res.status !== 200 || !step1Res.body.success) {
        throw new Error(`Step 1 Failed: ${JSON.stringify(step1Res.body)}`);
      }
      console.log('  ✅ STEP 1 PASS (Platforms persisted to CreatorProfile)');

      // ----------------------------------------------------
      // STEP 2: LIVE PLATFORM LINK VERIFICATION
      // ----------------------------------------------------
      console.log('\n[STEP 2] Verifying Platform Links...');
      const step2Res = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/platform/verify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'cookie': signupCookie,
            'Authorization': `Bearer ${signupTokenVal}`
          }
        },
        {
          platform: 'instagram',
          url: 'https://www.instagram.com/tech_creator_e2e'
        }
      );

      if (step2Res.status !== 200 || !step2Res.body.data?.verified) {
        throw new Error(`Step 2 Failed: ${JSON.stringify(step2Res.body)}`);
      }
      console.log('  ✅ STEP 2 PASS (Platform URL reachability verified)');

      // ----------------------------------------------------
      // STEP 3: OTP GENERATION & EMAIL DELIVERY
      // ----------------------------------------------------
      console.log('\n[STEP 3] Requesting Verification OTP...');
      const step3Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/auth/otp/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cookie': signupCookie,
          'Authorization': `Bearer ${signupTokenVal}`
        }
      });

      if (step3Res.status !== 200 || !step3Res.body.success) {
        throw new Error(`Step 3 OTP Request Failed: ${JSON.stringify(step3Res.body)}`);
      }
      console.log('  ✅ STEP 3 OTP Request PASS (OTP generated & sent)');

      // Generate a fresh OTP for verification test using internal service
      const { generateOtp } = require('../src/modules/auth/services/otp.service');
      const { plainOtp } = await generateOtp(userId);

      // Verify OTP
      console.log('Verifying submitted 6-digit OTP code...');
      const step3VerifyRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/otp/verify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'cookie': signupCookie,
            'Authorization': `Bearer ${signupTokenVal}`
          }
        },
        { otp: plainOtp }
      );

      if (step3VerifyRes.status !== 200 || !step3VerifyRes.body.success) {
        throw new Error(`Step 3 OTP Verification Failed: ${JSON.stringify(step3VerifyRes.body)}`);
      }

      const verifyCookies = step3VerifyRes.headers['set-cookie'] || [];
      const fullTokenHeader = verifyCookies.find((c) => c.startsWith('token='));
      const fullTokenVal = step3VerifyRes.body.data?.token;
      fullTokenCookie = fullTokenHeader ? fullTokenHeader.split(';')[0] : `token=${fullTokenVal}`;
      console.log('  ✅ STEP 3 OTP Verification PASS (full access token cookie set)');

      // ----------------------------------------------------
      // STEP 4: FINAL USER REGISTRATION STATE & DASHBOARD ACCESS
      // ----------------------------------------------------
      console.log('\n[STEP 4] Verifying Final Database State & Session...');
      const dbUser4 = await User.findById(userId);
      if (dbUser4.isVerified !== true || dbUser4.registrationStatus !== 'completed') {
        throw new Error(`Step 4 DB State Error: isVerified=${dbUser4.isVerified}, status=${dbUser4.registrationStatus}`);
      }
      console.log('  ✅ Final DB State Verified (isVerified: true, registrationStatus: completed)');

      // Test Dashboard Access with fullToken Cookie
      const profileRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/profile',
        method: 'GET',
        headers: {
          'cookie': fullTokenCookie,
          'Authorization': `Bearer ${fullTokenVal}`
        }
      });

      if (profileRes.status !== 200) {
        throw new Error(`Step 4 Profile Fetch Failed: ${profileRes.status}`);
      }
      console.log('  ✅ Creator Dashboard Access Verified (Profile returned 200 OK)');

      // ----------------------------------------------------
      // STALE COOKIE INVALIDATION TEST
      // ----------------------------------------------------
      console.log('\n[STALE COOKIE TEST] Testing Automatic Invalidation of Stale signupToken...');
      const staleRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/auth/platforms',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'cookie': 'signupToken=stale_dead_token; Path=/'
        }
      });

      if (staleRes.status !== 401) {
        throw new Error(`Stale Cookie Test Failed: Expected 401, got ${staleRes.status}`);
      }
      const staleCookies = staleRes.headers['set-cookie'] || [];
      const clearSignupHeader = staleCookies.find((c) => c.startsWith('signupToken=;'));
      if (!clearSignupHeader) {
        throw new Error('Stale Cookie Test Failed: Expected Set-Cookie signupToken=; Max-Age=0 header');
      }
      console.log('  ✅ Stale Cookie Invalidation PASS (Clear cookie header received on 401)');

      // Cleanup test data
      await User.findByIdAndDelete(userId);
      await CreatorProfile.deleteMany({ userId });
      await Otp.deleteMany({ userId });

      console.log('\n====================================================');
      console.log('🎉 E2E CREATOR SIGNUP ARCHITECTURE SUITE PASSED 100%');
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

runE2ETest();
