/**
 * Notification Deep-Linking Router Utility
 * Maps a notification item to its corresponding destination page in CollabX.
 */
export const getNotificationRoute = (notification: any, role: string): string => {
  if (!notification) return `/${role || 'brand'}/notifications`;

  const t = (notification.type || '').toLowerCase();
  const entityId = notification.entityId || notification.relatedId;

  // 1. Invitations & Direct Briefs
  if (t.includes('invitation') || t.includes('request')) {
    return role === 'creator' ? '/creator/requests' : '/brand/invitations';
  }

  // 2. Negotiations & Counter-offers
  if (t.includes('negotiation') || t.includes('offer')) {
    return role === 'creator' ? '/creator/negotiations' : '/brand/negotiations';
  }

  // 3. Collaborations, Deliverables, Revisions, Approvals & Escrow
  if (
    t.includes('collab') ||
    t.includes('deliverable') ||
    t.includes('content') ||
    t.includes('revision') ||
    t.includes('approved') ||
    t.includes('completed') ||
    t.includes('escrow') ||
    t.includes('payment')
  ) {
    return role === 'creator' ? '/creator/collaborations' : '/brand/collaborations';
  }

  // 4. Reviews & Ratings
  if (t.includes('review') || t.includes('rating')) {
    return role === 'creator' ? '/creator/reviews' : '/brand/reviews';
  }

  // 5. Reports, Disputes & Moderation
  if (t.includes('report') || t.includes('dispute')) {
    if (role === 'admin') return '/admin/reports';
    return `/${role}/profile`;
  }

  // 6. Campaign Briefs
  if (t.includes('campaign')) {
    if (role === 'creator') return '/creator/discover';
    return entityId ? `/brand/campaigns/${entityId}` : '/brand/campaigns';
  }

  // Default fallback
  return `/${role}/notifications`;
};
