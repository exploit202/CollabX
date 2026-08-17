import {
  Campaign,
  Invitation,
  Negotiation,
  Collaboration,
  AppNotification,
  CreatorProfile,
} from '../types';

export const normalizeId = (doc: any): string => {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  return doc._id?.toString() || doc.id?.toString() || '';
};

export const normalizeCampaign = (doc: any): Campaign => {
  return {
    id: normalizeId(doc),
    brandId: doc.brandId?._id || doc.brandId || '',
    brandName: doc.brandName || doc.brandId?.companyName || 'Brand',
    brandLogo: doc.brandLogo || doc.brandId?.companyLogo || doc.image || '',
    title: doc.title || '',
    description: doc.description || '',
    category: doc.category || 'General',
    budget: doc.budget || 0,
    minFollowers: doc.minFollowers || 0,
    targetPlatforms: doc.platforms || doc.targetPlatforms || ['instagram'],
    requirements: Array.isArray(doc.requirements)
      ? doc.requirements.map((r: any) =>
          typeof r === 'string'
            ? { platform: 'instagram', contentType: r, quantity: 1 }
            : r
        )
      : [],
    deadline: doc.deadline
      ? new Date(doc.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '30 Aug 2026',
    status: doc.status || 'active',
    applicantsCount: doc.applicantsCount || 0,
    invitationsCount: doc.invitationsCount || 0,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Recent',
  };
};

export const normalizeInvitation = (doc: any): Invitation => {
  return {
    id: normalizeId(doc),
    campaignId: doc.campaignId?._id || doc.campaignId || '',
    campaignTitle: doc.campaignTitle || doc.campaignId?.title || 'Campaign',
    brandId: doc.brandId?._id || doc.brandId || '',
    brandName: doc.brandName || doc.brandId?.companyName || 'Brand',
    brandLogo: doc.brandLogo || '',
    creatorId: doc.creatorId?._id || doc.creatorId || '',
    creatorName: doc.creatorName || 'Creator',
    creatorAvatar: doc.creatorAvatar || '',
    proposedPrice: doc.proposedPrice || 0,
    deliverables: Array.isArray(doc.deliverables) ? doc.deliverables : [],
    message: doc.message || '',
    status: doc.status || 'pending',
    sentDate: doc.sentDate
      ? new Date(doc.sentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Recent',
  };
};

export const normalizeNegotiation = (doc: any): Negotiation => {
  return {
    id: normalizeId(doc),
    invitationId: doc.invitationId?._id || doc.invitationId || '',
    campaignId: doc.campaignId?._id || doc.campaignId || '',
    campaignTitle: doc.campaignName || doc.campaignTitle || 'Campaign',
    brandId: doc.brandId?._id || doc.brandId || '',
    brandName: doc.brandName || 'Brand',
    brandLogo: doc.brandLogo || '',
    creatorId: doc.creatorId?._id || doc.creatorId || '',
    creatorName: doc.creatorName || 'Creator',
    creatorAvatar: doc.creatorAvatar || '',
    currentPrice: doc.currentBudget ?? doc.currentPrice ?? 0,
    agreedPrice: doc.agreedBudget ?? doc.agreedPrice,
    status: doc.status === 'open' ? 'active' : doc.status || 'active',
    offers: Array.isArray(doc.offers)
      ? doc.offers.map((o: any) => ({
          id: normalizeId(o),
          senderId: o.senderId?._id || o.senderId || '',
          senderRole: o.senderRole || 'brand',
          senderName: o.senderName || 'User',
          senderAvatar: o.senderAvatar || '',
          proposedPrice: o.proposedBudget ?? o.proposedPrice ?? 0,
          deliverablesSummary: o.deliverablesSummary || o.message || '',
          notes: o.message || '',
          timestamp: o.createdAt || o.timestamp || new Date().toISOString(),
          status: o.status || 'offered',
        }))
      : [],
    updatedAt: doc.lastActivity || doc.updatedAt || new Date().toISOString(),
  };
};

export const normalizeCollaboration = (doc: any): Collaboration => {
  const stageMap: Record<string, any> = {
    active: 'agreement_finalized',
    in_progress: 'content_in_progress',
    submitted: 'content_submitted',
    completed: 'completed',
    cancelled: 'completed',
  };

  return {
    id: normalizeId(doc),
    campaignId: doc.campaignId?._id || doc.campaignId || '',
    campaignTitle: doc.campaignTitle || 'Campaign',
    brandId: doc.brandId?._id || doc.brandId || '',
    brandName: doc.brandName || 'Brand',
    brandLogo: doc.brandLogo || '',
    creatorId: doc.creatorId?._id || doc.creatorId || '',
    creatorName: doc.creatorName || 'Creator',
    creatorAvatar: doc.creatorAvatar || '',
    deliverableType: Array.isArray(doc.deliverables) ? doc.deliverables.join(', ') : doc.deliverableType || 'Package',
    agreedPrice: doc.agreedBudget ?? doc.agreedPrice ?? 0,
    stage: stageMap[doc.status] || doc.stage || 'agreement_finalized',
    submissionUrl: doc.submissionUrl,
    submissionNotes: doc.notes || doc.submissionNotes,
    submissionDate: doc.updatedAt
      ? new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : undefined,
    brandFeedback: doc.brandFeedback,
    startDate: doc.startDate
      ? new Date(doc.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '01 Aug 2026',
    deadline: doc.deadline
      ? new Date(doc.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '30 Aug 2026',
  };
};

export const normalizeNotification = (doc: any): AppNotification => {
  return {
    id: normalizeId(doc),
    userId: doc.recipientId || doc.userId || '',
    title: doc.title || 'Notification',
    message: doc.message || '',
    type: doc.type || 'system',
    read: doc.isRead ?? doc.read ?? false,
    timestamp: doc.createdAt
      ? new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Just now',
    link: doc.link,
  };
};

export const normalizeCreator = (doc: any): CreatorProfile => {
  const userId = doc.userId || {};
  return {
    id: normalizeId(doc),
    name: userId.fullName || doc.name || 'Creator',
    email: userId.email || doc.email || '',
    role: 'creator',
    avatar: userId.profileImage || doc.avatar || doc.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    bio: doc.bio || 'Digital content creator & influencer.',
    category: Array.isArray(doc.niche) ? doc.niche[0] || 'General' : doc.category || 'Tech & Gadgets',
    country: doc.location?.country || doc.country || 'India',
    language: doc.language || ['English', 'Hindi'],
    rating: doc.rating || 4.8,
    reviewCount: doc.reviewCount || 12,
    totalCollaborations: doc.totalCollaborations || 18,
    socials: doc.socials || [
      {
        platform: 'instagram',
        handle: '@creator',
        followers: doc.followers || 150000,
        engagementRate: doc.engagementRate || 4.5,
        url: 'https://instagram.com',
      },
    ],
    pricing: doc.pricing || [
      { id: 'p1', type: 'Instagram Reel (30-60s)', platform: 'instagram', price: 45000, deliveryDays: 4, description: 'High quality reel' },
    ],
    portfolio: doc.portfolio || [],
    reviews: doc.reviews || [],
    createdAt: doc.createdAt || new Date().toISOString(),
  };
};
