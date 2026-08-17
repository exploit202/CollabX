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
import { formatCurrency as utilsFormatCurrency, convertCurrency as utilsConvertCurrency } from '../utils/currency';
import { formatDate as utilsFormatDate, formatDateTime as utilsFormatDateTime } from '../utils/dateTime';
import { getBrandSettings } from '../lib/api';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface UserPreferences {
  timezone: string;
  currency: string;
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

  userPreferences: UserPreferences;
  setUserPreferences: (prefs: UserPreferences) => void;
  formatCurrency: (amount: number | string, fromCurrency?: string) => string;
  convertCurrency: (amount: number | string, fromCurrency?: string, toCurrency?: string) => number;
  formatDate: (date: string | Date | number | null) => string;
  formatDateTime: (date: string | Date | number | null) => string;

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creators, setCreators] = useState<CreatorProfile[]>(mockCreators);
  const [brands, setBrands] = useState<BrandProfile[]>(mockBrands);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [savedCreatorIds, setSavedCreatorIds] = useState<string[]>(['creator-1', 'creator-3']);
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations);
  const [negotiations, setNegotiations] = useState<Negotiation[]>(mockNegotiations);
  const [collaborations, setCollaborations] = useState<Collaboration[]>(mockCollaborations);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [reports, setReports] = useState<PlatformReport[]>(mockReports);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    timezone: 'Asia/Kolkata',
    currency: 'INR'
  });

  // Attempt to restore user preferences from backend on initial mount
  useEffect(() => {
    getBrandSettings()
      .then((res) => {
        if (res?.success && res.data?.preferences) {
          const { timezone, currency } = res.data.preferences;
          if (timezone || currency) {
            setUserPreferences({
              timezone: timezone || 'Asia/Kolkata',
              currency: currency || 'INR'
            });
          }
        }
      })
      .catch((_) => {
        // Unauthenticated or default fallback
      });
  }, []);

  const formatCurrency = (amount: number | string, fromCurrency = 'INR') => {
    return utilsFormatCurrency(amount, userPreferences.currency || 'INR', fromCurrency);
  };

  const convertCurrency = (amount: number | string, fromCurrency = 'INR', toCurrency = userPreferences.currency || 'INR') => {
    return utilsConvertCurrency(amount, fromCurrency, toCurrency);
  };

  const formatDate = (dateInput: string | Date | number | null) => {
    return utilsFormatDate(dateInput, userPreferences.timezone || 'Asia/Kolkata');
  };

  const formatDateTime = (dateInput: string | Date | number | null) => {
    return utilsFormatDateTime(dateInput, userPreferences.timezone || 'Asia/Kolkata');
  };

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

  // Toggle Saved Creator
  const toggleSaveCreator = (creatorId: string) => {
    const isSaved = savedCreatorIds.includes(creatorId);
    setSavedCreatorIds((prev) => isSaved ? prev.filter((id) => id !== creatorId) : [...prev, creatorId]);
    addToast(
      isSaved ? 'info' : 'success',
      isSaved ? 'Creator removed from saved list' : 'Creator saved to your list',
      undefined,
      'Undo',
      () => setSavedCreatorIds((prev) => isSaved ? [...prev, creatorId] : prev.filter((id) => id !== creatorId))
    );
  };

  // Send Invitation
  const sendInvitation = (invitationData: Omit<Invitation, 'id' | 'sentDate' | 'status'>) => {
    const newInv: Invitation = {
      ...invitationData,
      id: `inv-${Date.now()}`,
      sentDate: formatDate(new Date().toISOString()),
      status: 'pending',
    };
    setInvitations((prev) => [newInv, ...prev]);

    // Add Notification for creator
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: invitationData.creatorId,
      title: 'New Collaboration Invitation!',
      message: `${invitationData.brandName} invited you to collaborate on ${invitationData.campaignTitle}. Proposed: ${formatCurrency(invitationData.proposedPrice)}`,
      type: 'invitation',
      read: false,
      timestamp: 'Just now',
      link: '/creator/requests',
    };
    setNotifications((prev) => [notif, ...prev]);

    addToast('success', 'Collaboration Invitation Sent!', `Sent to ${invitationData.creatorName}`);
  };

  // Cancel Invitation
  const cancelInvitation = (invitationId: string) => {
    setInvitations((prev) => prev.map((i) => (i.id === invitationId ? { ...i, status: 'cancelled' } : i)));
    addToast('info', 'Invitation cancelled');
  };

  // Respond to Invitation
  const respondToInvitation = (invitationId: string, status: 'accepted' | 'rejected' | 'negotiating') => {
    setInvitations((prev) =>
      prev.map((i) => (i.id === invitationId ? { ...i, status } : i))
    );
    const targetInv = invitations.find((i) => i.id === invitationId);
    if (!targetInv) return;

    if (status === 'accepted') {
      const newCollab: Collaboration = {
        id: `collab-${Date.now()}`,
        campaignId: targetInv.campaignId,
        campaignTitle: targetInv.campaignTitle,
        brandId: targetInv.brandId,
        brandName: targetInv.brandName,
        brandLogo: targetInv.brandLogo,
        creatorId: targetInv.creatorId,
        creatorName: targetInv.creatorName,
        creatorAvatar: targetInv.creatorAvatar,
        deliverableType: targetInv.deliverables.join(', '),
        agreedPrice: targetInv.proposedPrice,
        stage: 'agreement_finalized',
        startDate: formatDate(new Date().toISOString()),
        deadline: '28 Aug 2026',
      };
      setCollaborations((prev) => [newCollab, ...prev]);
      addToast('success', 'Invitation Accepted!', 'Collaboration has been created.');
    } else if (status === 'rejected') {
      addToast('info', 'Invitation declined');
    } else if (status === 'negotiating') {
      const existingNeg = negotiations.find((n) => n.invitationId === invitationId);
      if (!existingNeg) {
        const newNeg: Negotiation = {
          id: `neg-${Date.now()}`,
          invitationId,
          campaignId: targetInv.campaignId,
          campaignTitle: targetInv.campaignTitle,
          brandId: targetInv.brandId,
          brandName: targetInv.brandName,
          brandLogo: targetInv.brandLogo,
          creatorId: targetInv.creatorId,
          creatorName: targetInv.creatorName,
          creatorAvatar: targetInv.creatorAvatar,
          currentPrice: targetInv.proposedPrice,
          status: 'active',
          updatedAt: new Date().toISOString(),
          offers: [
            {
              id: `msg-${Date.now()}`,
              senderId: targetInv.brandId,
              senderRole: 'brand',
              senderName: targetInv.brandName,
              senderAvatar: targetInv.brandLogo,
              proposedPrice: targetInv.proposedPrice,
              deliverablesSummary: targetInv.deliverables.join(', '),
              notes: targetInv.message,
              timestamp: new Date().toISOString(),
              status: 'offered',
            },
          ],
        };
        setNegotiations((prev) => [newNeg, ...prev]);
      }
      addToast('info', 'Negotiation Room Opened', 'You can now chat and send counter-offers.');
    }
  };

  // Add Counter Offer
  const addCounterOffer = (negotiationId: string, offer: Omit<OfferMessage, 'id' | 'timestamp'>) => {
    const newOfferMessage: OfferMessage = {
      ...offer,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setNegotiations((prev) =>
      prev.map((neg) => {
        if (neg.id === negotiationId) {
          return {
            ...neg,
            currentPrice: offer.proposedPrice,
            updatedAt: new Date().toISOString(),
            offers: [...neg.offers, newOfferMessage],
          };
        }
        return neg;
      })
    );
    addToast('success', 'Offer Sent!', `New proposal for ${formatCurrency(offer.proposedPrice)}`);
  };

  // Finalize Agreement
  const finalizeAgreement = (negotiationId: string) => {
    const neg = negotiations.find((n) => n.id === negotiationId);
    if (!neg) return;

    setNegotiations((prev) =>
      prev.map((n) => (n.id === negotiationId ? { ...n, status: 'agreed', agreedPrice: n.currentPrice } : n))
    );

    const newCollab: Collaboration = {
      id: `collab-${Date.now()}`,
      campaignId: neg.campaignId,
      campaignTitle: neg.campaignTitle,
      brandId: neg.brandId,
      brandName: neg.brandName,
      brandLogo: neg.brandLogo,
      creatorId: neg.creatorId,
      creatorName: neg.creatorName,
      creatorAvatar: neg.creatorAvatar,
      deliverableType: 'Agreed Negotiated Package',
      agreedPrice: neg.currentPrice,
      stage: 'agreement_finalized',
      startDate: formatDate(new Date().toISOString()),
      deadline: '30 Aug 2026',
    };
    setCollaborations((prev) => [newCollab, ...prev]);
    addToast('success', 'Agreement Confirmed!', `Collaboration created at ${formatCurrency(neg.currentPrice)}`);
  };

  // Create Campaign
  const createCampaign = (
    campaignData: Omit<Campaign, 'id' | 'createdAt' | 'applicantsCount' | 'invitationsCount'>
  ) => {
    const newCamp: Campaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      createdAt: formatDate(new Date().toISOString()),
      applicantsCount: 0,
      invitationsCount: 0,
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    addToast('success', 'Campaign Created & Published!', campaignData.title);
  };

  // Update Campaign Status
  const updateCampaignStatus = (campaignId: string, status: Campaign['status']) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status } : c))
    );
    addToast('info', 'Campaign Status Updated', `Set to ${status}`);
  };

  const updateCampaign = (campaignId: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, ...updates } : c)));
    addToast('success', 'Campaign updated');
  };

  const deleteCampaign = (campaignId: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    addToast('info', 'Campaign deleted');
  };

  // Submit Content Deliverable
  const submitContentDeliverable = (collaborationId: string, url: string, notes: string) => {
    setCollaborations((prev) =>
      prev.map((c) => {
        if (c.id === collaborationId) {
          return {
            ...c,
            stage: 'content_submitted',
            submissionUrl: url,
            submissionNotes: notes,
            submissionDate: formatDate(new Date().toISOString()),
          };
        }
        return c;
      })
    );
    addToast('success', 'Deliverables Submitted!', 'Brand notified for review.');
  };

  // Approve Deliverable
  const approveDeliverable = (collaborationId: string, feedback: string) => {
    setCollaborations((prev) =>
      prev.map((c) => {
        if (c.id === collaborationId) {
          return {
            ...c,
            stage: 'completed',
            brandFeedback: feedback,
          };
        }
        return c;
      })
    );
    addToast('success', 'Deliverable Approved!', 'Collaboration successfully completed.');
  };

  // Add Creator Review
  const addCreatorReview = (creatorId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: formatDate(new Date().toISOString()),
    };
    setCreators((prev) =>
      prev.map((c) => {
        if (c.id === creatorId) {
          const updatedReviews = [newRev, ...c.reviews];
          const newAvgRating = Number(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
          );
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
      date: formatDate(new Date().toISOString()),
    };
    setCreators((prev) =>
      prev.map((c) => {
        if (c.id === creatorId) {
          return {
            ...c,
            portfolio: [newItem, ...c.portfolio],
          };
        }
        return c;
      })
    );
    addToast('success', 'Portfolio Item Added!', itemData.title);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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
        userPreferences,
        setUserPreferences,
        formatCurrency,
        convertCurrency,
        formatDate,
        formatDateTime,
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
