/**
 * E2E Nodemailer Gmail SMTP Email Delivery & Auth OTP Verification Suite
 * Tests Creator registration, OTP email delivery via Nodemailer email.service.js,
 * multiple recipient email addresses, OTP verification, invalid OTP rejection,
 * expired OTP rejection, resend OTP flow, and clean cleanup.
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Otp = require('../src/models/otp.model');
const { generateOtp, verifyOtp } = require('../src/modules/auth/services/otp.service');
const { sendOtpEmail } = require('../src/modules/auth/services/email.service');
const { generateAccessToken } = require('../src/utils/jwt');

const PORT = 59992;

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
  console.log('🚀 COLLABX NODEMAILER GMAIL SMTP EMAIL VERIFICATION');
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
    let creatorRecipientA, brandRecipientB;

    try {
      // 1. Setup Test User A (Recipient A - Creator)
      creatorRecipientA = await User.create({
        fullName: `SMTP Creator A ${timestamp}`,
        email: `recipient.a.${timestamp}@gmail.com`,
        password: 'Password123!',
        role: 'creator',
        isVerified: false,
        registrationStatus: 'pending'
      });

      // 2. Setup Test User B (Recipient B - Brand)
      brandRecipientB = await User.create({
        fullName: `SMTP Brand B ${timestamp}`,
        email: `recipient.b.${timestamp}@yahoo.com`,
        password: 'Password123!',
        role: 'brand',
        isVerified: false,
        registrationStatus: 'pending'
      });

      const creatorSignupToken = generateAccessToken({
        userId: creatorRecipientA._id,
        email: creatorRecipientA.email,
        role: 'creator',
        type: 'signup'
      });

      // TEST 1: Direct sendOtpEmail helper delivery test to Recipient A
      console.log('[TEST 1] Testing Nodemailer sendOtpEmail to Recipient A (Creator)...');
      const { plainOtp: otpA } = await generateOtp(creatorRecipientA._id);
      const emailResultA = await sendOtpEmail(creatorRecipientA.email, otpA);

      if (!emailResultA.success || !emailResultA.messageId) {
        throw new Error(`Test 1 Failed: sendOtpEmail returned error: ${JSON.stringify(emailResultA)}`);
      }
      console.log(`  ✅ TEST 1 PASS (Nodemailer sendOtpEmail delivered to ${creatorRecipientA.email}, Message ID: ${emailResultA.messageId})`);

      // TEST 2: Direct sendOtpEmail helper delivery test to Recipient B
      console.log('\n[TEST 2] Testing Nodemailer sendOtpEmail to Recipient B (Brand - Multiple Recipient Test)...');
      const { plainOtp: otpB } = await generateOtp(brandRecipientB._id);
      const emailResultB = await sendOtpEmail(brandRecipientB.email, otpB);

      if (!emailResultB.success || !emailResultB.messageId) {
        throw new Error(`Test 2 Failed: sendOtpEmail returned error: ${JSON.stringify(emailResultB)}`);
      }
      console.log(`  ✅ TEST 2 PASS (Nodemailer sendOtpEmail delivered to ${brandRecipientB.email}, Message ID: ${emailResultB.messageId})`);

      // TEST 3: API Endpoint Email OTP Request (POST /api/creator/auth/otp/send)
      console.log('\n[TEST 3] Testing Creator API requestEmailOtp route (POST /api/creator/auth/otp/send)...');
      const reqOtpRes = await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: '/api/creator/auth/otp/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creatorSignupToken}`,
          'Cookie': `signupToken=${creatorSignupToken}`
        }
      });

      if (reqOtpRes.status !== 200 || !reqOtpRes.body.data?.emailSent) {
        throw new Error(`Test 3 Failed: Request OTP API failed: ${JSON.stringify(reqOtpRes.body)}`);
      }
      console.log(`  ✅ TEST 3 PASS (API OTP request succeeded, emailSent=true for ${creatorRecipientA.email})`);

      // TEST 4: Invalid OTP Verification Rejection
      console.log('\n[TEST 4] Testing invalid OTP verification rejection...');
      try {
        await verifyOtp(creatorRecipientA._id, '999999');
        throw new Error('Test 4 Failed: Expected verifyOtp to throw for invalid code');
      } catch (err) {
        if (err.code !== 'INVALID_OTP') {
          throw err;
        }
      }
      console.log('  ✅ TEST 4 PASS (Invalid OTP code rejected cleanly with code INVALID_OTP)');

      // TEST 5: Expired OTP Verification Rejection
      console.log('\n[TEST 5] Testing expired OTP verification rejection...');
      const otpRecord = await Otp.findOne({ userId: creatorRecipientA._id });
      otpRecord.expiresAt = new Date(Date.now() - 5000); // 5 seconds in the past
      await otpRecord.save();

      try {
        await verifyOtp(creatorRecipientA._id, '123456');
        throw new Error('Test 5 Failed: Expected verifyOtp to throw for expired code');
      } catch (err) {
        if (err.code !== 'OTP_EXPIRED') {
          throw err;
        }
      }
      console.log('  ✅ TEST 5 PASS (Expired OTP code rejected cleanly with code OTP_EXPIRED)');

      // TEST 6: Resend OTP & Successful Verification Flow
      console.log('\n[TEST 6] Testing Resend OTP & Verification flow...');
      const { plainOtp: freshOtp } = await generateOtp(creatorRecipientA._id);
      const resendEmailResult = await sendOtpEmail(creatorRecipientA.email, freshOtp);
      if (!resendEmailResult.success) {
        throw new Error(`Test 6 Failed: Resend OTP email failed: ${JSON.stringify(resendEmailResult)}`);
      }

      const isVerified = await verifyOtp(creatorRecipientA._id, freshOtp);
      if (!isVerified) {
        throw new Error('Test 6 Failed: OTP verification failed for fresh code');
      }
      console.log('  ✅ TEST 6 PASS (Resend OTP delivered & fresh code verified successfully)');

      // Clean up temporary test data
      await User.deleteMany({ _id: { $in: [creatorRecipientA._id, brandRecipientB._id] } });
      await Otp.deleteMany({ userId: { $in: [creatorRecipientA._id, brandRecipientB._id] } });

      console.log('\n====================================================');
      console.log('🎉 NODEMAILER GMAIL SMTP SUITE PASSED 100%');
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
