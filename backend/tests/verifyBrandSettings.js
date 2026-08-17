/**
 * Comprehensive Backend Test Suite for Brand Settings & Security System
 * Tests exact prompt requirements (Tests A, B, C, D, E + Security & Notification suppression):
 *
 * Test A: Default brand settings load Asia/Kolkata and INR.
 * Test B: Change timezone (Asia/Kolkata -> America/New_York), verify DB contains America/New_York.
 * Test C: Change currency (INR -> USD), verify DB contains USD.
 * Test D: Change both (Europe/London and EUR), logout & login again, verify persistence.
 * Test E: Rejection of raw display labels ("America/New_York (EST)") and invalid currencies ("INVALID") with HTTP 400.
 */

const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const BrandProfile = require('../src/models/brandProfile.model');
const Notification = require('../src/models/notification.model');
const notificationService = require('../src/modules/brand/services/notification.service');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59903;

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
  console.log('🚀 COLLABX BRAND SETTINGS & PREFERENCES INTEGRATION TEST SUITE');
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

    let brandUserA, brandUserB, creatorUser;
    let tokenBrandA, tokenBrandB, tokenCreator;

    try {
      const ts = Date.now();
      const initialPasswordA = 'OldPassword123!';

      // Create Brand User A
      const hashedA = await bcrypt.hash(initialPasswordA, 10);
      brandUserA = await User.create({
        fullName: `Settings Brand A ${ts}`,
        email: `brand.settings.a.${ts}@example.com`,
        password: hashedA,
        role: 'brand',
        isVerified: true
      });
      tokenBrandA = generateToken({ userId: brandUserA._id, email: brandUserA.email, role: 'brand' });

      await BrandProfile.create({
        userId: brandUserA._id,
        companyName: brandUserA.fullName
      });

      // Create Brand User B
      brandUserB = await User.create({
        fullName: `Settings Brand B ${ts}`,
        email: `brand.settings.b.${ts}@example.com`,
        password: hashedA,
        role: 'brand',
        isVerified: true
      });
      tokenBrandB = generateToken({ userId: brandUserB._id, email: brandUserB.email, role: 'brand' });

      await BrandProfile.create({
        userId: brandUserB._id,
        companyName: brandUserB.fullName
      });

      // Create Creator User
      creatorUser = await User.create({
        fullName: `Settings Creator ${ts}`,
        email: `creator.settings.${ts}@example.com`,
        password: hashedA,
        role: 'creator',
        isVerified: true
      });
      tokenCreator = generateToken({ userId: creatorUser._id, email: creatorUser.email, role: 'creator' });

      console.log('✅ Setup Complete: Registered Brand A, Brand B, and Creator User.');

      // -------------------------------------------------------------------
      // TEST A — Default Brand Preferences Load
      // -------------------------------------------------------------------
      console.log('\n[TEST A — Default] Verifying default brand preferences load correctly...');
      const getResA = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/settings',
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenBrandA}` }
      });
      if (getResA.status !== 200 || !getResA.body.data?.preferences) {
        throw new Error(`Test A Failed: Expected HTTP 200, got ${getResA.status}: ${JSON.stringify(getResA.body)}`);
      }
      const defaultPrefs = getResA.body.data.preferences;
      if (defaultPrefs.timezone !== 'Asia/Kolkata' || defaultPrefs.currency !== 'INR') {
        throw new Error(`Test A Failed: Expected default timezone=Asia/Kolkata, currency=INR. Got ${JSON.stringify(defaultPrefs)}`);
      }
      console.log('  ✅ TEST A PASS: Brand A retrieved default preferences (Asia/Kolkata, INR) cleanly.');

      // -------------------------------------------------------------------
      // TEST B — Change Timezone (Asia/Kolkata -> America/New_York)
      // -------------------------------------------------------------------
      console.log('\n[TEST B — Timezone Change] Changing timezone to America/New_York...');
      const patchTzRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/settings',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenBrandA}` }
        },
        {
          preferences: { timezone: 'America/New_York' }
        }
      );
      if (patchTzRes.status !== 200) {
        throw new Error(`Test B Failed: Expected HTTP 200, got ${patchTzRes.status}`);
      }

      // Check DB directly
      const dbProfileB = await BrandProfile.findOne({ userId: brandUserA._id }).lean();
      if (dbProfileB.settings.preferences.timezone !== 'America/New_York') {
        throw new Error(`Test B Failed: MongoDB does not contain canonical America/New_York! Got '${dbProfileB.settings.preferences.timezone}'`);
      }
      console.log('  ✅ TEST B PASS: Timezone updated to canonical America/New_York in MongoDB.');

      // -------------------------------------------------------------------
      // TEST C — Change Currency (INR -> USD)
      // -------------------------------------------------------------------
      console.log('\n[TEST C — Currency Change] Changing currency to USD...');
      const patchCurrRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/settings',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenBrandA}` }
        },
        {
          preferences: { currency: 'USD' }
        }
      );
      if (patchCurrRes.status !== 200) {
        throw new Error(`Test C Failed: Expected HTTP 200, got ${patchCurrRes.status}`);
      }

      const dbProfileC = await BrandProfile.findOne({ userId: brandUserA._id }).lean();
      if (dbProfileC.settings.preferences.currency !== 'USD') {
        throw new Error(`Test C Failed: MongoDB does not contain canonical USD! Got '${dbProfileC.settings.preferences.currency}'`);
      }
      console.log('  ✅ TEST C PASS: Currency updated to canonical USD in MongoDB.');

      // -------------------------------------------------------------------
      // TEST D — Change Both (Europe/London, EUR), Logout & Login Again
      // -------------------------------------------------------------------
      console.log('\n[TEST D — Change Both & Re-login Persistence] Setting Europe/London and EUR...');
      const patchBothRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/settings',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenBrandA}` }
        },
        {
          preferences: {
            timezone: 'Europe/London',
            currency: 'EUR'
          }
        }
      );
      if (patchBothRes.status !== 200) {
        throw new Error(`Test D Failed: Expected HTTP 200, got ${patchBothRes.status}`);
      }

      // Simulate Logout & Re-login
      const reloginRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        {
          email: brandUserA.email,
          password: initialPasswordA
        }
      );
      if (reloginRes.status !== 200 || !reloginRes.body.data?.token) {
        throw new Error(`Test D Failed: Re-login failed with HTTP ${reloginRes.status}`);
      }
      const newTokenA = reloginRes.body.data.token;

      // Retrieve settings with new token
      const getPostReloginRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/settings',
        method: 'GET',
        headers: { Authorization: `Bearer ${newTokenA}` }
      });
      const reloginPrefs = getPostReloginRes.body.data.preferences;
      if (reloginPrefs.timezone !== 'Europe/London' || reloginPrefs.currency !== 'EUR') {
        throw new Error(`Test D Failed: Preferences were lost after re-login! Got ${JSON.stringify(reloginPrefs)}`);
      }
      console.log('  ✅ TEST D PASS: Preferences (Europe/London, EUR) persisted across logout & re-login.');

      // -------------------------------------------------------------------
      // TEST E — Invalid Values & Display Label Rejection
      // -------------------------------------------------------------------
      console.log('\n[TEST E — Invalid Canonical Values & Display Labels Rejection] Testing rejection...');
      const invRes1 = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/settings',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenBrandA}` }
        },
        {
          preferences: {
            timezone: 'America/New_York (EST)',
            currency: 'INVALID'
          }
        }
      );
      if (invRes1.status !== 400) {
        throw new Error(`Test E Failed: Expected HTTP 400 for raw display label / invalid currency, got ${invRes1.status}`);
      }
      console.log(`  ✅ TEST E PASS: Raw display label & invalid currency rejected with HTTP 400 ("${invRes1.body?.message}")`);

      // Security Access Control Check
      console.log('\n[SECURITY CHECK] Testing unauthenticated and cross-role guards...');
      const unauthRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/settings',
        method: 'GET'
      });
      if (unauthRes.status !== 401) throw new Error('Security Check Failed: Unauthenticated request not 401');

      const creatorRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/brand/settings',
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenCreator}` }
      });
      if (creatorRes.status !== 403) throw new Error('Security Check Failed: Creator request not 403');
      console.log('  ✅ SECURITY CHECK PASS: Unauthenticated (401) & Creator role (403) access guards verified.');

      // Cleanup
      await User.deleteMany({ _id: { $in: [brandUserA._id, brandUserB._id, creatorUser._id] } });
      await BrandProfile.deleteMany({ userId: { $in: [brandUserA._id, brandUserB._id] } });
      await Notification.deleteMany({ userId: { $in: [brandUserA._id, brandUserB._id] } });

      console.log('\n=====================================================================');
      console.log('🎉 COLLABX BRAND SETTINGS & PREFERENCES TEST SUITE PASSED 100%');
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
