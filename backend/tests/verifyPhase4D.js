require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const models = require('../src/models');
const { generateToken } = require('../src/utils/jwt');

let server;
let baseUrl;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const postData = body ? JSON.stringify(body) : '';

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(postData);
    req.end();
  });
}

async function runPhase4DTests() {
  console.log('====================================================');
  console.log('🧪 COLLABX PHASE 4D NOTIFICATION & EVENT SYSTEM VERIFICATION');
  console.log('====================================================\n');

  const testResults = [];
  const createdUserIds = [];
  const createdCampaignIds = [];
  const createdInvitationIds = [];
  const createdCollaborationIds = [];
  const createdPaymentIds = [];
  const createdReviewIds = [];

  const recordResult = (testName, status, details = '') => {
    testResults.push({ test: testName, status, details });
    console.log(`${status === 'PASS' ? '  ✅' : '  ❌'} ${testName} — ${status} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // 1. Connect DB
    await connectDB();
    console.log(`🔌 Database connected: ${mongoose.connection.name}`);

    // 2. Start HTTP server on random port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    console.log(`📡 Test Server listening on ${baseUrl}`);

    const timestamp = Date.now();
    const brandEmail = `phase4d_brand_${timestamp}@collabx.com`;
    const creatorEmail = `phase4d_creator_${timestamp}@collabx.com`;
    const brandBEmail = `phase4d_brandB_${timestamp}@collabx.com`;
    const creatorBEmail = `phase4d_creatorB_${timestamp}@collabx.com`;
    const password = 'SecurePassword123!';

    // ==================================================
    // STEP 1-4 — ACCOUNTS & AUTHENTICATION
    // ==================================================
    console.log('\n[STEP 1-4] Registering test accounts for Brand A, Creator A, Brand B, Creator B...');

    // Brand A
    await makeRequest('POST', '/api/brand/auth/register', {
      companyName: 'Phase 4D Brand Corp',
      email: brandEmail,
      password: password
    });
    const brandUser = await models.User.findOne({ email: brandEmail });
    createdUserIds.push(brandUser._id);
    const brandToken = generateToken(brandUser);

    // Creator A
    await makeRequest('POST', '/api/creator/auth/register', {
      fullName: 'Phase 4D Creator Alpha',
      email: creatorEmail,
      password: password,
      primaryContentNiche: 'Tech & Lifestyle'
    });
    const creatorUser = await models.User.findOne({ email: creatorEmail });
    createdUserIds.push(creatorUser._id);
    const creatorToken = generateToken(creatorUser);

    // Brand B (unrelated)
    const brandBUser = await models.User.create({
      companyName: 'Phase 4D Brand Beta',
      email: brandBEmail,
      passwordHash: 'hashed_pw',
      role: 'brand',
      isActive: true
    });
    createdUserIds.push(brandBUser._id);
    const brandBToken = generateToken(brandBUser);

    // Creator B (unrelated)
    const creatorBUser = await models.User.create({
      fullName: 'Phase 4D Creator Beta',
      email: creatorBEmail,
      passwordHash: 'hashed_pw',
      role: 'creator',
      isActive: true
    });
    createdUserIds.push(creatorBUser._id);
    const creatorBToken = generateToken(creatorBUser);

    recordResult('STEP 1-4: Account Creation & JWT Authentication', 'PASS', `Brand A: ${brandUser._id}, Creator A: ${creatorUser._id}`);

    // ==================================================
    // EVENT 1 — COLLABORATION INVITATION NOTIFICATION
    // ==================================================
    console.log('\n[EVENT 1] Sending campaign invitation (collaboration_invitation)...');
    const campaignDoc = await models.Campaign.create({
      brandId: brandUser._id,
      brandName: 'Phase 4D Brand Corp',
      title: 'Phase 4D Notification Test Campaign',
      description: 'Testing event notification pipeline',
      category: 'Tech & Lifestyle',
      budget: 25000,
      status: 'active'
    });
    createdCampaignIds.push(campaignDoc._id);

    const inviteRes = await makeRequest('POST', '/api/brand/invitations', {
      campaignId: campaignDoc._id,
      creatorId: creatorUser._id,
      proposedPrice: 25000,
      message: 'Join our Phase 4D campaign launch!'
    }, { Authorization: `Bearer ${brandToken}` });

    const invitationDoc = inviteRes.body.data;
    if (invitationDoc) createdInvitationIds.push(invitationDoc._id);

    const creatorNotifs1 = await makeRequest('GET', '/api/creator/notifications', null, { Authorization: `Bearer ${creatorToken}` });
    const inviteNotif = (creatorNotifs1.body.data || []).find((n) => n.type === 'collaboration_invitation');

    if (inviteNotif) {
      recordResult('EVENT 1: collaboration_invitation Notification', 'PASS', `Title: "${inviteNotif.title}"`);
    } else {
      recordResult('EVENT 1: collaboration_invitation Notification', 'FAIL', 'Notification not generated');
    }

    // ==================================================
    // EVENT 2 — INVITATION ACCEPTANCE NOTIFICATION
    // ==================================================
    console.log('\n[EVENT 2] Creator accepts invitation (invitation_accepted)...');
    const acceptRes = await makeRequest('PATCH', `/api/creator/requests/${invitationDoc._id}/respond`, {
      status: 'accepted'
    }, { Authorization: `Bearer ${creatorToken}` });

    const collabDoc = acceptRes.body.data.collaboration;
    if (collabDoc) createdCollaborationIds.push(collabDoc._id);

    const brandNotifs1 = await makeRequest('GET', '/api/brand/notifications', null, { Authorization: `Bearer ${brandToken}` });
    const acceptNotif = (brandNotifs1.body.data || []).find((n) => n.type === 'invitation_accepted');

    if (acceptNotif) {
      recordResult('EVENT 2: invitation_accepted Notification', 'PASS', `Title: "${acceptNotif.title}"`);
    } else {
      recordResult('EVENT 2: invitation_accepted Notification', 'FAIL', 'Notification not generated');
    }

    // ==================================================
    // EVENT 3 — CONTENT SUBMISSION NOTIFICATION
    // ==================================================
    console.log('\n[EVENT 3] Creator submits content deliverables (content_submitted)...');
    await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://youtube.com/watch?v=notification_test_v1',
      submissionNotes: 'Phase 4D first draft submission.'
    }, { Authorization: `Bearer ${creatorToken}` });

    const brandNotifs2 = await makeRequest('GET', '/api/brand/notifications', null, { Authorization: `Bearer ${brandToken}` });
    const submitNotif = (brandNotifs2.body.data || []).find((n) => n.type === 'content_submitted');

    if (submitNotif) {
      recordResult('EVENT 3: content_submitted Notification', 'PASS', `Title: "${submitNotif.title}"`);
    } else {
      recordResult('EVENT 3: content_submitted Notification', 'FAIL', 'Notification not generated');
    }

    // ==================================================
    // EVENT 4 — REVISION REQUEST NOTIFICATION
    // ==================================================
    console.log('\n[EVENT 4] Brand requests content revision (revision_requested)...');
    await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/revision`, {
      revisionNotes: 'Please enhance the color grading and include the brand hashtag.'
    }, { Authorization: `Bearer ${brandToken}` });

    const creatorNotifs2 = await makeRequest('GET', '/api/creator/notifications', null, { Authorization: `Bearer ${creatorToken}` });
    const revisionNotif = (creatorNotifs2.body.data || []).find((n) => n.type === 'revision_requested');

    if (revisionNotif) {
      recordResult('EVENT 4: revision_requested Notification', 'PASS', `Title: "${revisionNotif.title}"`);
    } else {
      recordResult('EVENT 4: revision_requested Notification', 'FAIL', 'Notification not generated');
    }

    // ==================================================
    // EVENT 5 — CONTENT RESUBMISSION NOTIFICATION
    // ==================================================
    console.log('\n[EVENT 5] Creator resubmits revised content (content_resubmitted)...');
    await makeRequest('PATCH', `/api/creator/collaborations/${collabDoc._id}/submit`, {
      submissionUrl: 'https://youtube.com/watch?v=notification_test_v2',
      submissionNotes: 'Phase 4D revised draft resubmission.'
    }, { Authorization: `Bearer ${creatorToken}` });

    const brandNotifs3 = await makeRequest('GET', '/api/brand/notifications', null, { Authorization: `Bearer ${brandToken}` });
    const resubmitNotif = (brandNotifs3.body.data || []).find((n) => n.type === 'content_resubmitted');

    if (resubmitNotif) {
      recordResult('EVENT 5: content_resubmitted Notification', 'PASS', `Title: "${resubmitNotif.title}"`);
    } else {
      recordResult('EVENT 5: content_resubmitted Notification', 'FAIL', 'Notification not generated');
    }

    // ==================================================
    // EVENT 6 — BRAND APPROVAL NOTIFICATION
    // ==================================================
    console.log('\n[EVENT 6] Brand approves deliverables (content_approved)...');
    await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/approve`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    const creatorNotifs3 = await makeRequest('GET', '/api/creator/notifications', null, { Authorization: `Bearer ${creatorToken}` });
    const approveNotif = (creatorNotifs3.body.data || []).find((n) => n.type === 'content_approved');

    if (approveNotif) {
      recordResult('EVENT 6: content_approved Notification', 'PASS', `Title: "${approveNotif.title}"`);
    } else {
      recordResult('EVENT 6: content_approved Notification', 'FAIL', 'Notification not generated');
    }

    // ==================================================
    // EVENT 7 — COLLABORATION COMPLETION NOTIFICATION
    // ==================================================
    console.log('\n[EVENT 7] Brand completes collaboration (collaboration_completed)...');
    await makeRequest('PATCH', `/api/brand/collaborations/${collabDoc._id}/complete`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    const creatorNotifs4 = await makeRequest('GET', '/api/creator/notifications', null, { Authorization: `Bearer ${creatorToken}` });
    const completeNotif = (creatorNotifs4.body.data || []).find((n) => n.type === 'collaboration_completed');

    if (completeNotif) {
      recordResult('EVENT 7: collaboration_completed Notification', 'PASS', `Title: "${completeNotif.title}"`);
    } else {
      recordResult('EVENT 7: collaboration_completed Notification', 'FAIL', 'Notification not generated');
    }

    // ==================================================
    // EVENT 8 — ESCROW PAYMENT INITIATION NOTIFICATION
    // ==================================================
    console.log('\n[EVENT 8] Brand deposits escrow payment (payment_escrowed)...');
    const escrowRes = await makeRequest('POST', '/api/brand/payments/escrow', {
      collaborationId: collabDoc._id,
      amount: 25000
    }, { Authorization: `Bearer ${brandToken}` });

    const paymentDoc = escrowRes.body.data;
    if (paymentDoc) createdPaymentIds.push(paymentDoc._id);

    const creatorNotifs5 = await makeRequest('GET', '/api/creator/notifications', null, { Authorization: `Bearer ${creatorToken}` });
    const escrowNotif = (creatorNotifs5.body.data || []).find((n) => n.type === 'payment_escrowed');

    if (escrowNotif) {
      recordResult('EVENT 8: payment_escrowed Notification', 'PASS', `Title: "${escrowNotif.title}"`);
    } else {
      recordResult('EVENT 8: payment_escrowed Notification', 'FAIL', 'Notification not generated');
    }

    // ==================================================
    // EVENT 9 — ESCROW PAYMENT RELEASE NOTIFICATION
    // ==================================================
    console.log('\n[EVENT 9] Brand releases escrow payment (payment_released)...');
    await makeRequest('PATCH', `/api/brand/payments/${paymentDoc._id}/release`, null, {
      Authorization: `Bearer ${brandToken}`
    });

    const creatorNotifs6 = await makeRequest('GET', '/api/creator/notifications', null, { Authorization: `Bearer ${creatorToken}` });
    const releaseNotif = (creatorNotifs6.body.data || []).find((n) => n.type === 'payment_released');

    if (releaseNotif) {
      recordResult('EVENT 9: payment_released Notification', 'PASS', `Title: "${releaseNotif.title}"`);
    } else {
      recordResult('EVENT 9: payment_released Notification', 'FAIL', 'Notification not generated');
    }

    // ==================================================
    // EVENT 10 — REVIEW RECEIVED NOTIFICATION
    // ==================================================
    console.log('\n[EVENT 10] Brand submits review for creator (review_received)...');
    const reviewRes = await makeRequest('POST', '/api/creator/reviews', {
      collaborationId: collabDoc._id,
      rating: 5,
      review: 'Top tier content creator, seamless collaboration!'
    }, { Authorization: `Bearer ${brandToken}` });

    if (reviewRes.body.data) createdReviewIds.push(reviewRes.body.data._id);

    const creatorNotifs7 = await makeRequest('GET', '/api/creator/notifications', null, { Authorization: `Bearer ${creatorToken}` });
    const reviewNotif = (creatorNotifs7.body.data || []).find((n) => n.type === 'review_received');

    if (reviewNotif) {
      recordResult('EVENT 10: review_received Notification', 'PASS', `Title: "${reviewNotif.title}"`);
    } else {
      recordResult('EVENT 10: review_received Notification', 'FAIL', 'Notification not generated');
    }

    // ==================================================
    // SECURITY & ISOLATION TESTS
    // ==================================================
    console.log('\n[SECURITY] Testing notification isolation and authorization...');

    // 1. Creator B querying notifications (must receive empty/isolated list)
    const creatorBNotifs = await makeRequest('GET', '/api/creator/notifications', null, { Authorization: `Bearer ${creatorBToken}` });
    if (creatorBNotifs.status === 200 && (creatorBNotifs.body.data || []).length === 0) {
      recordResult('Security 1: Cross-Creator Notification Isolation', 'PASS', 'Creator B cannot read Creator A notifications');
    } else {
      recordResult('Security 1: Cross-Creator Notification Isolation', 'FAIL', `Leaked ${creatorBNotifs.body.data?.length} items`);
    }

    // 2. Brand B querying notifications (must receive empty/isolated list)
    const brandBNotifs = await makeRequest('GET', '/api/brand/notifications', null, { Authorization: `Bearer ${brandBToken}` });
    if (brandBNotifs.status === 200 && (brandBNotifs.body.data || []).length === 0) {
      recordResult('Security 2: Cross-Brand Notification Isolation', 'PASS', 'Brand B cannot read Brand A notifications');
    } else {
      recordResult('Security 2: Cross-Brand Notification Isolation', 'FAIL', `Leaked ${brandBNotifs.body.data?.length} items`);
    }

    // 3. Unauthenticated request to notifications (HTTP 401)
    const unauthNotifRes = await makeRequest('GET', '/api/creator/notifications');
    if (unauthNotifRes.status === 401) {
      recordResult('Security 3: Unauthenticated Notification Access (HTTP 401)', 'PASS');
    } else {
      recordResult('Security 3: Unauthenticated Notification Access (HTTP 401)', 'FAIL', `HTTP ${unauthNotifRes.status}`);
    }

    // 4. Mark Notification as Read
    const targetNotifId = inviteNotif._id || inviteNotif.id;
    const markReadRes = await makeRequest('PATCH', `/api/creator/notifications/${targetNotifId}/read`, null, {
      Authorization: `Bearer ${creatorToken}`
    });

    if (markReadRes.status === 200 && (markReadRes.body.data.isRead === true || markReadRes.body.data.read === true)) {
      recordResult('FEATURE: Mark Notification as Read', 'PASS', `isRead: true`);
    } else {
      recordResult('FEATURE: Mark Notification as Read', 'FAIL', `HTTP ${markReadRes.status}`);
    }

    // ==================================================
    // CLEANUP & MONGODB INTEGRITY
    // ==================================================
    console.log('\n[CLEANUP] Cleaning up temporary test documents...');
    await models.Notification.deleteMany({ userId: { $in: createdUserIds } });
    await models.Review.deleteMany({ _id: { $in: createdReviewIds } });
    await models.Payment.deleteMany({ _id: { $in: createdPaymentIds } });
    await models.Collaboration.deleteMany({ _id: { $in: createdCollaborationIds } });
    await models.Invitation.deleteMany({ _id: { $in: createdInvitationIds } });
    await models.Campaign.deleteMany({ _id: { $in: createdCampaignIds } });
    await models.CreatorProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.BrandProfile.deleteMany({ userId: { $in: createdUserIds } });
    await models.User.deleteMany({ _id: { $in: createdUserIds } });

    const orphanNotifs = await models.Notification.countDocuments({ userId: { $in: createdUserIds } });
    if (orphanNotifs === 0) {
      recordResult('CLEANUP: MongoDB Notification Document Cleanup', 'PASS', '100% temporary Phase 4D test records removed cleanly');
    } else {
      recordResult('CLEANUP: MongoDB Notification Document Cleanup', 'FAIL', `Remaining orphan docs: ${orphanNotifs}`);
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
    recordResult('Phase 4D Verification Suite', 'FAIL', err.message);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    console.log('\n🔌 Server & Database connections closed cleanly.');
  }

  return testResults;
}

runPhase4DTests().then((results) => {
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n====================================================');
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} Phase 4D Assertions Passed`);
  console.log('====================================================');

  if (failed.length > 0) {
    console.error(`\n❌ PHASE 4D VERIFICATION FAILED (${failed.length} failed assertions)`);
    process.exit(1);
  } else {
    console.log('\n🎉 PHASE 4D NOTIFICATION SYSTEM PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
});
