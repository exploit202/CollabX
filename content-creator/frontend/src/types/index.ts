export type UserRole = 'brand' | 'creator' | 'admin' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar: string;
  verified?: boolean;
  createdAt: string;
}

export interface SocialStats {
  platform: 'instagram' | 'youtube' | 'twitter';
  handle: string;
  followers: number; // e.g. 150000
  engagementRate: number; // e.g. 4.2 (%)
  url: string;
}

export interface DeliverablePricing {
  id: string;
  type: string; // e.g., "Instagram Reel (30-60s)", "YouTube Dedicated Video", "X Post"
  platform: 'instagram' | 'youtube' | 'twitter';
  price: number; // e.g. 450
  deliveryDays: number;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  brandName?: string;
  brandLogo?: string;
  category: string;
  mediaType: 'image' | 'video';
  thumbnail: string;
  mediaUrl?: string;
  views?: string;
  likes?: string;
  comments?: string;
  description: string;
  date: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: 'brand' | 'creator';
  rating: number; // 1 to 5
  comment: string;
  date: string;
  campaignTitle?: string;
}

export interface CreatorProfile extends User {
  role: 'creator';
  bio: string;
  category: string; // e.g. "Tech & Gadgets", "Fashion & Lifestyle", "Fitness & Wellness", "Travel", "Gaming"
  country: string;
  language: string[];
  rating: number;
  reviewCount: number;
  totalCollaborations: number;
  socials: SocialStats[];
  pricing: DeliverablePricing[];
  portfolio: PortfolioItem[];
  reviews: Review[];
  featured?: boolean;
  matchScore?: number;
  matchReasons?: string[];
}

export interface BrandProfile extends User {
  role: 'brand';
  companyName: string;
  industry: string;
  website: string;
  logo: string;
  description: string;
  country: string;
  activeCampaignsCount: number;
  totalSpent: number;
  contactName?: string;
  contactRole?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  targetAudience?: string;
  preferredCreatorCategories?: string[];
  preferredPlatforms?: string[];
}

export interface CampaignRequirement {
  platform: 'instagram' | 'youtube' | 'twitter';
  contentType: string;
  quantity: number;
}

export interface Campaign {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  minFollowers: number;
  targetPlatforms: ('instagram' | 'youtube' | 'twitter')[];
  requirements: CampaignRequirement[];
  deadline: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  applicantsCount: number;
  invitationsCount: number;
  createdAt: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'negotiating' | 'cancelled';

export interface Invitation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  proposedPrice: number;
  deliverables: string[];
  message: string;
  status: InvitationStatus;
  sentDate: string;
}

export interface OfferMessage {
  id: string;
  senderId: string;
  senderRole: 'brand' | 'creator';
  senderName: string;
  senderAvatar: string;
  proposedPrice: number;
  deliverablesSummary: string;
  notes: string;
  timestamp: string;
  status: 'offered' | 'accepted' | 'declined' | 'countered';
}

export interface Negotiation {
  id: string;
  invitationId: string;
  campaignId: string;
  campaignTitle: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  currentPrice: number;
  agreedPrice?: number;
  status: 'active' | 'agreed' | 'cancelled';
  offers: OfferMessage[];
  updatedAt: string;
}

export type CollabStage =
  | 'invitation_sent'
  | 'invitation_accepted'
  | 'negotiation_started'
  | 'agreement_finalized'
  | 'content_in_progress'
  | 'content_submitted'
  | 'brand_approved'
  | 'completed';

export interface Collaboration {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  deliverableType: string;
  agreedPrice: number;
  stage: CollabStage;
  submissionUrl?: string;
  submissionNotes?: string;
  submissionDate?: string;
  brandFeedback?: string;
  ratingGiven?: number;
  reviewGiven?: string;
  startDate: string;
  deadline: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'invitation' | 'negotiation' | 'collaboration' | 'campaign' | 'system';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface PlatformReport {
  id: string;
  reporterName: string;
  reporterRole: 'brand' | 'creator';
  targetType: 'brand' | 'creator' | 'campaign';
  targetName: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}
