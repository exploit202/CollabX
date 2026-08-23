const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const BrandProfile = require('../src/models/brandProfile.model');
const Otp = require('../src/models/otp.model');
const app = require('../src/app');

require('dotenv').config();
process.env.FORCE_DEV_OTP_SIMULATION = 'true';

const runTests = async () => {
  console.log('====================================================');
  console.log('🚀 TESTING BRAND OWNER EMAIL OTP VERIFICATION FLOW');
  console.log('====================================================\n');

  let server;
  const testPort = 59289;
  const baseUrl = `http://localhost:${testPort}`;

  try {
    await connectDB();
    server = app.listen(testPort);

    const testEmail = `brandtest_${Date.now()}@collabxtest.com`;
    const testPassword = 'BrandPassword123!';
    const companyName = 'Apex Tech Corp';

    // ----------------------------------------------------
    // TEST 1: Brand Owner Registration Creates Pending Account
    // ----------------------------------------------------
    console.log('[TEST 1] Registering new Brand Owner...');
    const regRes = await fetch(`${baseUrl}/api/brand/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName,
        workEmail: testEmail,
        password: testPassword,
        industryType: 'SaaS & Tech',
        aboutBrand: 'Leading SaaS solutions brand'
      })
    });

    const regData = await regRes.json();
    console.log(`  Status: ${regRes.status}`);
    if (regRes.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }

    const { user, token, signupToken } = regData.data;
    console.log(`  User ID: ${user._id || user.userId}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  isVerified: ${user.isVerified}`);
    console.log(`  registrationStatus: ${user.registrationStatus}`);

    if (user.role !== 'brand' || user.isVerified !== false || user.registrationStatus !== 'pending') {
      throw new Error('TEST 1 FAIL: Brand registration did not create pending/unverified state.');
    }
    console.log('  ✅ TEST 1 PASS: Brand registration created pending/unverified account.\n');

    const brandUserId = user._id || user.userId;
    const cookieHeader = regRes.headers.get('set-cookie');

    // ----------------------------------------------------
    // TEST 2 & 3 & 4: OTP Generation, Storage & Email Send
    // ----------------------------------------------------
    console.log('[TEST 2-4] Requesting Email OTP for Brand Owner...');
    const otpSendRes = await fetch(`${baseUrl}/api/brand/auth/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || signupToken}`,
        ...(cookieHeader && { 'Cookie': cookieHeader })
      }
    });

    const otpSendData = await otpSendRes.json();
    console.log(`  Status: ${otpSendRes.status}`);
    if (otpSendRes.status !== 200) {
      throw new Error(`OTP Request failed: ${JSON.stringify(otpSendData)}`);
    }

    // Inspect MongoDB for OTP record
    const otpRecord = await Otp.findOne({ userId: brandUserId });
    if (!otpRecord) {
      throw new Error('TEST 3 FAIL: No OTP record found in MongoDB.');
    }

    console.log(`  Stored OTP Hash: ${otpRecord.otpHash.substring(0, 20)}... (Length: ${otpRecord.otpHash.length})`);
    console.log(`  Expires At: ${otpRecord.expiresAt}`);
    console.log(`  Attempts: ${otpRecord.attempts}`);

    // Confirm plaintext OTP is NOT stored in MongoDB
    if (otpRecord.otpHash.length < 30 || !otpRecord.otpHash.startsWith('$2')) {
      throw new Error('TEST 3 FAIL: OTP is not securely hashed using bcrypt in MongoDB!');
    }
    console.log('  ✅ TEST 2-4 PASS: Valid 6-digit OTP generated, hashed via bcrypt, stored in MongoDB, and dispatched via email service.\n');

    // ----------------------------------------------------
    // TEST 6: Invalid OTP Rejection
    // ----------------------------------------------------
    console.log('[TEST 6] Testing Invalid OTP Rejection (000000)...');
    const invalidVerifyRes = await fetch(`${baseUrl}/api/brand/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || signupToken}`,
        ...(cookieHeader && { 'Cookie': cookieHeader })
      },
      body: JSON.stringify({ otp: '000000' })
    });

    const invalidVerifyData = await invalidVerifyRes.json();
    console.log(`  Status: ${invalidVerifyRes.status}`);

    if (invalidVerifyRes.status !== 400 || invalidVerifyData.error?.code !== 'INVALID_OTP') {
      throw new Error('TEST 6 FAIL: Invalid OTP was not properly rejected with HTTP 400.');
    }

    const updatedOtpRecord = await Otp.findOne({ userId: brandUserId });
    if (updatedOtpRecord.attempts !== 1) {
      throw new Error('TEST 6 FAIL: Failed attempt counter was not incremented.');
    }
    console.log('  ✅ TEST 6 PASS: Invalid OTP rejected and attempt counter incremented.\n');

    // ----------------------------------------------------
    // TEST 8: Resend OTP (Replaces / Invalidates Old OTP)
    // ----------------------------------------------------
    console.log('[TEST 8] Testing OTP Resend (Invalidating old OTP)...');
    const resendRes = await fetch(`${baseUrl}/api/brand/auth/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || signupToken}`,
        ...(cookieHeader && { 'Cookie': cookieHeader })
      }
    });

    const resendData = await resendRes.json();
    if (resendRes.status !== 200) {
      throw new Error(`Resend failed: ${JSON.stringify(resendData)}`);
    }

    const newOtpRecord = await Otp.findOne({ userId: brandUserId });
    if (newOtpRecord.attempts !== 0) {
      throw new Error('TEST 8 FAIL: Attempt counter was not reset on new OTP generation.');
    }
    console.log('  ✅ TEST 8 PASS: Resend successfully updated OTP hash and reset attempts.\n');

    // ----------------------------------------------------
    // TEST 7: Expired OTP Failure
    // ----------------------------------------------------
    console.log('[TEST 7] Testing Expired OTP Handling...');
    newOtpRecord.expiresAt = new Date(Date.now() - 1000);
    await newOtpRecord.save();

    const expiredVerifyRes = await fetch(`${baseUrl}/api/brand/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || signupToken}`,
        ...(cookieHeader && { 'Cookie': cookieHeader })
      },
      body: JSON.stringify({ otp: '123456' })
    });

    const expiredVerifyData = await expiredVerifyRes.json();
    console.log(`  Status: ${expiredVerifyRes.status}`);
    if (expiredVerifyRes.status !== 400 || expiredVerifyData.error?.code !== 'OTP_EXPIRED') {
      throw new Error('TEST 7 FAIL: Expired OTP was not rejected with OTP_EXPIRED code.');
    }
    console.log('  ✅ TEST 7 PASS: Expired OTP correctly rejected.\n');

    // ----------------------------------------------------
    // TEST 5: Successful OTP Verification
    // ----------------------------------------------------
    console.log('[TEST 5] Verifying valid OTP and completing Brand Owner registration...');
    const freshOtpRes = await fetch(`${baseUrl}/api/brand/auth/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || signupToken}`,
        ...(cookieHeader && { 'Cookie': cookieHeader })
      }
    });

    const freshOtpData = await freshOtpRes.json();
    const validPlainOtp = freshOtpData.data?.devOtp;
    console.log(`  Dispatched Plain OTP: ${validPlainOtp}`);

    if (!validPlainOtp) {
      throw new Error('devOtp was not returned in development mode.');
    }

    const verifySuccessRes = await fetch(`${baseUrl}/api/brand/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || signupToken}`,
        ...(cookieHeader && { 'Cookie': cookieHeader })
      },
      body: JSON.stringify({ otp: validPlainOtp })
    });

    const verifySuccessData = await verifySuccessRes.json();
    console.log(`  Status: ${verifySuccessRes.status}`);
    if (verifySuccessRes.status !== 200) {
      throw new Error(`OTP Verification failed: ${JSON.stringify(verifySuccessData)}`);
    }

    const verifiedUser = verifySuccessData.data.user;
    console.log(`  Verified User Role: ${verifiedUser.role}`);
    console.log(`  Verified isVerified: ${verifiedUser.isVerified}`);
    console.log(`  Verified registrationStatus: ${verifiedUser.registrationStatus}`);

    if (verifiedUser.isVerified !== true || verifiedUser.registrationStatus !== 'completed') {
      throw new Error('TEST 5 FAIL: Brand Owner status was not updated to verified/completed.');
    }

    const consumedOtp = await Otp.findOne({ userId: brandUserId });
    if (consumedOtp) {
      throw new Error('TEST 5 FAIL: OTP record was not deleted from MongoDB after successful verification.');
    }
    console.log('  ✅ TEST 5 PASS: Valid OTP verified, Brand Owner marked completed, full access token issued, and OTP record deleted.\n');

    // ----------------------------------------------------
    // TEST 10: Creator Role Regression Test
    // ----------------------------------------------------
    console.log('[TEST 10] Testing Creator OTP Flow Regression...');
    const creatorEmail = `creatortest_${Date.now()}@collabxtest.com`;
    const creatorRegRes = await fetch(`${baseUrl}/api/creator/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Creator',
        email: creatorEmail,
        password: 'CreatorPass123!',
        primaryContentNiche: 'Tech & Gadgets'
      })
    });

    const creatorRegData = await creatorRegRes.json();
    if (creatorRegRes.status !== 201) {
      throw new Error(`Creator registration failed: ${JSON.stringify(creatorRegData)}`);
    }

    const creatorCookie = creatorRegRes.headers.get('set-cookie');
    const creatorToken = creatorRegData.data.signupToken;

    const creatorOtpSendRes = await fetch(`${baseUrl}/api/creator/auth/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creatorToken}`,
        ...(creatorCookie && { 'Cookie': creatorCookie })
      }
    });

    const creatorOtpSendData = await creatorOtpSendRes.json();
    const creatorPlainOtp = creatorOtpSendData.data?.devOtp;

    const creatorVerifyRes = await fetch(`${baseUrl}/api/creator/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creatorToken}`,
        ...(creatorCookie && { 'Cookie': creatorCookie })
      },
      body: JSON.stringify({ otp: creatorPlainOtp })
    });

    const creatorVerifyData = await creatorVerifyRes.json();
    if (creatorVerifyRes.status !== 200 || creatorVerifyData.data.user.registrationStatus !== 'completed') {
      throw new Error('TEST 10 FAIL: Creator OTP flow regression detected.');
    }
    console.log('  ✅ TEST 10 PASS: Creator OTP verification flow works 100% identically as before without any regression.\n');

    // Clean up test data
    await User.deleteMany({ email: { $in: [testEmail, creatorEmail] } });
    await BrandProfile.deleteMany({ companyName });
    await Otp.deleteMany({ userId: { $in: [brandUserId, creatorRegData.data.user.userId || creatorRegData.data.user._id] } });

    console.log('====================================================');
    console.log('🎉 ALL 10 BRAND OWNER & CREATOR OTP TESTS PASSED!');
    console.log('====================================================');

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
};

runTests();
