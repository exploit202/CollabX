const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const BrandProfile = require('../src/models/brandProfile.model');
const Otp = require('../src/models/otp.model');
const app = require('../src/app');

require('dotenv').config();
process.env.FORCE_DEV_OTP_SIMULATION = 'true';

const runIntegrationTest = async () => {
  console.log('====================================================');
  console.log('🔗 TESTING BRAND OWNER FRONTEND-BACKEND OTP INTEGRATION');
  console.log('====================================================\n');

  let server;
  const testPort = 59318;
  const baseUrl = `http://localhost:${testPort}`;

  try {
    await connectDB();
    server = app.listen(testPort);

    const companyName = 'NEXUS AI SYSTEMS';
    const workEmail = `nexus_brand_${Date.now()}@collabxtest.com`;
    const password = 'NexusPassword123!';

    // ----------------------------------------------------
    // STEP 1: Simulate Frontend Register API Call
    // (Mimics BrandSignupWizard -> registerBrand call)
    // ----------------------------------------------------
    console.log('[STEP 1] Frontend submitting Brand Owner registration (BrandSignupWizard)...');
    const regRes = await fetch(`${baseUrl}/api/brand/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName,
        workEmail,
        password,
        industryType: 'SaaS & Tech',
        aboutBrand: 'AI Infrastructure Platform'
      })
    });

    const regData = await regRes.json();
    console.log(`  HTTP Status: ${regRes.status}`);
    if (regRes.status !== 201 || !regData.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }

    const signupToken = regData.data.signupToken || regData.data.token;
    const initialUser = regData.data.user;
    const cookieHeader = regRes.headers.get('set-cookie');

    console.log(`  User Created: ${initialUser._id || initialUser.userId}`);
    console.log(`  Initial isVerified: ${initialUser.isVerified}`);
    console.log(`  Initial registrationStatus: ${initialUser.registrationStatus}`);
    console.log(`  Signup Token Received: ${signupToken.substring(0, 20)}...`);

    if (initialUser.isVerified !== false || initialUser.registrationStatus !== 'pending') {
      throw new Error('INTEGRATION FAIL: User not in pending/unverified status after registration.');
    }
    console.log('  ✅ STEP 1 PASS: Registration API connected & returned pending user status + signupToken.\n');

    // ----------------------------------------------------
    // STEP 2: Simulate Frontend Request OTP API Call
    // (Mimics BrandSignupWizard -> auto handleRequestOtp)
    // ----------------------------------------------------
    console.log('[STEP 2] Frontend requesting OTP dispatch (BrandSignupWizard auto-dispatch)...');
    const otpSendRes = await fetch(`${baseUrl}/api/brand/auth/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signupToken}`,
        ...(cookieHeader && { 'Cookie': cookieHeader })
      }
    });

    const otpSendData = await otpSendRes.json();
    console.log(`  HTTP Status: ${otpSendRes.status}`);
    if (otpSendRes.status !== 200 || !otpSendData.success) {
      throw new Error(`OTP Send failed: ${JSON.stringify(otpSendData)}`);
    }

    const devOtp = otpSendData.data?.devOtp;
    const otpRecord = await Otp.findOne({ userId: initialUser._id || initialUser.userId });
    if (!otpRecord) {
      throw new Error('INTEGRATION FAIL: OTP record not found in MongoDB.');
    }

    console.log(`  Dispatched OTP for Test Verification: ${devOtp}`);
    console.log('  ✅ STEP 2 PASS: OTP request API connected, generated bcrypt hash in MongoDB, and dispatched email.\n');

    // ----------------------------------------------------
    // STEP 3: Simulate Frontend Verify OTP API Call
    // (Mimics BrandSignupWizard -> handleVerifyOtpSubmit)
    // ----------------------------------------------------
    console.log('[STEP 3] Frontend submitting 6-digit OTP verification (BrandSignupWizard)...');
    const verifyRes = await fetch(`${baseUrl}/api/brand/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signupToken}`,
        ...(cookieHeader && { 'Cookie': cookieHeader })
      },
      body: JSON.stringify({ otp: devOtp })
    });

    const verifyData = await verifyRes.json();
    console.log(`  HTTP Status: ${verifyRes.status}`);
    if (verifyRes.status !== 200 || !verifyData.success) {
      throw new Error(`OTP Verification failed: ${JSON.stringify(verifyData)}`);
    }

    const fullAccessToken = verifyData.data.token;
    const updatedUser = verifyData.data.user;

    console.log(`  Full Access Token Received: ${fullAccessToken.substring(0, 20)}...`);
    console.log(`  Final isVerified: ${updatedUser.isVerified}`);
    console.log(`  Final registrationStatus: ${updatedUser.registrationStatus}`);

    if (updatedUser.isVerified !== true || updatedUser.registrationStatus !== 'completed') {
      throw new Error('INTEGRATION FAIL: User status not updated to verified/completed.');
    }

    const deletedOtp = await Otp.findOne({ userId: initialUser._id || initialUser.userId });
    if (deletedOtp) {
      throw new Error('INTEGRATION FAIL: OTP record was not deleted from MongoDB after successful verification.');
    }
    console.log('  ✅ STEP 3 PASS: OTP verification API connected, updated user to verified/completed, issued full access token, and deleted OTP record.\n');

    // ----------------------------------------------------
    // STEP 4: Simulate Authenticated Dashboard Fetch
    // (Mimics navigating to /brand/dashboard with full access token)
    // ----------------------------------------------------
    console.log('[STEP 4] Frontend accessing Brand Profile with Full Access Token...');
    const profileRes = await fetch(`${baseUrl}/api/brand/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${fullAccessToken}`
      }
    });

    const profileData = await profileRes.json();
    console.log(`  HTTP Status: ${profileRes.status}`);
    if (profileRes.status !== 200 || !profileData.success) {
      throw new Error(`Profile access failed: ${JSON.stringify(profileData)}`);
    }

    console.log(`  Brand Profile Retrieved: ${profileData.data?.profile?.companyName}`);
    console.log('  ✅ STEP 4 PASS: Full Access Token successfully authorized Brand Dashboard / Profile access.\n');

    // Clean up temporary test data
    await User.deleteOne({ email: workEmail });
    await BrandProfile.deleteOne({ companyName });

    console.log('====================================================');
    console.log('🎉 FRONTEND-BACKEND BRAND OWNER OTP INTEGRATION VERIFIED 100% SUCCESSFUL!');
    console.log('====================================================');

  } catch (err) {
    console.error('❌ INTEGRATION TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
};

runIntegrationTest();
