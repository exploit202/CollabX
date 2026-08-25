const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const BrandProfile = require('../src/models/brandProfile.model');
const CreatorProfile = require('../src/models/creatorProfile.model');
const Otp = require('../src/models/otp.model');
const app = require('../src/app');

require('dotenv').config();
process.env.FORCE_DEV_OTP_SIMULATION = 'true';

const runE2eTest = async () => {
  console.log('====================================================');
  console.log('🔗 TESTING FRONTEND-BACKEND FORGOT PASSWORD END-TO-END');
  console.log('====================================================\n');

  let server;
  const testPort = 59512;
  const baseUrl = `http://localhost:${testPort}`;

  try {
    await connectDB();
    server = app.listen(testPort);

    const timestamp = Date.now();
    const creatorEmail = `e2e_creator_${timestamp}@collabxtest.com`;
    const brandEmail = `e2e_brand_${timestamp}@collabxtest.com`;

    const oldPassword = 'OldPassword123!';
    const newCreatorPassword = 'NewCreatorPass456!';
    const newBrandPassword = 'NewBrandPass789!';

    // Seed test users
    const creatorUser = await User.create({
      fullName: 'E2E Creator User',
      email: creatorEmail,
      password: await bcrypt.hash(oldPassword, 10),
      role: 'creator',
      isVerified: true,
      isActive: true,
      registrationStatus: 'completed'
    });
    await CreatorProfile.create({ userId: creatorUser._id, fullName: creatorUser.fullName });

    const brandUser = await User.create({
      fullName: 'E2E Brand User',
      email: brandEmail,
      password: await bcrypt.hash(oldPassword, 10),
      role: 'brand',
      isVerified: true,
      isActive: true,
      registrationStatus: 'completed'
    });
    await BrandProfile.create({ userId: brandUser._id, companyName: 'E2E Brand' });

    // ----------------------------------------------------
    // TEST 1: Creator Reset Flow
    // ----------------------------------------------------
    console.log('[E2E TEST 1] Creator Password Reset Integration...');
    // Step 1: Send OTP
    const cSendRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail })
    });
    const cSendData = await cSendRes.json();
    console.log(`  Send OTP Status: ${cSendRes.status}`);
    if (cSendRes.status !== 200 || !cSendData.success) {
      throw new Error(`Send OTP failed: ${JSON.stringify(cSendData)}`);
    }

    const cDevOtp = cSendData.data?.devOtp;
    console.log(`  Dispatched OTP: ${cDevOtp}`);

    // Step 2: Verify OTP
    const cVerifyRes = await fetch(`${baseUrl}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, otp: cDevOtp })
    });
    const cVerifyData = await cVerifyRes.json();
    console.log(`  Verify OTP Status: ${cVerifyRes.status}`);
    if (cVerifyRes.status !== 200 || !cVerifyData.data?.resetToken) {
      throw new Error(`Verify OTP failed: ${JSON.stringify(cVerifyData)}`);
    }

    const cResetToken = cVerifyData.data.resetToken;
    console.log(`  Reset Token Issued: ${cResetToken.substring(0, 20)}...`);

    // Step 3: Reset Password
    const cResetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cResetToken}`
      },
      body: JSON.stringify({ password: newCreatorPassword, resetToken: cResetToken, email: creatorEmail })
    });
    const cResetData = await cResetRes.json();
    console.log(`  Reset Password Status: ${cResetRes.status}`);
    if (cResetRes.status !== 200 || !cResetData.success) {
      throw new Error(`Reset password failed: ${JSON.stringify(cResetData)}`);
    }

    // Step 4: Verify Old Password Fails & New Password Logs In
    const cOldLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, password: oldPassword })
    });
    if (cOldLoginRes.status !== 401) {
      throw new Error('E2E FAIL: Old password login did not return 401.');
    }

    const cNewLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, password: newCreatorPassword })
    });
    const cNewLoginData = await cNewLoginRes.json();
    if (cNewLoginRes.status !== 200 || !cNewLoginData.data?.token) {
      throw new Error(`E2E FAIL: Login with new password failed: ${JSON.stringify(cNewLoginData)}`);
    }
    console.log('  ✅ E2E TEST 1 PASS: Creator password reset & manual login verified 100%.\n');

    // ----------------------------------------------------
    // TEST 2: Brand Owner Reset Flow
    // ----------------------------------------------------
    console.log('[E2E TEST 2] Brand Owner Password Reset Integration...');
    // Step 1: Send OTP
    const bSendRes = await fetch(`${baseUrl}/api/brand/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: brandEmail })
    });
    const bSendData = await bSendRes.json();
    console.log(`  Send OTP Status: ${bSendRes.status}`);
    const bDevOtp = bSendData.data?.devOtp;

    // Step 2: Verify OTP
    const bVerifyRes = await fetch(`${baseUrl}/api/brand/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: brandEmail, otp: bDevOtp })
    });
    const bVerifyData = await bVerifyRes.json();
    const bResetToken = bVerifyData.data?.resetToken;

    // Step 3: Reset Password
    const bResetRes = await fetch(`${baseUrl}/api/brand/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bResetToken}`
      },
      body: JSON.stringify({ password: newBrandPassword, resetToken: bResetToken })
    });
    const bResetData = await bResetRes.json();
    if (bResetRes.status !== 200 || !bResetData.success) {
      throw new Error(`Brand Reset Password failed: ${JSON.stringify(bResetData)}`);
    }

    // Step 4: Login with New Password
    const bNewLoginRes = await fetch(`${baseUrl}/api/brand/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: brandEmail, password: newBrandPassword })
    });
    const bNewLoginData = await bNewLoginRes.json();
    if (bNewLoginRes.status !== 200 || !bNewLoginData.data?.token) {
      throw new Error(`E2E FAIL: Brand login with new password failed: ${JSON.stringify(bNewLoginData)}`);
    }
    console.log('  ✅ E2E TEST 2 PASS: Brand Owner password reset & manual login verified 100%.\n');

    // Clean up test data
    await User.deleteMany({ email: { $in: [creatorEmail, brandEmail] } });
    await CreatorProfile.deleteMany({ userId: creatorUser._id });
    await BrandProfile.deleteMany({ userId: brandUser._id });
    await Otp.deleteMany({ userId: { $in: [creatorUser._id, brandUser._id] } });

    console.log('====================================================');
    console.log('🎉 FRONTEND-BACKEND END-TO-END FORGOT PASSWORD PASSED 100%!');
    console.log('====================================================');

  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
};

runE2eTest();
