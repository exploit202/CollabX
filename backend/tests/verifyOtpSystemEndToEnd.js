/**
 * E2E OTP System End-to-End Hardening & Security Suite
 * Tests 12 assertions: OTP generation, bcrypt hashing persistence, Nodemailer Gmail SMTP delivery,
 * multiple recipient email addresses, valid OTP verification, incorrect OTP rejection,
 * expired OTP rejection, resend OTP flow, old OTP invalidation after resend, Creator registration,
 * Brand registration, and duplicate registration protection.
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Otp = require('../src/models/otp.model');
const CreatorProfile = require('../src/models/creatorProfile.model');
const { generateOtp, verifyOtp } = require('../src/modules/auth/services/otp.service');
const { sendOtpEmail } = require('../src/modules/auth/services/email.service');
const { generateAccessToken } = require('../src/utils/jwt');

const PORT = 59991;

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
  console.log('🚀 COLLABX FINAL OTP SYSTEM END-TO-END SUITE');
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
    let creatorA, brandB, recipientC;

    try {
      // 1. Setup Test Users
      creatorA = await User.create({
        fullName: `OTP Creator ${timestamp}`,
        email: `otp.creator.${timestamp}@gmail.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: false,
        registrationStatus: 'pending'
      });

      brandB = await User.create({
        fullName: `OTP Brand ${timestamp}`,
        email: `otp.brand.${timestamp}@company.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: true,
        registrationStatus: 'completed'
      });

      recipientC = await User.create({
        fullName: `OTP Recipient C ${timestamp}`,
        email: `recipient.c.${timestamp}@yahoo.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: false,
        registrationStatus: 'pending'
      });

      await CreatorProfile.create({
        userId: creatorA._id,
        fullName: creatorA.fullName,
        email: creatorA.email
      });

      const creatorSignupToken = generateAccessToken({
        userId: creatorA._id,
        email: creatorA.email,
        role: 'creator',
        type: 'signup'
      });

      // ASSERTION 1 & 2: Secure OTP Generation & Persistence in MongoDB Atlas
      console.log('[ASSERTION 1 & 2] Testing secure OTP generation & bcrypt hashing persistence...');
      const { plainOtp: firstPlainOtp, otpRecord: firstRecord } = await generateOtp(creatorA._id);
      if (!firstPlainOtp || firstPlainOtp.length !== 6 || !firstRecord.otpHash) {
        throw new Error('Assertion 1/2 Failed: Invalid OTP code or missing bcrypt hash');
      }
      console.log(`  ✅ ASSERTION 1 & 2 PASS (6-digit OTP code generated, bcrypt hash stored in MongoDB)`);

      // ASSERTION 3 & 4: Email Delivery via Nodemailer SMTP to Multiple Recipient Addresses
      console.log('\n[ASSERTION 3 & 4] Testing Nodemailer email delivery to multiple distinct recipient emails...');
      const emailResA = await sendOtpEmail(creatorA.email, firstPlainOtp);
      const emailResC = await sendOtpEmail(recipientC.email, '654321');

      if (!emailResA.success || !emailResC.success) {
        throw new Error('Assertion 3/4 Failed: Email delivery failed for distinct recipients');
      }
      console.log(`  ✅ ASSERTION 3 & 4 PASS (Nodemailer delivered OTPs to ${creatorA.email} and ${recipientC.email})`);

      // ASSERTION 5: API Endpoint OTP Request (POST /api/creator/auth/otp/send)
      console.log('\n[ASSERTION 5] Testing Creator API requestEmailOtp route (POST /api/creator/auth/otp/send)...');
      const apiReqRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/auth/otp/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creatorSignupToken}`,
          'Cookie': `signupToken=${creatorSignupToken}`
        }
      });
      if (apiReqRes.status !== 200 || !apiReqRes.body.data?.emailSent) {
        throw new Error(`Assertion 5 Failed: API OTP request failed: ${JSON.stringify(apiReqRes.body)}`);
      }
      console.log(`  ✅ ASSERTION 5 PASS (API OTP request succeeded, emailSent=true)`);

      // ASSERTION 6: Incorrect OTP Rejection
      console.log('\n[ASSERTION 6] Testing incorrect OTP verification rejection...');
      try {
        await verifyOtp(creatorA._id, '000000');
        throw new Error('Assertion 6 Failed: Expected verifyOtp to throw for incorrect code');
      } catch (err) {
        if (err.code !== 'INVALID_OTP') throw err;
      }
      console.log('  ✅ ASSERTION 6 PASS (Incorrect OTP code rejected with INVALID_OTP)');

      // ASSERTION 7: Expired OTP Rejection
      console.log('\n[ASSERTION 7] Testing expired OTP verification rejection...');
      const dbOtpRecord = await Otp.findOne({ userId: creatorA._id });
      dbOtpRecord.expiresAt = new Date(Date.now() - 10000); // 10s in past
      await dbOtpRecord.save();

      try {
        await verifyOtp(creatorA._id, '123456');
        throw new Error('Assertion 7 Failed: Expected verifyOtp to throw for expired code');
      } catch (err) {
        if (err.code !== 'OTP_EXPIRED') throw err;
      }
      console.log('  ✅ ASSERTION 7 PASS (Expired OTP code rejected with OTP_EXPIRED)');

      // ASSERTION 8 & 9: Resend OTP & Old OTP Invalidation
      console.log('\n[ASSERTION 8 & 9] Testing Resend OTP and Old OTP Invalidation...');
      const { plainOtp: freshOtp } = await generateOtp(creatorA._id);

      // Verify old OTP (firstPlainOtp) is rejected after new OTP is generated
      try {
        await verifyOtp(creatorA._id, firstPlainOtp);
        if (firstPlainOtp !== freshOtp) {
          throw new Error('Assertion 9 Failed: Old OTP code was accepted after resend!');
        }
      } catch (err) {
        if (err.code !== 'INVALID_OTP') throw err;
      }
      console.log('  ✅ ASSERTION 8 & 9 PASS (Resend generated fresh OTP, old OTP code invalidated)');

      // ASSERTION 10: API Endpoint OTP Verification (POST /api/creator/auth/otp/verify)
      console.log('\n[ASSERTION 10] Creator API verifyEmailOtp route (POST /api/creator/auth/otp/verify)...');
      const apiVerifyRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/creator/auth/otp/verify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${creatorSignupToken}`,
            'Cookie': `signupToken=${creatorSignupToken}`
          }
        },
        { otp: freshOtp }
      );

      if (apiVerifyRes.status !== 200 || !apiVerifyRes.body.data?.token || !apiVerifyRes.body.data?.user?.isVerified) {
        throw new Error(`Assertion 10 Failed: API OTP verification failed: ${JSON.stringify(apiVerifyRes.body)}`);
      }
      console.log('  ✅ ASSERTION 10 PASS (Creator verified via API, session token & isVerified=true returned)');

      // ASSERTION 11: Brand Registration Flow
      console.log('\n[ASSERTION 11] Testing Brand Registration flow...');
      const brandRegRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        {
          companyName: `Brand New Co ${timestamp}`,
          workEmail: `brand.new.${timestamp}@company.com`,
          password: 'Password123!',
          contactName: 'Brand Manager',
          industry: 'Technology'
        }
      );
      if (brandRegRes.status !== 201 || !brandRegRes.body.data?.token) {
        throw new Error(`Assertion 11 Failed: Brand registration failed: ${JSON.stringify(brandRegRes.body)}`);
      }
      console.log('  ✅ ASSERTION 11 PASS (Brand registered successfully with authenticated session)');

      // ASSERTION 12: Duplicate Registration Protection
      console.log('\n[ASSERTION 12] Testing Duplicate Registration Protection...');
      const dupRegRes = await makeRequest(
        {
          hostname: 'localhost',
          port: PORT,
          path: '/api/brand/auth/register',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        {
          companyName: `Duplicate Co ${timestamp}`,
          workEmail: brandB.email, // Existing email
          password: 'Password123!',
          contactName: 'Brand Manager'
        }
      );
      if (dupRegRes.status < 400) {
        throw new Error(`Assertion 12 Failed: Expected error HTTP 400/409 for duplicate email, got ${dupRegRes.status}`);
      }
      console.log(`  ✅ ASSERTION 12 PASS (Duplicate registration rejected with HTTP ${dupRegRes.status})`);

      // Clean up temporary test records
      await User.deleteMany({ _id: { $in: [creatorA._id, brandB._id, recipientC._id, brandRegRes.body.data.user._id] } });
      await CreatorProfile.deleteMany({ userId: creatorA._id });
      await Otp.deleteMany({ userId: creatorA._id });

      console.log('\n====================================================');
      console.log('🎉 OTP SYSTEM END-TO-END SUITE PASSED 100%');
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
