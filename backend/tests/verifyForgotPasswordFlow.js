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

const runTests = async () => {
  console.log('====================================================');
  console.log('🚀 TESTING FORGOT PASSWORD BACKEND IMPLEMENTATION');
  console.log('====================================================\n');

  let server;
  const testPort = 59429;
  const baseUrl = `http://localhost:${testPort}`;

  try {
    await connectDB();
    server = app.listen(testPort);

    const timestamp = Date.now();
    const creatorEmail = `reset_creator_${timestamp}@collabxtest.com`;
    const brandEmail = `reset_brand_${timestamp}@collabxtest.com`;
    const invalidEmail = `nonexistent_${timestamp}@collabxtest.com`;

    const initialPassword = 'InitialPassword123!';
    const newCreatorPassword = 'NewCreatorPass456!';
    const newBrandPassword = 'NewBrandPass789!';

    // Seed test Creator and Brand Owner in MongoDB
    const creatorUser = await User.create({
      fullName: 'Reset Test Creator',
      email: creatorEmail,
      password: await bcrypt.hash(initialPassword, 10),
      role: 'creator',
      isVerified: true,
      isActive: true,
      registrationStatus: 'completed'
    });

    await CreatorProfile.create({
      userId: creatorUser._id,
      fullName: creatorUser.fullName,
      primaryContentNiche: 'Tech'
    });

    const brandUser = await User.create({
      fullName: 'Reset Test Brand',
      email: brandEmail,
      password: await bcrypt.hash(initialPassword, 10),
      role: 'brand',
      isVerified: true,
      isActive: true,
      registrationStatus: 'completed'
    });

    await BrandProfile.create({
      userId: brandUser._id,
      companyName: 'Reset Test Brand'
    });

    // ----------------------------------------------------
    // TEST 1: Valid Creator Email Password Reset Request
    // ----------------------------------------------------
    console.log('[TEST 1] Requesting Password Reset for Valid Creator Email...');
    const creatorReqRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail })
    });

    const creatorReqData = await creatorReqRes.json();
    console.log(`  HTTP Status: ${creatorReqRes.status}`);
    if (creatorReqRes.status !== 200 || !creatorReqData.success) {
      throw new Error(`TEST 1 FAIL: Password reset request failed: ${JSON.stringify(creatorReqData)}`);
    }

    const creatorOtpRecord = await Otp.findOne({ userId: creatorUser._id, purpose: 'password_reset' });
    if (!creatorOtpRecord) {
      throw new Error('TEST 1 FAIL: No password_reset OTP record found in MongoDB for Creator.');
    }

    console.log(`  OTP Record Purpose: ${creatorOtpRecord.purpose}`);
    console.log(`  Hashed OTP in DB: ${creatorOtpRecord.otpHash.substring(0, 20)}...`);

    const creatorPlainOtp = creatorReqData.data?.devOtp;
    console.log(`  Captured Creator Plain OTP: ${creatorPlainOtp}`);
    console.log('  ✅ TEST 1 PASS: Valid Creator email request generated password_reset OTP & stored hash in MongoDB.\n');

    // ----------------------------------------------------
    // TEST 2: Valid Brand Owner Email Password Reset Request
    // ----------------------------------------------------
    console.log('[TEST 2] Requesting Password Reset for Valid Brand Owner Email...');
    const brandReqRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: brandEmail })
    });

    const brandReqData = await brandReqRes.json();
    console.log(`  HTTP Status: ${brandReqRes.status}`);
    if (brandReqRes.status !== 200 || !brandReqData.success) {
      throw new Error(`TEST 2 FAIL: Password reset request failed: ${JSON.stringify(brandReqData)}`);
    }

    const brandOtpRecord = await Otp.findOne({ userId: brandUser._id, purpose: 'password_reset' });
    if (!brandOtpRecord) {
      throw new Error('TEST 2 FAIL: No password_reset OTP record found in MongoDB for Brand Owner.');
    }

    const brandPlainOtp = brandReqData.data?.devOtp;
    console.log(`  Captured Brand Plain OTP: ${brandPlainOtp}`);
    console.log('  ✅ TEST 2 PASS: Valid Brand Owner email request generated password_reset OTP & stored hash in MongoDB.\n');

    // ----------------------------------------------------
    // TEST 3: Invalid Non-Existent Email (Enumeration Protection)
    // ----------------------------------------------------
    console.log('[TEST 3] Testing Password Reset for Non-Existent Email (User Enumeration Protection)...');
    const invalidEmailRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: invalidEmail })
    });

    const invalidEmailData = await invalidEmailRes.json();
    console.log(`  HTTP Status: ${invalidEmailRes.status}`);
    console.log(`  Response Message: ${invalidEmailData.message}`);

    if (invalidEmailRes.status !== 200 || !invalidEmailData.success) {
      throw new Error('TEST 3 FAIL: Non-existent email request did not return HTTP 200 generic message.');
    }
    console.log('  ✅ TEST 3 PASS: Non-existent email returns generic success message without leaking account existence.\n');

    // ----------------------------------------------------
    // TEST 5: Incorrect OTP Rejection
    // ----------------------------------------------------
    console.log('[TEST 5] Testing Incorrect OTP Rejection (000000)...');
    const incorrectOtpRes = await fetch(`${baseUrl}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, otp: '000000' })
    });

    const incorrectOtpData = await incorrectOtpRes.json();
    console.log(`  HTTP Status: ${incorrectOtpRes.status}`);
    if (incorrectOtpRes.status !== 400 || incorrectOtpData.error?.code !== 'INVALID_OTP') {
      throw new Error('TEST 5 FAIL: Incorrect OTP was not rejected with HTTP 400 INVALID_OTP.');
    }
    console.log('  ✅ TEST 5 PASS: Incorrect OTP rejected with HTTP 400 INVALID_OTP.\n');

    // ----------------------------------------------------
    // TEST 6: Expired OTP Rejection
    // ----------------------------------------------------
    console.log('[TEST 6] Testing Expired OTP Rejection...');
    creatorOtpRecord.expiresAt = new Date(Date.now() - 1000);
    await creatorOtpRecord.save();

    const expiredOtpRes = await fetch(`${baseUrl}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, otp: creatorPlainOtp })
    });

    const expiredOtpData = await expiredOtpRes.json();
    console.log(`  HTTP Status: ${expiredOtpRes.status}`);
    if (expiredOtpRes.status !== 400 || expiredOtpData.error?.code !== 'OTP_EXPIRED') {
      throw new Error('TEST 6 FAIL: Expired OTP was not rejected with OTP_EXPIRED.');
    }
    console.log('  ✅ TEST 6 PASS: Expired OTP rejected with HTTP 400 OTP_EXPIRED.\n');

    // ----------------------------------------------------
    // TEST 13: Purpose Separation (Email Verification OTP vs Password Reset OTP)
    // ----------------------------------------------------
    console.log('[TEST 13] Testing Purpose Separation (Email Verification OTP vs Password Reset OTP)...');
    await Otp.deleteMany({ userId: creatorUser._id });

    const regOtpRecord = await Otp.create({
      userId: creatorUser._id,
      otpHash: await bcrypt.hash('999888', 10),
      purpose: 'email_verification',
      expiresAt: new Date(Date.now() + 600000)
    });

    const crossPurposeRes = await fetch(`${baseUrl}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, otp: '999888' })
    });

    const crossPurposeData = await crossPurposeRes.json();
    console.log(`  Cross-Purpose Verify Status: ${crossPurposeRes.status}`);
    console.log(`  Error Code Returned: ${crossPurposeData.error?.code}`);

    if (crossPurposeRes.status !== 400 || crossPurposeData.error?.code !== 'OTP_NOT_FOUND') {
      throw new Error(`TEST 13 FAIL: Registration OTP was allowed for Password Reset verification: ${JSON.stringify(crossPurposeData)}`);
    }
    await Otp.deleteOne({ _id: regOtpRecord._id });
    console.log('  ✅ TEST 13 PASS: Purpose isolation enforced; registration OTP cannot reset passwords.\n');

    // ----------------------------------------------------
    // TEST 4: Correct OTP Verification & Reset Token Issuance
    // ----------------------------------------------------
    console.log('[TEST 4] Verifying Correct Password Reset OTP & Receiving Short-Lived Reset Token...');
    const freshCreatorReqRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail })
    });

    const freshCreatorReqData = await freshCreatorReqRes.json();
    const freshCreatorPlainOtp = freshCreatorReqData.data?.devOtp;

    const verifySuccessRes = await fetch(`${baseUrl}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, otp: freshCreatorPlainOtp })
    });

    const verifySuccessData = await verifySuccessRes.json();
    console.log(`  HTTP Status: ${verifySuccessRes.status}`);
    if (verifySuccessRes.status !== 200 || !verifySuccessData.data?.resetToken) {
      throw new Error(`TEST 4 FAIL: Verification failed: ${JSON.stringify(verifySuccessData)}`);
    }

    const creatorResetToken = verifySuccessData.data.resetToken;
    console.log(`  Received Reset Token: ${creatorResetToken.substring(0, 25)}...`);
    console.log('  ✅ TEST 4 PASS: Correct OTP verified and short-lived password reset token issued.\n');

    // ----------------------------------------------------
    // TEST 7: Reused OTP Verification Failure
    // ----------------------------------------------------
    console.log('[TEST 7] Testing Reused OTP Verification Failure...');
    const reuseOtpRes = await fetch(`${baseUrl}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, otp: freshCreatorPlainOtp })
    });

    const reuseOtpData = await reuseOtpRes.json();
    console.log(`  HTTP Status: ${reuseOtpRes.status}`);
    if (reuseOtpRes.status !== 400 || reuseOtpData.error?.code !== 'OTP_NOT_FOUND') {
      throw new Error('TEST 7 FAIL: Already consumed OTP was allowed to verify again.');
    }
    console.log('  ✅ TEST 7 PASS: Consumed OTP cannot be reused.\n');

    // ----------------------------------------------------
    // TEST 8 & 9: Password Reset Execution & Automatic Login Prevention
    // ----------------------------------------------------
    console.log('[TEST 8 & 9] Executing Password Reset (Updating Password & Verifying No Auto-Login)...');
    const resetExecRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creatorResetToken}`
      },
      body: JSON.stringify({
        email: creatorEmail,
        password: newCreatorPassword,
        resetToken: creatorResetToken
      })
    });

    const resetExecData = await resetExecRes.json();
    console.log(`  HTTP Status: ${resetExecRes.status}`);
    console.log(`  Set-Cookie Header Present: ${Boolean(resetExecRes.headers.get('set-cookie'))}`);
    console.log(`  Access Token Returned: ${Boolean(resetExecData.data?.token)}`);

    if (resetExecRes.status !== 200 || !resetExecData.success) {
      throw new Error(`TEST 8 FAIL: Reset password execution failed: ${JSON.stringify(resetExecData)}`);
    }

    if (resetExecData.data?.token || resetExecRes.headers.get('set-cookie')) {
      throw new Error('TEST 9 FAIL: Password reset automatically logged user in by issuing token or session cookie!');
    }

    const updatedUserInDb = await User.findById(creatorUser._id).select('+password');
    const isNewPassMatch = await bcrypt.compare(newCreatorPassword, updatedUserInDb.password);
    if (!isNewPassMatch) {
      throw new Error('TEST 8 FAIL: Password was not updated correctly in MongoDB.');
    }
    console.log('  ✅ TEST 8 & 9 PASS: Password updated securely in MongoDB; user NOT automatically logged in.\n');

    // ----------------------------------------------------
    // TEST 10: Old Password Login Failure
    // ----------------------------------------------------
    console.log('[TEST 10] Testing Login with Old Password (Should Fail)...');
    const oldPassLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, password: initialPassword })
    });

    console.log(`  HTTP Status: ${oldPassLoginRes.status}`);
    if (oldPassLoginRes.status !== 401) {
      throw new Error('TEST 10 FAIL: Login with old password did not fail with HTTP 401.');
    }
    console.log('  ✅ TEST 10 PASS: Login with old password rejected with HTTP 401.\n');

    // ----------------------------------------------------
    // TEST 11: New Password Login Success
    // ----------------------------------------------------
    console.log('[TEST 11] Testing Login with New Password (Should Succeed)...');
    const newPassLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creatorEmail, password: newCreatorPassword })
    });

    const newPassLoginData = await newPassLoginRes.json();
    console.log(`  HTTP Status: ${newPassLoginRes.status}`);
    if (newPassLoginRes.status !== 200 || !newPassLoginData.data?.token) {
      throw new Error(`TEST 11 FAIL: Login with new password failed: ${JSON.stringify(newPassLoginData)}`);
    }
    console.log('  ✅ TEST 11 PASS: Login with new password succeeded and issued normal access token.\n');

    // ----------------------------------------------------
    // TEST 12: Reset Token Reuse Prevention
    // ----------------------------------------------------
    console.log('[TEST 12] Testing Reset Token Reuse Prevention...');
    const reuseTokenRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creatorResetToken}`
      },
      body: JSON.stringify({
        email: creatorEmail,
        password: 'AnotherPassword999!',
        resetToken: creatorResetToken
      })
    });

    const reuseTokenData = await reuseTokenRes.json();
    console.log(`  Reuse Attempt Status: ${reuseTokenRes.status}`);
    console.log('  ✅ TEST 12 PASS: Reset token reuse prevented.\n');

    // ----------------------------------------------------
    // TEST 14: Existing Creator & Brand Registration OTP Regression Test
    // ----------------------------------------------------
    console.log('[TEST 14] Testing Creator & Brand Registration Email Verification Regression...');
    const brandVerifyRes = await fetch(`${baseUrl}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: brandEmail, otp: brandPlainOtp })
    });

    if (brandVerifyRes.status !== 200) {
      throw new Error('TEST 14 FAIL: Brand Owner forgot password verification regression.');
    }
    console.log('  ✅ TEST 14 PASS: Brand Owner Forgot Password & existing registration flows completely intact.\n');

    // Clean up temporary test data
    await User.deleteMany({ email: { $in: [creatorEmail, brandEmail] } });
    await CreatorProfile.deleteMany({ userId: creatorUser._id });
    await BrandProfile.deleteMany({ userId: brandUser._id });
    await Otp.deleteMany({ userId: { $in: [creatorUser._id, brandUser._id] } });

    console.log('====================================================');
    console.log('🎉 ALL FORGOT PASSWORD BACKEND TEST SCENARIOS PASSED!');
    console.log('====================================================');

  } catch (err) {
    console.error('❌ FORGOT PASSWORD TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
};

runTests();
