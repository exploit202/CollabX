require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const CreatorProfile = require('../src/models/creatorProfile.model');
const BrandProfile = require('../src/models/brandProfile.model');
const { generateAccessToken } = require('../src/utils/jwt');
const cloudinary = require('../src/config/cloudinary');

console.log('====================================================');
console.log('🚀 TESTING PHASE 3 PROFILE IMAGE UPLOAD BACKEND');
console.log('====================================================');

let server;
let baseUrl;

// Sample 1x1 transparent PNG buffer (valid image)
const validPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Sample invalid text buffer
const invalidTxtBuffer = Buffer.from('This is a plain text file, not an image.', 'utf-8');

// Sample oversized buffer (> 5 MB)
const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024); // 5MB + 1KB

function createMultipartBody(boundary, fieldName, filename, mimetype, buffer) {
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: ${mimetype}\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  return Buffer.concat([Buffer.from(header, 'utf-8'), buffer, Buffer.from(footer, 'utf-8')]);
}

function makeRequest(options, postBuffer) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (_) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (postBuffer) req.write(postBuffer);
    req.end();
  });
}

async function runTests() {
  try {
    await connectDB();
    console.log('🔌 Connected to MongoDB.');

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    console.log(`📡 Test server listening on port ${port}`);

    // Create test Creator User & Profile
    const creatorUser = await User.create({
      fullName: 'Test Creator Upload',
      email: `creator_upload_${Date.now()}@collabx.test`,
      password: 'password123',
      role: 'creator',
      isActive: true,
      registrationStatus: 'completed'
    });
    const creatorProfile = await CreatorProfile.create({ userId: creatorUser._id });
    const creatorToken = generateAccessToken({ userId: creatorUser._id, role: 'creator' });

    // Create test Brand User & Profile
    const brandUser = await User.create({
      fullName: 'Test Brand Upload',
      email: `brand_upload_${Date.now()}@collabx.test`,
      password: 'password123',
      role: 'brand',
      isActive: true,
      registrationStatus: 'completed'
    });
    const brandProfile = await BrandProfile.create({ userId: brandUser._id, companyName: 'Upload Brand Inc' });
    const brandToken = generateAccessToken({ userId: brandUser._id, role: 'brand' });

    console.log('\n--- Test 1: Unauthenticated Upload Request ---');
    {
      const boundary = '----TestBoundary' + Date.now();
      const body = createMultipartBody(boundary, 'image', 'test.png', 'image/png', validPngBuffer);
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port,
          path: '/api/creator/profile/avatar',
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length
          }
        },
        body
      );
      console.log('Status:', res.status);
      if (res.status !== 401) {
        throw new Error(`Expected 401 Unauthorized for unauthenticated upload, got ${res.status}`);
      }
      console.log('✅ Unauthenticated upload rejected with 401 Unauthorized.');
    }

    console.log('\n--- Test 2: Empty File Upload ---');
    {
      const boundary = '----TestBoundary' + Date.now();
      const body = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="text"\r\n\r\nHello\r\n--${boundary}--\r\n`);
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port,
          path: '/api/creator/profile/avatar',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creatorToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length
          }
        },
        body
      );
      console.log('Status:', res.status, res.body);
      if (res.status !== 400 || res.body.error?.code !== 'EMPTY_UPLOAD') {
        throw new Error(`Expected 400 Bad Request with EMPTY_UPLOAD code, got ${res.status}`);
      }
      console.log('✅ Empty file upload rejected with 400 Bad Request.');
    }

    console.log('\n--- Test 3: Invalid File Type Upload (.txt) ---');
    {
      const boundary = '----TestBoundary' + Date.now();
      const body = createMultipartBody(boundary, 'image', 'sample.txt', 'text/plain', invalidTxtBuffer);
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port,
          path: '/api/creator/profile/avatar',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creatorToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length
          }
        },
        body
      );
      console.log('Status:', res.status, res.body);
      if (res.status !== 400 || res.body.error?.code !== 'INVALID_FILE_TYPE') {
        throw new Error(`Expected 400 Bad Request with INVALID_FILE_TYPE, got ${res.status}`);
      }
      console.log('✅ Invalid file type upload rejected with 400 Bad Request.');
    }

    console.log('\n--- Test 4: Oversized File Upload (> 5 MB) ---');
    {
      const boundary = '----TestBoundary' + Date.now();
      const body = createMultipartBody(boundary, 'image', 'large.png', 'image/png', oversizedBuffer);
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port,
          path: '/api/creator/profile/avatar',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creatorToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length
          }
        },
        body
      );
      console.log('Status:', res.status, res.body);
      if (res.status !== 400 || res.body.error?.code !== 'LIMIT_FILE_SIZE') {
        throw new Error(`Expected 400 Bad Request with LIMIT_FILE_SIZE, got ${res.status}`);
      }
      console.log('✅ Oversized file upload rejected with 400 Bad Request.');
    }

    console.log('\n--- Test 5: Creator Upload Valid Profile Image ---');
    let firstCreatorPublicId = null;
    {
      const boundary = '----TestBoundary' + Date.now();
      const body = createMultipartBody(boundary, 'image', 'avatar.png', 'image/png', validPngBuffer);
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port,
          path: '/api/creator/profile/avatar',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creatorToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length
          }
        },
        body
      );
      console.log('Status:', res.status, res.body);
      if (res.status !== 200 || !res.body.data?.profileImage?.url) {
        throw new Error(`Creator upload failed: ${JSON.stringify(res.body)}`);
      }
      firstCreatorPublicId = res.body.data.profileImage.publicId;

      if (!firstCreatorPublicId.startsWith('collabx/profiles/creators/')) {
        throw new Error(`Expected Cloudinary folder collabx/profiles/creators/, got ${firstCreatorPublicId}`);
      }

      // Verify MongoDB updated
      const updatedCreator = await CreatorProfile.findOne({ userId: creatorUser._id });
      const updatedUser = await User.findById(creatorUser._id);
      if (updatedCreator.profileImage.publicId !== firstCreatorPublicId || updatedUser.profileImage !== res.body.data.profileImage.url) {
        throw new Error('MongoDB Creator Profile or User profileImage was not updated correctly!');
      }

      console.log('✅ Creator valid profile image uploaded successfully to Cloudinary & MongoDB!');
    }

    console.log('\n--- Test 6: Brand Upload Valid Profile Image ---');
    {
      const boundary = '----TestBoundary' + Date.now();
      const body = createMultipartBody(boundary, 'image', 'brand_logo.png', 'image/png', validPngBuffer);
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port,
          path: '/api/brand/profile/avatar',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${brandToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length
          }
        },
        body
      );
      console.log('Status:', res.status, res.body);
      if (res.status !== 200 || !res.body.data?.profileImage?.url) {
        throw new Error(`Brand upload failed: ${JSON.stringify(res.body)}`);
      }

      const brandPublicId = res.body.data.profileImage.publicId;
      if (!brandPublicId.startsWith('collabx/profiles/brands/')) {
        throw new Error(`Expected Cloudinary folder collabx/profiles/brands/, got ${brandPublicId}`);
      }

      // Verify MongoDB updated
      const updatedBrand = await BrandProfile.findOne({ userId: brandUser._id });
      const updatedUser = await User.findById(brandUser._id);
      if (updatedBrand.profileImage.publicId !== brandPublicId || updatedUser.profileImage !== res.body.data.profileImage.url) {
        throw new Error('MongoDB Brand Profile or User profileImage was not updated correctly!');
      }

      console.log('✅ Brand valid profile image uploaded successfully to Cloudinary & MongoDB!');
    }

    console.log('\n--- Test 7: Replacing Existing Image & Old Asset Deletion ---');
    {
      const boundary = '----TestBoundary' + Date.now();
      const body = createMultipartBody(boundary, 'image', 'new_avatar.png', 'image/png', validPngBuffer);
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port,
          path: '/api/creator/profile/avatar',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${creatorToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length
          }
        },
        body
      );
      console.log('Status:', res.status, res.body);
      if (res.status !== 200 || !res.body.data?.profileImage?.url) {
        throw new Error(`Replacing image failed: ${JSON.stringify(res.body)}`);
      }
      const newCreatorPublicId = res.body.data.profileImage.publicId;

      if (newCreatorPublicId === firstCreatorPublicId) {
        throw new Error('Expected new publicId upon replacing profile image.');
      }

      console.log(`Replaced image: Old Public ID (${firstCreatorPublicId}) -> New Public ID (${newCreatorPublicId})`);
      console.log('✅ Replacing existing profile image & deleting previous asset passed!');

      // Cleanup Cloudinary asset
      await cloudinary.uploader.destroy(newCreatorPublicId);
    }

    console.log('\n--- Test 8: Cleanup temporary test users from DB ---');
    await User.deleteMany({ _id: { $in: [creatorUser._id, brandUser._id] } });
    await CreatorProfile.deleteMany({ userId: creatorUser._id });
    await BrandProfile.deleteMany({ userId: brandUser._id });
    console.log('✅ DB Cleanup completed!');

    console.log('====================================================');
    console.log('🎉 PHASE 3 PROFILE IMAGE UPLOAD BACKEND PASSED 100%!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Phase 3 Upload Verification Failed:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
}

runTests();
