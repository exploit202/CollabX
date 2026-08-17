import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CreatorProfile,
  BrandProfile,
  Campaign,
  Invitation,
  Negotiation,
  Collaboration,
  AppNotification,
  PlatformReport,
  OfferMessage,
  PortfolioItem,
  Review,
} from '../types';
import {
  mockCreators,
  mockBrands,
  mockCampaigns,
  mockInvitations,
  mockNegotiations,
  mockCollaborations,
  mockNotifications,
  mockReports,
} from '../data/mockData';
import brandService from '../services/brand.service';
import {
  normalizeCampaign,
  normalizeInvitation,
  normalizeNegotiation,
  normalizeCollaboration,
  normalizeNotification,
  normalizeCreator,
} from '../utils/normalize';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AppContextType {
  creators: CreatorProfile[];
  brands: BrandProfile[];
  campaigns: Campaign[];
  savedCreatorIds: string[];
  invitations: Invitation[];
  negotiations: Negotiation[];
  collaborations: Collaboration[];
  notifications: AppNotification[];
  reports: PlatformReport[];
  toasts: Toast[];

  // Actions
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string, actionLabel?: string, onAction?: () => void) => void;
  removeToast: (id: string) => void;

  toggleSaveCreator: (creatorId: string) => void;
  sendInvitation: (invitationData: Omit<Invitation, 'id' | 'sentDate' | 'status'>) => void;
  cancelInvitation: (invitationId: string) => void;
  respondToInvitation: (invitationId: string, status: 'accepted' | 'rejected' | 'negotiating') => void;

  addCounterOffer: (negotiationId: string, offer: Omit<OfferMessage, 'id' | 'timestamp'>) => void;
  finalizeAgreement: (negotiationId: string) => void;

  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'applicantsCount' | 'invitationsCount'>) => void;
  updateCampaignStatus: (campaignId: string, status: Campaign['status']) => void;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (campaignId: string) => void;

  submitContentDeliverable: (collaborationId: string, url: string, notes: string) => void;
  approveDeliverable: (collaborationId: string, feedback: string) => void;
  addCreatorReview: (creatorId: string, review: Omit<Review, 'id' | 'date'>) => void;

  addPortfolioItem: (creatorId: string, item: Omit<PortfolioItem, 'id' | 'date'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const formatDateToIndian = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day < 10 ? '0' + day : day} ${month} ${year}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creators, setCreators] = useState<CreatorProfile[]>(mockCreators);
  const [brands, setBrands] = useState<BrandProfile[]>(mockBrands);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [savedCreatorIds, setSavedCreatorIds] = useState<string[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [reports, setReports] = useState<PlatformReport[]>(mockReports);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast System
  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string, actionLabel?: string, onAction?: () => void) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message, actionLabel, onAction }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch real backend data
  const refreshData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Campaigns
      brandService.getCampaigns().then((res) => {
        const list = res.data?.campaigns || res.campaigns || res.data || [];
        if (Array.isArray(list)) {
          setCampaigns(list.map(normalizeCampaign));
        }
      }).catch(() => {});

      // Saved Creators
      brandService.getSavedCreators().then((res) => {
        const list = res.data || [];
        if (Array.isArray(list)) {
          setSavedCreatorIds(list.map((sc: any) => sc.creatorId?._id || sc.creatorId || sc.id));
        }
      }).catch(() => {});

      // Invitations
      brandService.getInvitations().then((res) => {
        const list = res.data?.invitations || res.invitations || res.data || [];
        if (Array.isArray(list)) {
          setInvitations(list.map(normalizeInvitation));
        }
      }).catch(() => {});

      // Negotiations
      brandService.getNegotiations().then((res) => {
        const list = res.data?.negotiations || res.negotiations || res.data || [];
        if (Array.isArray(list)) {
          setNegotiations(list.map(normalizeNegotiation));
        }
      }).catch(() => {});

      // Active Collaborations
      brandService.getActiveCollaborations().then((res) => {
        const list = res.data || [];
        if (Array.isArray(list)) {
          setCollaborations(list.map(normalizeCollaboration));
        }
      }).catch(() => {});

      // Notifications
      brandService.getNotifications().then((res) => {
        const list = res.data || [];
        if (Array.isArray(list)) {
          setNotifications(list.map(normalizeNotification));
        }
      }).catch(() => {});

      // Discover Creators
      brandService.getDiscoverCreators().then((res) => {
        const list = res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setCreators(list.map(normalizeCreator));
        }
      }).catch(() => {});
    } catch (err) {
      console.warn('API refreshData error:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Toggle Saved Creator
  const toggleSaveCreator = async (creatorId: string) => {
    const isSaved = savedCreatorIds.includes(creatorId);
    setSavedCreatorIds((prev) => (isSaved ? prev.filter((id) => id !== creatorId) : [...prev, creatorId]));

    try {
      if (isSaved) {
        await brandService.removeSavedCreator(creatorId);
      } else {
        await brandService.saveCreator(creatorId);
      }
    } catch (_) {}

    addToast(
      isSaved ? 'info' : 'success',
      isSaved ? 'Creator removed from saved list' : 'Creator saved to your list',
      undefined,
      'Undo',
      () => toggleSaveCreator(creatorId)
    );
  };

  // Send Invitation
  const sendInvitation = async (invitationData: Omit<Invitation, 'id' | 'sentDate' | 'status'>) => {
    try {
      const res = await brandService.createInvitation({
        campaignId: invitationData.campaignId,
        campaignTitle: invitationData.campaignTitle,
        creatorId: invitationData.creatorId,
        creatorName: invitationData.creatorName,
        creatorAvatar: invitationData.creatorAvatar,
        proposedPrice: invitationData.proposedPrice,
        deliverables: invitationData.deliverables,
        message: invitationData.message,
      });
      const created = res.data?.invitation || res.invitation;
      if (created) {
        const normalized = normalizeInvitation(created);
        setInvitations((prev) => [normalized, ...prev.filter((i) => i.id !== normalized.id)]);
        addToast('success', 'Collaboration Invitation Sent!', `Sent to ${invitationData.creatorName}`);
      }
    } catch (err: any) {
      addToast('error', 'Failed to Send Invitation', err.message || 'Error sending invitation');
    }
  };

  // Cancel Invitation
  const cancelInvitation = async (invitationId: string) => {
    try {
      await brandService.cancelInvitation(invitationId);
      setInvitations((prev) => prev.map((i) => (i.id === invitationId ? { ...i, status: 'cancelled' } : i)));
      addToast('info', 'Invitation cancelled');
    } catch (err: any) {
      addToast('error', 'Failed to Cancel Invitation', err.message);
    }
  };

  // Respond to Invitation / Create Negotiation
  const respondToInvitation = async (invitationId: string, status: 'accepted' | 'rejected' | 'negotiating') => {
    const targetInv = invitations.find((i) => i.id === invitationId);
    if (!targetInv) return;

    if (status === 'negotiating') {
      try {
        const res = await brandService.createNegotiation({
          invitationId: targetInv.id,
          message: targetInv.message,
          currentBudget: targetInv.proposedPrice,
        });
        const neg = res.data?.negotiation || res.negotiation;
        if (neg) {
          const normalizedNeg = normalizeNegotiation(neg);
          setNegotiations((prev) => [normalizedNeg, ...prev.filter((n) => n.id !== normalizedNeg.id)]);
          setInvitations((prev) => prev.map((i) => (i.id === invitationId ? { ...i, status: 'negotiating' } : i)));
          addToast('info', 'Negotiation Room Opened', 'You can now chat and send counter-offers.');
        }
      } catch (err: any) {
        addToast('error', 'Failed to Start Negotiation', err.message);
      }
    } else {
      setInvitations((prev) => prev.map((i) => (i.id === invitationId ? { ...i, status } : i)));
    }
  };

  // Add Counter Offer
  const addCounterOffer = async (negotiationId: string, offer: Omit<OfferMessage, 'id' | 'timestamp'>) => {
    try {
      const res = await brandService.addNegotiationOffer(negotiationId, {
        message: offer.notes,
        proposedBudget: offer.proposedPrice,
        senderName: offer.senderName,
        senderAvatar: offer.senderAvatar,
      });
      const neg = res.data?.negotiation || res.negotiation;
      if (neg) {
        const normalized = normalizeNegotiation(neg);
        setNegotiations((prev) => prev.map((n) => (n.id === negotiationId ? normalized : n)));
        addToast('success', 'Offer Sent!', `New proposal for ₹${offer.proposedPrice.toLocaleString('en-IN')}`);
      }
    } catch (err: any) {
      addToast('error', 'Failed to Send Offer', err.message || 'Error sending offer');
    }
  };

  // Finalize Agreement
  const finalizeAgreement = async (negotiationId: string) => {
    const neg = negotiations.find((n) => n.id === negotiationId);
    if (!neg) return;

    try {
      await brandService.updateNegotiationStatus(negotiationId, 'agreed');
      const collabRes = await brandService.createCollabFromNegotiation(negotiationId);
      const collab = collabRes.data?.collaboration || collabRes.data || collabRes.collaboration;
      if (collab) {
        const normalized = normalizeCollaboration(collab);
        setCollaborations((prev) => [normalized, ...prev.filter((c) => c.id !== normalized.id)]);
      }
      setNegotiations((prev) =>
        prev.map((n) => (n.id === negotiationId ? { ...n, status: 'agreed', agreedPrice: n.currentPrice } : n))
      );
      addToast('success', 'Agreement Confirmed!', `Collaboration created at ₹${neg.currentPrice.toLocaleString('en-IN')}`);
    } catch (err: any) {
      addToast('error', 'Failed to Finalize Agreement', err.message || 'Error finalizing agreement');
    }
  };

  // Create Campaign
  const createCampaign = async (
    campaignData: Omit<Campaign, 'id' | 'createdAt' | 'applicantsCount' | 'invitationsCount'>
  ) => {
    try {
      const res = await brandService.createCampaign({
        title: campaignData.title,
        description: campaignData.description,
        category: campaignData.category,
        budget: campaignData.budget,
        deliverables: campaignData.requirements?.map((r) => r.contentType) || [],
        requirements: campaignData.requirements?.map((r) => `${r.quantity}x ${r.contentType} on ${r.platform}`) || [],
        platforms: campaignData.targetPlatforms,
        deadline: campaignData.deadline,
        status: campaignData.status,
      });
      const created = res.data?.campaign || res.campaign;
      if (created) {
        const normalized = normalizeCampaign(created);
        setCampaigns((prev) => [normalized, ...prev.filter((c) => c.id !== normalized.id)]);
        addToast('success', 'Campaign Created & Published!', campaignData.title);
      }
    } catch (err: any) {
      addToast('error', 'Failed to Create Campaign', err.message || 'Error creating campaign');
    }
  };

  // Update Campaign Status
  const updateCampaignStatus = async (campaignId: string, status: Campaign['status']) => {
    setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, status } : c)));

    try {
      await brandService.updateCampaignStatus(campaignId, status);
    } catch (_) {}

    addToast('info', 'Campaign Status Updated', `Set to ${status}`);
  };

  const updateCampaign = async (campaignId: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, ...updates } : c)));

    try {
      await brandService.updateCampaign(campaignId, updates);
    } catch (_) {}

    addToast('success', 'Campaign updated');
  };

  const deleteCampaign = async (campaignId: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));

    try {
      await brandService.deleteCampaign(campaignId);
    } catch (_) {}

    addToast('info', 'Campaign deleted');
  };

  // Submit Content Deliverable
  const submitContentDeliverable = (collaborationId: string, url: string, notes: string) => {
    setCollaborations((prev) =>
      prev.map((c) => (c.id === collaborationId ? { ...c, stage: 'content_submitted', submissionUrl: url, submissionNotes: notes } : c))
    );
    brandService.updateCollabProgress(collaborationId, { status: 'submitted', notes }).catch(() => {});
    addToast('success', 'Deliverables Submitted!', 'Brand notified for review.');
  };

  // Approve Deliverable
  const approveDeliverable = (collaborationId: string, feedback: string) => {
    setCollaborations((prev) => prev.map((c) => (c.id === collaborationId ? { ...c, stage: 'completed', brandFeedback: feedback } : c)));
    brandService.completeCollab(collaborationId).catch(() => {});
    addToast('success', 'Deliverable Approved!', 'Collaboration successfully completed.');
  };

  // Add Creator Review
  const addCreatorReview = (creatorId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: formatDateToIndian(new Date().toISOString().split('T')[0]),
    };
    setCreators((prev) =>
      prev.map((c) => {
        if (c.id === creatorId) {
          const updatedReviews = [newRev, ...c.reviews];
          const newAvgRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
          return {
            ...c,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            rating: newAvgRating,
          };
        }
        return c;
      })
    );
    addToast('success', 'Review Published!', 'Thank you for rating this creator.');
  };

  // Add Portfolio Item
  const addPortfolioItem = (creatorId: string, itemData: Omit<PortfolioItem, 'id' | 'date'>) => {
    const newItem: PortfolioItem = {
      ...itemData,
      id: `port-${Date.now()}`,
      date: formatDateToIndian(new Date().toISOString().split('T')[0]),
    };
    setCreators((prev) =>
      prev.map((c) => (c.id === creatorId ? { ...c, portfolio: [newItem, ...c.portfolio] } : c))
    );
    addToast('success', 'Portfolio Item Added!', itemData.title);
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    try {
      await brandService.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err: any) {
      console.warn('Failed to mark notification read:', err?.message || err);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('info', 'All notifications marked as read');
  };

  return (
    <AppContext.Provider
      value={{
        creators,
        brands,
        campaigns,
        savedCreatorIds,
        invitations,
        negotiations,
        collaborations,
        notifications,
        reports,
        toasts,
        addToast,
        removeToast,
        toggleSaveCreator,
        sendInvitation,
        cancelInvitation,
        respondToInvitation,
        addCounterOffer,
        finalizeAgreement,
        createCampaign,
        updateCampaignStatus,
        updateCampaign,
        deleteCampaign,
        submitContentDeliverable,
        approveDeliverable,
        addCreatorReview,
        addPortfolioItem,
        markNotificationRead,
        markAllNotificationsRead,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
