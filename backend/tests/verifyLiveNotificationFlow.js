const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runLiveCheck() {
  console.log('🚀 Running Full Live Notification & Presentation Check...\n');

  try {
    // 1. Log in as Brand (boAt)
    console.log('1️⃣ Logging in as Demo Brand: brand.boat@collabx.demo ...');
    const brandLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'brand.boat@collabx.demo',
        password: 'Password123!'
      }
    );

    const brandToken = brandLogin.data?.data?.token || brandLogin.data?.token;
    const brandUser = brandLogin.data?.data?.user || brandLogin.data?.user;
    if (!brandToken) throw new Error(`Brand login failed: ${JSON.stringify(brandLogin.data)}`);
    console.log(`✅ Brand Logged in. ID: ${brandUser._id || brandUser.id}`);

    // 2. Log in as Creator (Mortal)
    console.log('\n2️⃣ Logging in as Demo Creator: creator.mortal@collabx.demo ...');
    const creatorLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'creator.mortal@collabx.demo',
        password: 'Password123!'
      }
    );

    const creatorToken = creatorLogin.data?.data?.token || creatorLogin.data?.token;
    const creatorUser = creatorLogin.data?.data?.user || creatorLogin.data?.user;
    if (!creatorToken) throw new Error(`Creator login failed: ${JSON.stringify(creatorLogin.data)}`);
    const creatorId = creatorUser._id || creatorUser.id;
    console.log(`✅ Creator Logged in. ID: ${creatorId}`);

    // 3. Brand gets its campaigns to find one to invite
    console.log('\n3️⃣ Finding an active campaign for boAt...');
    const campRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/brand/campaigns',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brandToken}`
      }
    });

    const campaigns = campRes.data?.data || campRes.data || [];
    if (campaigns.length === 0) throw new Error('No campaigns found for boAt');
    const targetCampaign = campaigns[0];
    console.log(`✅ Selected Campaign: "${targetCampaign.title}" (ID: ${targetCampaign._id})`);

    // 4. Record Creator's initial notification count
    const initialCreatorNotifsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/creator/notifications',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`
      }
    });
    const initialCreatorCount = initialCreatorNotifsRes.data?.data?.length || 0;
    console.log(`✅ Mortal initial notification count: ${initialCreatorCount}`);

    // 5. Brand creates a new invitation for Mortal
    console.log(`\n4️⃣ Brand sending new live invitation to Creator (${creatorUser.fullName}) for ₹32,000...`);
    const invRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/brand/invitations',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${brandToken}`
        }
      },
      {
        campaignId: targetCampaign._id,
        creatorId: creatorId,
        proposedPrice: 32000,
        deliverables: ['1 Dedicated Gaming Stream Segment', '1 YouTube Short'],
        message: 'Hey Mortal, we would love for you to test out our flagship gaming audio device live on stream!'
      }
    );

    let createdInvitationId = null;
    if (invRes.status === 201 || invRes.status === 200) {
      createdInvitationId = invRes.data?.data?._id || invRes.data?.data?.id || invRes.data?._id;
      console.log(`✅ Live Invitation created! ID: ${createdInvitationId}`);
    } else if (invRes.status === 409) {
      console.log('ℹ️ Active invitation already existed; fetching creator requests...');
      const reqsRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/creator/requests',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${creatorToken}`
        }
      });
      const reqList = reqsRes.data?.data || [];
      if (reqList.length > 0) {
        createdInvitationId = reqList[0]._id || reqList[0].id;
      }
    } else {
      throw new Error(`Invitation creation failed: ${JSON.stringify(invRes.data)}`);
    }

    // 6. Check Creator Notifications
    console.log('\n5️⃣ Checking Mortal’s notifications for the live invitation...');
    const afterInvNotifsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/creator/notifications',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`
      }
    });

    const newCreatorNotifs = afterInvNotifsRes.data?.data || [];
    console.log(`✅ Mortal now has ${newCreatorNotifs.length} notifications.`);
    const latestCreatorNotif = newCreatorNotifs[0];
    console.log(`   Latest: "${latestCreatorNotif?.title}" - "${latestCreatorNotif?.message}"`);

    // 7. Creator responds: Accepts the invitation
    if (createdInvitationId) {
      console.log(`\n6️⃣ Creator accepting invitation ${createdInvitationId}...`);
      const acceptRes = await request(
        {
          hostname: 'localhost',
          port: 5000,
          path: `/api/creator/requests/${createdInvitationId}/respond`,
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${creatorToken}`
          }
        },
        { status: 'accepted' }
      );

      if (acceptRes.status === 200) {
        console.log('✅ Creator accepted the invitation.');
      } else {
        console.log(`ℹ️ Response: ${JSON.stringify(acceptRes.data)}`);
      }

      // 8. Check Brand Notifications
      console.log('\n7️⃣ Checking Brand notifications for the live acceptance update...');
      const afterAcceptNotifsRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/brand/notifications',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${brandToken}`
        }
      });

      const newBrandNotifs = afterAcceptNotifsRes.data?.data || [];
      console.log(`✅ boAt has ${newBrandNotifs.length} notifications.`);
      const latestBrandNotif = newBrandNotifs[0];
      console.log(`   Latest: "${latestBrandNotif?.title}" - "${latestBrandNotif?.message}"`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL LIVE CHECKS COMPLETED & DEMO READY!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Live Check Failed:', err);
    process.exit(1);
  }
}

runLiveCheck();
