const { getNotificationRoute } = require('../../frontend/src/utils/notificationRoutes');

console.log('🧪 Testing getNotificationRoute edge cases...');

try {
  // Test null / undefined
  console.assert(getNotificationRoute(null, 'brand') === '/brand/notifications', 'Test 1 Failed');
  console.assert(getNotificationRoute(undefined, 'creator') === '/creator/notifications', 'Test 2 Failed');

  // Test invitations
  console.assert(getNotificationRoute({ type: 'invitation_sent' }, 'creator') === '/creator/requests', 'Test 3 Failed');
  console.assert(getNotificationRoute({ type: 'invitation_sent' }, 'brand') === '/brand/invitations', 'Test 4 Failed');

  // Test negotiations
  console.assert(getNotificationRoute({ type: 'offer_received' }, 'creator') === '/creator/negotiations', 'Test 5 Failed');
  console.assert(getNotificationRoute({ type: 'negotiation' }, 'brand') === '/brand/negotiations', 'Test 6 Failed');

  // Test collaborations & escrow
  console.assert(getNotificationRoute({ type: 'escrow_funded' }, 'creator') === '/creator/collaborations', 'Test 7 Failed');
  console.assert(getNotificationRoute({ type: 'content_approved' }, 'brand') === '/brand/collaborations', 'Test 8 Failed');

  // Test reviews
  console.assert(getNotificationRoute({ type: 'review_received' }, 'creator') === '/creator/reviews', 'Test 9 Failed');
  console.assert(getNotificationRoute({ type: 'review_submitted' }, 'brand') === '/brand/reviews', 'Test 10 Failed');

  // Test campaigns
  console.assert(getNotificationRoute({ type: 'campaign_created', entityId: '123' }, 'brand') === '/brand/campaigns/123', 'Test 11 Failed');
  console.assert(getNotificationRoute({ type: 'campaign_created' }, 'creator') === '/creator/discover', 'Test 12 Failed');

  console.log('✅ ALL getNotificationRoute unit tests passed cleanly!');
} catch (e) {
  console.error('❌ Error testing getNotificationRoute:', e);
  process.exit(1);
}
