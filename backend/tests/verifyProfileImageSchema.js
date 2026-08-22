require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const { BrandProfile, CreatorProfile } = require('../src/models');

console.log('====================================================');
console.log('🚀 TESTING PHASE 2 PROFILE IMAGE SCHEMA');
console.log('====================================================');

async function verifySchema() {
  // Test 1: In-memory schema default structure test
  const tempBrand = new BrandProfile({ companyName: 'Test Brand' });
  const tempCreator = new CreatorProfile({ userId: new mongoose.Types.ObjectId() });

  console.log('Temp Brand profileImage defaults:', tempBrand.profileImage);
  console.log('Temp Creator profileImage defaults:', tempCreator.profileImage);

  if (tempBrand.profileImage.url !== null || tempBrand.profileImage.publicId !== null) {
    console.error('❌ BrandProfile profileImage default structure failed.');
    process.exit(1);
  }

  if (tempCreator.profileImage.url !== null || tempCreator.profileImage.publicId !== null) {
    console.error('❌ CreatorProfile profileImage default structure failed.');
    process.exit(1);
  }

  console.log('✅ In-memory schema defaults verified successfully!');

  // Test 2: Database loading test
  try {
    await connectDB();
    console.log('🔌 Connected to MongoDB for profile image schema verification.');

    const sampleBrand = await BrandProfile.findOne({});
    if (sampleBrand) {
      console.log('Sample fetched Brand profileImage:', sampleBrand.profileImage);
    } else {
      console.log('No existing Brand profile in DB to fetch, schema structure verified.');
    }

    const sampleCreator = await CreatorProfile.findOne({});
    if (sampleCreator) {
      console.log('Sample fetched Creator profileImage:', sampleCreator.profileImage);
    } else {
      console.log('No existing Creator profile in DB to fetch, schema structure verified.');
    }

    console.log('====================================================');
    console.log('✅ PHASE 2 PROFILE IMAGE SCHEMA VERIFICATION PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Error during DB profile verification:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

verifySchema();
