/**
 * E2E Creator Pricing & Deliverable Packages Verification Suite
 * Tests GET /api/creator/pricing endpoint, POST /api/creator/pricing package creation,
 * Mongoose schema field & platform enum normalization, MongoDB Atlas persistence,
 * Creator isolation, page refresh persistence, and DELETE /api/creator/pricing/:id.
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Pricing = require('../src/models/pricing.model');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59994;

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
  console.log('🚀 COLLABX CREATOR PRICING & PACKAGES E2E SUITE');
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
    let creatorA, creatorB, createdPackageId;

    try {
      // 1. Setup Test Creators
      creatorA = await User.create({
        fullName: `Pricing Creator A ${timestamp}`,
        email: `pricing.creator.a.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      creatorB = await User.create({
        fullName: `Pricing Creator B ${timestamp}`,
        email: `pricing.creator.b.${timestamp}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true,
        registrationStatus: 'completed'
      });

      const creatorAToken = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });
      const creatorBToken = generateToken({ userId: creatorB._id, email: creatorB.email, role: 'creator' });

      // TEST 1: Creator A fetches initial empty pricing packages
      console.log('[TEST 1] Testing Creator A fetching empty pricing list...');
      const emptyRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/pricing',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (emptyRes.status !== 200 || !Array.isArray(emptyRes.body.data) || emptyRes.body.data.length !== 0) {
        throw new Error(`Test 1 Failed: Expected empty array, got ${JSON.stringify(emptyRes.body)}`);
      }
      console.log('  ✅ TEST 1 PASS (Empty state returned Array [] cleanly)');

      // TEST 2: Creator A saves deliverable package (POST /api/creator/pricing)
      console.log('\n[TEST 2] Creator A saving new deliverable package...');
      const createRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/pricing',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorAToken}` }
        },
        {
          deliverableType: 'Instagram Reel Package',
          packageTitle: 'Instagram Reel Package',
          platform: 'instagram', // Lowercase test
          price: 750,
          deliveryDays: 5,
          description: 'High quality 60s Instagram Reel with custom audio & tags.'
        }
      );

      if (createRes.status !== 201 || !createRes.body.data?._id) {
        throw new Error(`Test 2 Failed: Deliverable package creation failed: ${JSON.stringify(createRes.body)}`);
      }
      createdPackageId = createRes.body.data._id;
      console.log(`  ✅ TEST 2 PASS (Package created via API: ${createdPackageId})`);

      // TEST 3: Verify MongoDB Document Persistence in Atlas
      console.log('\n[TEST 3] Inspecting MongoDB Atlas Pricing document...');
      const dbPackage = await Pricing.findById(createdPackageId);
      if (!dbPackage || dbPackage.title !== 'Instagram Reel Package' || dbPackage.platform !== 'Instagram' || dbPackage.price !== 750) {
        throw new Error(`Test 3 Failed: Invalid Pricing document in MongoDB: ${JSON.stringify(dbPackage)}`);
      }
      console.log(`  ✅ TEST 3 PASS (MongoDB document verified: title='${dbPackage.title}', platform='${dbPackage.platform}', price=$${dbPackage.price})`);

      // TEST 4: Creator A re-fetches packages (Page Refresh Persistence)
      console.log('\n[TEST 4] Creator A re-fetching pricing packages (Refresh Persistence)...');
      const step4Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/pricing',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (step4Res.status !== 200 || !step4Res.body.data?.length) {
        throw new Error(`Test 4 Failed: Package missing on re-fetch: ${JSON.stringify(step4Res.body)}`);
      }
      const fetchedPkg = step4Res.body.data[0];
      if (String(fetchedPkg._id) !== String(createdPackageId) || fetchedPkg.price !== 750) {
        throw new Error(`Test 4 Failed: Re-fetched package data mismatch: ${JSON.stringify(fetchedPkg)}`);
      }
      console.log(`  ✅ TEST 4 PASS (Re-fetch returned persisted package: ${fetchedPkg.title}, $${fetchedPkg.price})`);

      // TEST 5: Creator Isolation (Creator B re-fetches pricing)
      console.log('\n[TEST 5] Testing Creator Isolation for Creator B...');
      const step5Res = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/pricing',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorBToken}` }
      });
      if (step5Res.status !== 200 || step5Res.body.data?.length !== 0) {
        throw new Error(`Test 5 Failed: Creator isolation breach! Creator B received: ${JSON.stringify(step5Res.body)}`);
      }
      console.log('  ✅ TEST 5 PASS (Creator B received Array [], isolation verified)');

      // TEST 6: Creator A deletes deliverable package (DELETE /api/creator/pricing/:id)
      console.log('\n[TEST 6] Creator A deleting deliverable package...');
      const delRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/creator/pricing/${createdPackageId}`,
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (delRes.status !== 200) {
        throw new Error(`Test 6 Failed: Delete failed: ${JSON.stringify(delRes.body)}`);
      }
      const postDelRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/pricing',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${creatorAToken}` }
      });
      if (postDelRes.body.data?.length !== 0) {
        throw new Error('Test 6 Failed: Soft-deleted package still returned');
      }
      console.log('  ✅ TEST 6 PASS (Package deleted, GET returned Array [])');

      // Clean up temporary test creators & pricing
      await User.deleteMany({ _id: { $in: [creatorA._id, creatorB._id] } });
      await Pricing.deleteOne({ _id: createdPackageId });

      console.log('\n====================================================');
      console.log('🎉 CREATOR PRICING & PACKAGES SUITE PASSED 100%');
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
