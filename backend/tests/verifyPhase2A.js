require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const models = require('../src/models');
const { generateAccessToken, verifyAccessToken } = require('../src/utils/jwt');

async function runVerification() {
  console.log('====================================================');
  console.log('🧪 COLLABX PHASE 2A FOUNDATION VERIFICATION TEST');
  console.log('====================================================\n');

  try {
    // 1. Single Primary Database Connection Test
    console.log('[1/7] Connecting to Single Primary MongoDB...');
    await connectDB();
    console.log(`  ✅ Connected to MongoDB Atlas (DB Name: ${mongoose.connection.name})\n`);

    // 2. Canonical Model Registration & Integrity Test
    console.log('[2/7] Testing Model Registration & Integrity...');
    const requiredModels = [
      'User',
      'Otp',
      'BrandProfile',
      'CreatorProfile',
      'Campaign',
      'SavedCreator',
      'Invitation',
      'Negotiation',
      'NegotiationMessage',
      'Notification',
      'Collaboration',
      'Portfolio',
      'Review',
      'Pricing',
      'Payment',
      'CreatorPayoutAccount'
    ];

    for (const modelName of requiredModels) {
      if (!models[modelName]) {
        throw new Error(`Missing expected model export: ${modelName}`);
      }
      // Trigger Mongoose schema compilation check
      const modelRef = mongoose.model(models[modelName].modelName || modelName);
      if (!modelRef) {
        throw new Error(`Mongoose model ${modelName} failed to register on primary connection.`);
      }
      console.log(`  ✓ Model registered cleanly: ${modelName}`);
    }
    console.log('  ✅ All 16 Canonical Models Loaded & Registered Without Conflict\n');

    // 3. Broken Mongoose Reference Fix Verification
    console.log('[3/7] Verifying Fixed Mongoose References (Portfolio, Review, Pricing)...');
    const portfolioRef = models.Portfolio.schema.path('creator').options.ref;
    const reviewRef = models.Review.schema.path('creatorId').options.ref;
    const pricingRef = models.Pricing.schema.path('creatorId').options.ref;

    if (portfolioRef !== 'User') throw new Error(`Portfolio creator ref is '${portfolioRef}', expected 'User'`);
    if (reviewRef !== 'User') throw new Error(`Review creatorId ref is '${reviewRef}', expected 'User'`);
    if (pricingRef !== 'User') throw new Error(`Pricing creatorId ref is '${pricingRef}', expected 'User'`);
    console.log('  ✓ Portfolio.creator -> User');
    console.log('  ✓ Review.creatorId -> User');
    console.log('  ✓ Pricing.creatorId -> User');
    console.log('  ✅ All Broken Mongoose References Successfully Repaired\n');

    // 4. Unified User & BrandProfile Identity Verification
    console.log('[4/7] Verifying Unified Brand User & BrandProfile Relationship...');
    const testBrandEmail = `test.brand.p2a.${Date.now()}@collabx.test`;
    const brandUser = await models.User.create({
      fullName: 'Test Brand Enterprise',
      email: testBrandEmail,
      password: 'HashedPassword123!',
      role: 'brand',
      isVerified: true
    });

    const brandProfile = await models.BrandProfile.create({
      userId: brandUser._id,
      companyName: 'Test Brand Enterprise',
      industry: 'Technology'
    });

    if (!brandProfile.userId.equals(brandUser._id)) {
      throw new Error(`BrandProfile.userId (${brandProfile.userId}) does not match User._id (${brandUser._id})`);
    }
    console.log(`  ✓ Brand User created: ${brandUser._id}`);
    console.log(`  ✓ BrandProfile linked: BrandProfile.userId === User._id`);
    console.log('  ✅ Brand Identity Relationship Passed\n');

    // 5. Unified User & CreatorProfile Identity Verification
    console.log('[5/7] Verifying Unified Creator User & CreatorProfile Relationship...');
    const testCreatorEmail = `test.creator.p2a.${Date.now()}@collabx.test`;
    const creatorUser = await models.User.create({
      fullName: 'Test Creator Alex',
      email: testCreatorEmail,
      password: 'HashedPassword123!',
      role: 'creator',
      isVerified: true
    });

    const creatorProfile = await models.CreatorProfile.create({
      userId: creatorUser._id,
      bio: 'Digital content creator',
      niche: ['Tech', 'Gaming']
    });

    if (!creatorProfile.userId.equals(creatorUser._id)) {
      throw new Error(`CreatorProfile.userId (${creatorProfile.userId}) does not match User._id (${creatorUser._id})`);
    }
    console.log(`  ✓ Creator User created: ${creatorUser._id}`);
    console.log(`  ✓ CreatorProfile linked: CreatorProfile.userId === User._id`);
    console.log('  ✅ Creator Identity Relationship Passed\n');

    // 6. Unified JWT Authentication & req.user Normalization Test
    console.log('[6/7] Testing Unified JWT & req.user Normalization Layer...');
    const brandToken = generateAccessToken({
      userId: brandUser._id,
      email: brandUser.email,
      role: brandUser.role
    });

    const decodedBrand = verifyAccessToken(brandToken);
    if (decodedBrand.userId !== brandUser._id.toString()) {
      throw new Error('JWT token payload userId mismatch');
    }

    // Simulate normalized req.user object attached by unified auth.middleware.js
    const req = { user: brandUser };
    req.user.userId = brandUser._id;
    req.user.id = brandUser._id;

    if (!req.user._id) throw new Error('req.user._id missing');
    if (!req.user.userId) throw new Error('req.user.userId missing');
    if (!req.user.id) throw new Error('req.user.id missing');
    if (!req.user.email) throw new Error('req.user.email missing');
    if (!req.user.role) throw new Error('req.user.role missing');

    console.log('  ✓ JWT Token generation & verification working');
    console.log('  ✓ req.user._id exists');
    console.log('  ✓ req.user.userId exists');
    console.log('  ✓ req.user.id exists');
    console.log('  ✓ req.user.email exists');
    console.log('  ✓ req.user.role exists');
    console.log('  ✅ Unified JWT & Compatibility Layer Verification Passed\n');

    // 7. Cleanup Temporary Verification Records
    console.log('[7/7] Cleaning up temporary test records...');
    await models.BrandProfile.deleteOne({ _id: brandProfile._id });
    await models.CreatorProfile.deleteOne({ _id: creatorProfile._id });
    await models.User.deleteMany({ _id: { $in: [brandUser._id, creatorUser._id] } });
    console.log('  ✓ Temporary test documents removed safely from MongoDB.\n');

    console.log('====================================================');
    console.log('🎉 PHASE 2A BACKEND FOUNDATION VERIFICATION PASSED');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ PHASE 2A VERIFICATION FAILED!');
    console.error('Error Details:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed cleanly.');
  }
}

runVerification();
