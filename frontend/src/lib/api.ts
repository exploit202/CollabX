const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:5000';

export interface ApiError extends Error {
  status?: number;
  data?: any;
}

export const getToken = (): string | null => {
  return localStorage.getItem('collabx_token');
};

export const setToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('collabx_token', token);
  } else {
    localStorage.removeItem('collabx_token');
  }
};

export const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> || {})
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    /* non-JSON response */
  }

  if (response.status === 401) {
    setToken(null);
    localStorage.removeItem('collabx_role');
    localStorage.removeItem('collabx_user');
  }

  if (!response.ok || payload?.success === false) {
    const error = new Error(
      payload?.message || payload?.error || `Request failed with status ${response.status}`
    ) as ApiError;
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload as T;
};

// ==========================================
// AUTHENTICATION APIS
// ==========================================
export const registerBrand = (data: any) =>
  request<{ success: boolean; data: { token: string; user: any; profile: any } }>(
    '/api/brand/auth/register',
    { method: 'POST', body: JSON.stringify(data) }
  );

export const loginBrand = (data: any) =>
  request<{ success: boolean; data: { token: string; user: any; profile: any } }>(
    '/api/brand/auth/login',
    { method: 'POST', body: JSON.stringify(data) }
  );

export const registerCreator = (data: any) =>
  request<{ success: boolean; data: { token: string; user: any; profile: any } }>(
    '/api/creator/auth/register',
    { method: 'POST', body: JSON.stringify(data) }
  );

export const loginCreator = (data: any) =>
  request<{ success: boolean; data: { token: string; user: any; profile: any } }>(
    '/api/creator/auth/login',
    { method: 'POST', body: JSON.stringify(data) }
  );

export const updateCreatorPlatforms = (platforms: (string | { platform: string; link?: string })[]) =>
  request<{ success: boolean; data: { profile: any } }>('/api/creator/auth/platforms', {
    method: 'PATCH',
    body: JSON.stringify({ platforms })
  });

export const verifyCreatorPlatformUrl = (platform: string, url: string) =>
  request<{ success: boolean; data: { verified: boolean; url?: string } }>('/api/creator/auth/platform/verify', {
    method: 'POST',
    body: JSON.stringify({ platform, url })
  });

export const requestCreatorOtp = () =>
  request<{ success: boolean; message: string; data?: { emailSent: boolean; recipientEmail: string } }>(
    '/api/creator/auth/otp/send',
    { method: 'POST' }
  );

export const verifyCreatorOtp = (otp: string) =>
  request<{ success: boolean; message: string; data: { user: any; token: string } }>(
    '/api/creator/auth/otp/verify',
    { method: 'POST', body: JSON.stringify({ otp }) }
  );

// ==========================================
// BRAND OWNER APIS
// ==========================================
export const getBrandProfile = () =>
  request<{ success: boolean; data: { profile: any } }>('/api/brand/profile');

export const updateBrandProfile = (data: any) =>
  request<{ success: boolean; data: { profile: any } }>('/api/brand/profile', {
    method: 'PATCH',
    body: JSON.stringify(data)
  });

export const getBrandDashboard = () =>
  request<{ success: boolean; data: any }>('/api/brand/dashboard');

export const getBrandCampaigns = () =>
  request<{ success: boolean; data: any[] }>('/api/brand/campaigns');

export const createCampaign = (data: any) =>
  request<{ success: boolean; data: any }>('/api/brand/campaigns', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const getCampaignById = (id: string) =>
  request<{ success: boolean; data: any }>(`/api/brand/campaigns/${id}`);

export const updateCampaignStatusApi = (id: string, status: string) =>
  request<{ success: boolean; data: any }>(`/api/brand/campaigns/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

export const getSavedCreators = () =>
  request<{ success: boolean; data: any[] }>('/api/brand/saved-creators');

export const saveCreator = (id: string) =>
  request<{ success: boolean; data: any }>(`/api/brand/saved-creators/${id}`, {
    method: 'POST'
  });

export const removeSavedCreator = (id: string) =>
  request<{ success: boolean; data: any }>(`/api/brand/saved-creators/${id}`, {
    method: 'DELETE'
  });

export const getDiscoverCreators = (filters: Record<string, any> = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && val !== 'All') {
      query.append(key, String(val));
    }
  });
  const queryString = query.toString();
  return request<{ success: boolean; data: any[] }>(`/api/brand/creators${queryString ? `?${queryString}` : ''}`);
};

export const getCreatorById = (id: string) =>
  request<{ success: boolean; data: any }>(`/api/brand/creators/${id}`);

export const getBrandInvitations = () =>
  request<{ success: boolean; data: any[] }>('/api/brand/invitations');

export const createInvitation = (data: any) =>
  request<{ success: boolean; data: any }>('/api/brand/invitations', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const createNegotiation = (data: { invitationId: string }) =>
  request<{ success: boolean; data: any }>('/api/brand/negotiations', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const getBrandNegotiations = () =>
  request<{ success: boolean; data: any[] }>('/api/brand/negotiations');

export const getBrandNegotiationById = (id: string) =>
  request<{ success: boolean; data: any }>(`/api/brand/negotiations/${id}`);

export const sendBrandOffer = (id: string, data: any) =>
  request<{ success: boolean; data: any }>(`/api/brand/negotiations/${id}/offers`, {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const acceptBrandOffer = (id: string, offerId?: string) =>
  request<{ success: boolean; data: any }>(`/api/brand/negotiations/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ offerId })
  });

export const getBrandCollaborations = () =>
  request<{ success: boolean; data: any[] }>('/api/brand/collaborations');

export const requestRevision = (id: string, data: { revisionNotes?: string; brandFeedback?: string }) =>
  request<{ success: boolean; data: any }>(`/api/brand/collaborations/${id}/revision`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });

export const approveCollaboration = (id: string, data?: { feedback?: string }) =>
  request<{ success: boolean; data: any }>(`/api/brand/collaborations/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(data || {})
  });

export const completeCollaboration = (id: string) =>
  request<{ success: boolean; data: any }>(`/api/brand/collaborations/${id}/complete`, {
    method: 'PATCH'
  });

export const getBrandNotifications = () =>
  request<{ success: boolean; data: any[] }>('/api/brand/notifications');

export const markBrandNotificationRead = (id: string) =>
  request<{ success: boolean; data: any }>(`/api/brand/notifications/${id}/read`, {
    method: 'PATCH'
  });

export const markAllBrandNotificationsRead = () =>
  request<{ success: boolean }>('/api/brand/notifications/read-all', {
    method: 'PATCH'
  });

export const getBrandSettings = () =>
  request<{
    success: boolean;
    data: {
      notificationPreferences: {
        newInvitationResponses: boolean;
        counterOffers: boolean;
        negotiationMessages: boolean;
        collaborationUpdates: boolean;
        contentSubmissions: boolean;
        escrowUpdates: boolean;
        dailyCampaignDigest: boolean;
      };
      preferences: {
        timezone: string;
        currency: string;
      };
    };
  }>('/api/brand/settings');

export const updateBrandSettings = (data: {
  notificationPreferences?: Partial<{
    newInvitationResponses: boolean;
    counterOffers: boolean;
    negotiationMessages: boolean;
    collaborationUpdates: boolean;
    contentSubmissions: boolean;
    escrowUpdates: boolean;
    dailyCampaignDigest: boolean;
  }>;
  preferences?: Partial<{
    timezone: string;
    currency: string;
  }>;
}) =>
  request<{ success: boolean; data: any }>('/api/brand/settings', {
    method: 'PATCH',
    body: JSON.stringify(data)
  });

export const changeBrandPassword = (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}) =>
  request<{ success: boolean; message: string }>('/api/brand/settings/password', {
    method: 'PATCH',
    body: JSON.stringify(data)
  });

// ==========================================
// CONTENT CREATOR APIS
// ==========================================
export const getCreatorProfile = () =>
  request<{ success: boolean; data: { profile: any } }>('/api/creator/profile');

export const updateCreatorProfile = (data: any) =>
  request<{ success: boolean; data: { profile: any } }>('/api/creator/profile', {
    method: 'PATCH',
    body: JSON.stringify(data)
  });

export const getCreatorDashboard = () =>
  request<{ success: boolean; data: any }>('/api/creator/dashboard');

export const discoverCampaigns = () =>
  request<{ success: boolean; data: any[] }>('/api/creator/campaigns/discover');

export const expressCampaignInterest = (campaignId: string) =>
  request<{ success: boolean; data: any }>(`/api/creator/campaigns/${campaignId}/express-interest`, {
    method: 'POST'
  });

export const getCreatorRequests = () =>
  request<{ success: boolean; data: any[] }>('/api/creator/requests');

export const respondToInvitation = (id: string, status: 'accepted' | 'rejected' | 'negotiating') =>
  request<{ success: boolean; data: any }>(`/api/creator/requests/${id}/respond`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

export const getCreatorNegotiations = () =>
  request<{ success: boolean; data: any[] }>('/api/creator/negotiations');

export const sendCreatorCounterOffer = (id: string, data: any) =>
  request<{ success: boolean; data: any }>(`/api/creator/negotiations/${id}/offers`, {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const acceptCreatorOffer = (id: string, offerId?: string) =>
  request<{ success: boolean; data: any }>(`/api/creator/negotiations/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ offerId })
  });

export const getCreatorCollaborations = () =>
  request<{ success: boolean; data: any[] }>('/api/creator/collaborations');

export const submitDeliverables = (id: string, data: any) =>
  request<{ success: boolean; data: any }>(`/api/creator/collaborations/${id}/submit`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });

export const getCreatorNotifications = () =>
  request<{ success: boolean; data: any[] }>('/api/creator/notifications');

export const markCreatorNotificationRead = (id: string) =>
  request<{ success: boolean; data: any }>(`/api/creator/notifications/${id}/read`, {
    method: 'PATCH'
  });

export const markAllCreatorNotificationsRead = () =>
  request<{ success: boolean }>('/api/creator/notifications/read-all', {
    method: 'PATCH'
  });

export const getPortfolio = () =>
  request<{ success: boolean; data: any[] }>('/api/creator/portfolio');

export const addPortfolioItem = (data: any) =>
  request<{ success: boolean; data: any }>('/api/creator/portfolio', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const deletePortfolioItem = (id: string) =>
  request<{ success: boolean; data: any }>(`/api/creator/portfolio/${id}`, {
    method: 'DELETE'
  });

export const getPricing = (creatorId?: string) =>
  request<{ success: boolean; data: any[] }>(`/api/creator/pricing${creatorId ? `?creatorId=${creatorId}` : ''}`);

export const createPricing = (data: any) =>
  request<{ success: boolean; data: any }>('/api/creator/pricing', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const deletePricing = (id: string) =>
  request<{ success: boolean; data: any }>(`/api/creator/pricing/${id}`, {
    method: 'DELETE'
  });

export const getReviews = (creatorId?: string) =>
  request<{ success: boolean; data: any[] }>(`/api/creator/reviews${creatorId ? `?creatorId=${creatorId}` : ''}`);

export const createReview = (data: { collaborationId: string; rating: number; review: string }) =>
  request<{ success: boolean; data: any }>('/api/creator/reviews', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const getPayoutAccount = () =>
  request<{ success: boolean; data: any }>('/api/creator/payout-account');

export const updatePayoutAccount = (data: any) =>
  request<{ success: boolean; data: any }>('/api/creator/payout-account', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const fundEscrow = (data: { collaborationId: string; amount?: number; currency?: string }) =>
  request<{ success: boolean; message: string; data: any }>('/api/payments/fund', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const releaseEscrow = (data: { collaborationId?: string; paymentId?: string; escrowId?: string }) =>
  request<{ success: boolean; message: string; data: any }>('/api/payments/release', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const getPayments = (params?: { collaborationId?: string; status?: string }) => {
  const query = new URLSearchParams();
  if (params?.collaborationId) query.set('collaborationId', params.collaborationId);
  if (params?.status) query.set('status', params.status);
  const qStr = query.toString();
  return request<{ success: boolean; data: any[] }>(`/api/payments${qStr ? `?${qStr}` : ''}`);
};

export const initiateEscrowPayment = (data: { collaborationId: string; amount?: number; currency?: string }) =>
  fundEscrow(data);

export const releaseEscrowPayment = (paymentId: string, collaborationId?: string) =>
  releaseEscrow({ paymentId, collaborationId });

export const getBrandPayments = () =>
  getPayments();

export const getCreatorPayments = () =>
  getPayments();

export const getBrandAnalytics = () =>
  request<{ success: boolean; data: any }>('/api/brand/analytics');

export const getCreatorAnalytics = () =>
  request<{ success: boolean; data: any }>('/api/creator/analytics');

export const getBrandCollaborationActivity = (id: string) =>
  request<{ success: boolean; collaborationId: string; activities: any[] }>(`/api/brand/collaborations/${id}/activity`);

export const getCreatorCollaborationActivity = (id: string) =>
  request<{ success: boolean; collaborationId: string; activities: any[] }>(`/api/creator/collaborations/${id}/activity`);

export const loginAdmin = (data:any) => request<any>('/api/auth/login',{method:'POST',body:JSON.stringify({...data,role:'admin'})});
export const getCurrentUser = () => request<any>('/api/auth/me');
export const reportBrand = (data: { reportedAgainst: string; reason: string; description?: string }) =>
  request<any>('/api/creator/reports', { method: 'POST', body: JSON.stringify(data) });

export const reportCreator = (data: { reportedAgainst: string; reason: string; description?: string }) =>
  request<any>('/api/brand/reports', { method: 'POST', body: JSON.stringify(data) });

export const getAdminDashboard = () => request<any>('/api/admin/dashboard');
export const getAdminUsers = (p?:any) => {const q=new URLSearchParams();if(p?.role)q.set('role',p.role);if(p?.search)q.set('search',p.search);return request<any>(`/api/admin/users${q.toString()?`?${q}`:''}`)};
export const updateAdminUserStatus=(id:string,isActive:boolean)=>request<any>(`/api/admin/users/${id}/status`,{method:'PATCH',body:JSON.stringify({isActive})});
export const updateAdminUserVerification=(id:string,isVerified:boolean)=>request<any>(`/api/admin/users/${id}/verification`,{method:'PATCH',body:JSON.stringify({isVerified})});
export const getAdminCampaigns=()=>request<any>('/api/admin/campaigns');export const moderateAdminCampaign=(id:string,action:string,note='')=>request<any>(`/api/admin/campaigns/${id}/moderation`,{method:'PATCH',body:JSON.stringify({action,note})});
export const getAdminCollaborations=()=>request<any>('/api/admin/collaborations');export const getAdminReports=()=>request<any>('/api/admin/reports');export const updateAdminReportStatus=(id:string,status:string)=>request<any>(`/api/admin/reports/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});export const getAdminSettings=()=>request<any>('/api/admin/settings');export const updateAdminSettings=(data:any)=>request<any>('/api/admin/settings',{method:'PATCH',body:JSON.stringify(data)});
export const getAdminNotifications = () => request<{ success: boolean; data: any[] }>('/api/admin/notifications');
export const markAdminNotificationRead = (id: string) => request<{ success: boolean; data: any }>(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
export const markAllAdminNotificationsRead = () => request<{ success: boolean }>('/api/admin/notifications/read-all', { method: 'PATCH' });

export const uploadCreatorProfileImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return request<any>('/api/creator/profile/avatar', {
    method: 'POST',
    body: formData
  });
};

export const uploadBrandProfileImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return request<any>('/api/brand/profile/avatar', {
    method: 'POST',
    body: formData
  });
};
