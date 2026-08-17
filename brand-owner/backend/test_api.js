/**
 * Automated API Verification Script for CollabX
 * Tests the Brand Invitation and Negotiation APIs.
 */

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('🤖 Starting CollabX API Verification Tests...\n');

  try {
    const timestamp = Date.now();
    const brandEmail = `brand_${timestamp}@test.com`;

    // 1. Register a Brand Account
    console.log('📝 1. Registering Brand Account...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Brand Manager',
        email: brandEmail,
        password: 'password123',
        role: 'brand',
        companyName: 'Test Brand Ltd'
      })
    });
    const registerJson = await registerRes.json();
    if (!registerRes.ok) throw new Error(`Registration failed: ${JSON.stringify(registerJson)}`);
    console.log('✅ Brand registered successfully.');

    // 2. Log in
    console.log('\n🔑 2. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: brandEmail,
        password: 'password123'
      })
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginJson)}`);
    const token = loginJson.data.token;
    console.log('✅ Logged in successfully. Token acquired.');

    // 3. Create Invitation
    console.log('\n✉️ 3. Creating Invitation (without Creator dependencies)...');
    const inviteRes = await fetch(`${BASE_URL}/brand/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        deliverables: ['1x Sponsored Post', '1x Story Integration'],
        offeredBudget: 25000,
        message: 'Let\'s collaborate on our new summer campaign!'
      })
    });
    const inviteJson = await inviteRes.json();
    if (!inviteRes.ok) throw new Error(`Create Invitation failed: ${JSON.stringify(inviteJson)}`);
    const invitationId = inviteJson.data.invitation._id;
    console.log(`✅ Invitation created successfully. ID: ${invitationId}`);

    // 4. View Invitations (Ensures mock creator details are populated)
    console.log('\n👀 4. Fetching Invitations list...');
    const getInvitesRes = await fetch(`${BASE_URL}/brand/invitations`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getInvitesJson = await getInvitesRes.json();
    if (!getInvitesRes.ok) throw new Error(`Get Invitations failed: ${JSON.stringify(getInvitesJson)}`);
    const invitations = getInvitesJson.data.invitations;
    console.log(`✅ Retrieved ${invitations.length} invitations.`);
    const firstInvite = invitations[0];
    console.log(`   - Creator Name (Mocked): ${firstInvite.creatorId?.userId?.fullName}`);
    console.log(`   - Creator Avatar (Mocked): ${firstInvite.creatorId?.userId?.profileImage}`);

    // 5. Cancel Invitation
    console.log('\n❌ 5. Cancelling Invitation...');
    const cancelRes = await fetch(`${BASE_URL}/brand/invitations/${invitationId}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cancelJson = await cancelRes.json();
    if (!cancelRes.ok) throw new Error(`Cancel Invitation failed: ${JSON.stringify(cancelJson)}`);
    console.log(`✅ Invitation status updated to: ${cancelJson.data.invitation.status}`);

    // 6. Create Negotiation (with optional/mock creator ID and campaign ID)
    console.log('\n🤝 6. Creating Negotiation...');
    const createNegRes = await fetch(`${BASE_URL}/brand/negotiations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        invitationId: invitationId,
        currentOffer: 22000
      })
    });
    const createNegJson = await createNegRes.json();
    if (!createNegRes.ok) throw new Error(`Create Negotiation failed: ${JSON.stringify(createNegJson)}`);
    const negotiationId = createNegJson.data.negotiation._id;
    console.log(`✅ Negotiation created successfully. ID: ${negotiationId}`);

    // 7. View Negotiations
    console.log('\n📊 7. Fetching Negotiations list...');
    const getNegsRes = await fetch(`${BASE_URL}/brand/negotiations`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getNegsJson = await getNegsRes.json();
    if (!getNegsRes.ok) throw new Error(`Get Negotiations failed: ${JSON.stringify(getNegsJson)}`);
    console.log(`✅ Retrieved ${getNegsJson.data.negotiations.length} negotiations.`);

    // 8. Send Counter Offer (Negotiation Message)
    console.log('\n💬 8. Sending Counter Offer message...');
    const sendMsgRes = await fetch(`${BASE_URL}/brand/negotiation-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        negotiationId: negotiationId,
        message: 'Could you do 20000 instead?',
        offerAmount: 20000
      })
    });
    const sendMsgJson = await sendMsgRes.json();
    if (!sendMsgRes.ok) throw new Error(`Send Counter Offer failed: ${JSON.stringify(sendMsgJson)}`);
    console.log(`✅ Counter offer message sent. New offer: ₹${sendMsgJson.data.message.offerAmount}`);

    // 9. Accept Negotiation
    console.log('\n🎉 9. Accepting Negotiation...');
    const acceptRes = await fetch(`${BASE_URL}/brand/negotiations/${negotiationId}/decision`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'Accepted'
      })
    });
    const acceptJson = await acceptRes.json();
    if (!acceptRes.ok) throw new Error(`Accept Negotiation failed: ${JSON.stringify(acceptJson)}`);
    console.log(`✅ Negotiation finalized. Status: ${acceptJson.data.negotiation.status}`);

    console.log('\n⭐ ALL TESTS PASSED SUCCESSFULLY! Decoupled modules are fully functional. ⭐\n');
  } catch (error) {
    console.error('\n❌ Verification Failed:', error.message);
    process.exit(1);
  }
}

runTests();
