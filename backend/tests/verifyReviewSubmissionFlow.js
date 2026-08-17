/**
 * Comprehensive E2E & Integration Test Suite for CollabX Review Submission System
 * Tests:
 * 1. Valid Review Submission by Brand A for Creator A on completed collaboration
 *    - Saved in MongoDB Review collection
 *    - Updates CreatorProfile.rating = 5.0 and totalReviews = 1
 * 2. Invalid Rating Rejection (rating < 1 or > 5) -> HTTP 400 Bad Request
 * 3. Unauthorized Review Rejection (Brand B attempting to review Brand A's collaboration) -> HTTP 403 Forbidden
 * 4. Duplicate Review Prevention (Brand A attempting 2nd review for same collaboration) -> HTTP 400 Bad Request
 * 5. Dynamic Creator Rating in Discover Creators API (GET /api/brand/creators/:id) -> Rating = 5.0, Reviews = 1
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
const Review = require('../src/models/review.model');
const { generateToken } = require('../src/utils/jwt');

const PORT = 59911;

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
  console.log('🚀 COLLABX REVIEW SUBMISSION FLOW E2E TEST SUITE');
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

    let brandA, brandB, creatorA;
    let tokenBrandA, tokenBrandB, tokenCreatorA;
    let campaignA;
    let collaborationA;

    try {
      const ts = Date.now();

      // 1. Create Users
      brandA = await User.create({
        fullName: `Review Brand Alpha ${ts}`,
        email: `brand.review.${ts}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });
      tokenBrandA = generateToken({ userId: brandA._id, email: brandA.email, role: 'brand' });

      brandB = await User.create({
        fullName: `Review Brand Beta ${ts}`,
        email: `brand.beta.review.${ts}@example.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true
      });
      tokenBrandB = generateToken({ userId: brandB._id, email: brandB.email, role: 'brand' });

      creatorA = await User.create({
        fullName: `Star Creator ${ts}`,
        email: `star.creator.${ts}@example.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: true
      });
      tokenCreatorA = generateToken({ userId: creatorA._id, email: creatorA.email, role: 'creator' });

      const initialProfile = await CreatorProfile.create({
        userId: creatorA._id,
        niche: ['Tech & Gadgets'],
        bio: 'Star reviewer',
        location: { city: 'Bengaluru', country: 'India' },
        platforms: [{ platform: 'youtube', link: 'https://youtube.com/@star' }],
        rating: 0,
        totalReviews: 0
      });

      campaignA = await Campaign.create({
        brandId: brandA._id,
        brandName: brandA.fullName,
        title: 'Review System Flagship Campaign',
        description: 'Test review campaign',
        category: 'Tech & Gadgets',
        budget: 45000,
        status: 'active'
      });

      // Create Completed Collaboration
      collaborationA = await Collaboration.create({
        campaignId: campaignA._id,
        campaignTitle: campaignA.title,
        brandId: brandA._id,
        brandName: brandA.fullName,
        creatorId: creatorA._id,
        creatorName: creatorA.fullName,
        negotiationId: new mongoose.Types.ObjectId(),
        agreedPrice: 45000,
        agreedBudget: 45000,
        status: 'completed',
        stage: 'completed'
      });

      console.log('✅ Setup Complete: Registered Brand A, Brand B, Creator A, and completed Collaboration.');
      console.log(`   - Creator Initial Rating: ${initialProfile.rating} (Total Reviews: ${initialProfile.totalReviews})`);

      // -------------------------------------------------------------------
      // TEST 1: Valid Review Submission by Brand A
      // -------------------------------------------------------------------
      console.log('\n[TEST 1] Brand A submitting valid 5-star review for Creator A...');
      const validReviewRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/reviews',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          collaborationId: collaborationA._id.toString(),
          rating: 5,
          review: 'Outstanding deliverable quality, top-tier communication, and fast delivery!'
        }
      );

      if (validReviewRes.status !== 201) {
        throw new Error(`Test 1 Failed: Review submission failed with HTTP ${validReviewRes.status}: ${JSON.stringify(validReviewRes.body)}`);
      }
      console.log('  ✅ TEST 1 PASS: Review created cleanly in MongoDB (HTTP 201).');

      // Verify MongoDB persistence and profile rating update
      const storedReview = await Review.findOne({ collaborationId: collaborationA._id }).lean();
      if (!storedReview || storedReview.rating !== 5 || storedReview.review.indexOf('Outstanding') === -1) {
        throw new Error('Test 1 Failed: Review record not stored accurately in MongoDB Review collection');
      }

      const updatedProfile = await CreatorProfile.findOne({ userId: creatorA._id }).lean();
      if (updatedProfile.rating !== 5 || updatedProfile.totalReviews !== 1) {
        throw new Error(`Test 1 Failed: CreatorProfile rating not updated dynamically. Expected rating=5, totalReviews=1. Got rating=${updatedProfile.rating}, totalReviews=${updatedProfile.totalReviews}`);
      }
      console.log(`  ✅ TEST 1 PASS: MongoDB CreatorProfile rating updated to ${updatedProfile.rating}.0 (${updatedProfile.totalReviews} review).`);

      // -------------------------------------------------------------------
      // TEST 2: Invalid Rating (rating = 0 or 6)
      // -------------------------------------------------------------------
      console.log('\n[TEST 2] Testing Invalid Rating Rejection (Rating = 6)...');
      const invalidRatingRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/reviews',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          collaborationId: collaborationA._id.toString(),
          rating: 6,
          review: 'Invalid rating test'
        }
      );

      if (invalidRatingRes.status !== 400) {
        throw new Error(`Test 2 Failed: Expected HTTP 400 for invalid rating 6, got ${invalidRatingRes.status}`);
      }
      console.log(`  ✅ TEST 2 PASS: Invalid rating cleanly rejected with HTTP 400 ("${invalidRatingRes.body?.message}")`);

      // -------------------------------------------------------------------
      // TEST 3: Unauthorized Review (Brand B attempting review for Brand A's collaboration)
      // -------------------------------------------------------------------
      console.log('\n[TEST 3] Testing Unauthorized Review Rejection (Brand B)...');
      const unauthRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/reviews',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandB}` }
        },
        {
          collaborationId: collaborationA._id.toString(),
          rating: 4,
          review: 'Unauthorized review attempt'
        }
      );

      if (unauthRes.status !== 403) {
        throw new Error(`Test 3 Failed: Expected HTTP 403 for non-participant Brand B, got ${unauthRes.status}`);
      }
      console.log(`  ✅ TEST 3 PASS: Unauthorized review rejected with HTTP 403 ("${unauthRes.body?.message}")`);

      // -------------------------------------------------------------------
      // TEST 4: Duplicate Review Prevention
      // -------------------------------------------------------------------
      console.log('\n[TEST 4] Testing Duplicate Review Prevention for Brand A...');
      const duplicateRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/reviews',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenBrandA}` }
        },
        {
          collaborationId: collaborationA._id.toString(),
          rating: 5,
          review: 'Duplicate review attempt'
        }
      );

      if (duplicateRes.status !== 400) {
        throw new Error(`Test 4 Failed: Expected HTTP 400 for duplicate review, got ${duplicateRes.status}`);
      }
      console.log(`  ✅ TEST 4 PASS: Duplicate review cleanly rejected with HTTP 400 ("${duplicateRes.body?.message}")`);

      // -------------------------------------------------------------------
      // TEST 5: Dynamic Creator Rating in Discover Creators API
      // -------------------------------------------------------------------
      console.log('\n[TEST 5] Testing Dynamic Rating Retrieval via GET /api/brand/creators/:id...');
      const creatorDetailRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/brand/creators/${creatorA._id.toString()}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenBrandA}` }
      });

      if (creatorDetailRes.status !== 200 || !creatorDetailRes.body.data) {
        throw new Error(`Test 5 Failed: Creator details retrieval failed: ${JSON.stringify(creatorDetailRes.body)}`);
      }

      const creatorDetail = creatorDetailRes.body.data;
      if (creatorDetail.rating !== 5 || creatorDetail.reviewCount !== 1) {
        throw new Error(`Test 5 Failed: Discover Creators API rating mismatch. Expected rating=5, reviewCount=1. Got rating=${creatorDetail.rating}, reviewCount=${creatorDetail.reviewCount}`);
      }
      console.log(`  ✅ TEST 5 PASS: GET /api/brand/creators/${creatorA._id} returned dynamic rating=${creatorDetail.rating}.0 and reviewCount=${creatorDetail.reviewCount}`);

      // Cleanup
      await User.deleteMany({ _id: { $in: [brandA._id, brandB._id, creatorA._id] } });
      await Campaign.deleteMany({ _id: campaignA._id });
      await CreatorProfile.deleteMany({ userId: creatorA._id });
      await Collaboration.deleteMany({ brandId: brandA._id });
      await Review.deleteMany({ reviewerId: brandA._id });

      console.log('\n=====================================================================');
      console.log('🎉 COLLABX REVIEW SUBMISSION FLOW E2E TEST SUITE PASSED 100%');
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
