const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Gets authentication headers including JWT Bearer token and testing headers
 */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  if (userId) headers['x-user-id'] = userId;
  if (userRole) headers['x-user-role'] = userRole;

  return headers;
};

/**
 * Generic API request handler with error logging and status checking
 */
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `HTTP error ${res.status}`);
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// ----------------------------------------------------
// 1. AUTH API ENDPOINTS
// ----------------------------------------------------

export const authApi = {
  login: async (credentials: any) => apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: async (userData: any) => apiRequest<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: async () => apiRequest<any>('/auth/me'),
};

// ----------------------------------------------------
// 2. INVITATIONS / REQUESTS API ENDPOINTS
// ----------------------------------------------------

export const invitationsApi = {
  getCreatorRequests: async () => apiRequest<any>('/creator/requests'),
  respondToRequest: async (invitationId: string, status: 'accepted' | 'rejected' | 'negotiating') =>
    apiRequest<any>(`/creator/requests/${invitationId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  createBrandInvitation: async (invitationData: any) =>
    apiRequest<any>('/brand/invitations', {
      method: 'POST',
      body: JSON.stringify(invitationData),
    }),
  getBrandInvitations: async () => apiRequest<any>('/brand/invitations'),
};

// ----------------------------------------------------
// 3. NEGOTIATION DEAL ROOM API ENDPOINTS
// ----------------------------------------------------

export const negotiationsApi = {
  getCreatorNegotiations: async (view = 'all') => apiRequest<any>(`/creator/negotiations?view=${view}`),
  getBrandNegotiations: async (view = 'all') => apiRequest<any>(`/brand/negotiations?view=${view}`),
  getNegotiationById: async (negotiationId: string) => apiRequest<any>(`/creator/negotiations/${negotiationId}`),
  sendCounterOffer: async (negotiationId: string, payload: any) =>
    apiRequest<any>(`/creator/negotiations/${negotiationId}/counter`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  finalizeAgreement: async (negotiationId: string) =>
    apiRequest<any>(`/creator/negotiations/${negotiationId}/finalize`, {
      method: 'POST',
    }),
  rejectNegotiation: async (negotiationId: string, reason?: string) =>
    apiRequest<any>(`/creator/negotiations/${negotiationId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// ----------------------------------------------------
// 4. ACTIVE COLLABORATIONS API ENDPOINTS
// ----------------------------------------------------

export const collaborationsApi = {
  getCreatorCollaborations: async () => apiRequest<any>('/creator/collaborations'),
  getBrandCollaborations: async () => apiRequest<any>('/brand/collaborations'),
  getCollaborationById: async (id: string) => apiRequest<any>(`/creator/collaborations/${id}`),
  submitDeliverable: async (id: string, submissionUrl: string, submissionNotes?: string) =>
    apiRequest<any>(`/creator/collaborations/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ submissionUrl, submissionNotes }),
    }),
  approveDeliverable: async (id: string, brandFeedback: string, ratingGiven: number, reviewGiven?: string) =>
    apiRequest<any>(`/brand/collaborations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ brandFeedback, ratingGiven, reviewGiven }),
    }),
};

// ----------------------------------------------------
// 5. PAYMENTS & ESCROW ENGINE API ENDPOINTS
// ----------------------------------------------------

export const paymentsApi = {
  createOrder: async (negotiationId: string, totalAmount: number) =>
    apiRequest<any>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ negotiationId, totalAmount }),
    }),
  verifyPayment: async (paymentId: string, gatewayPaymentId: string, gatewaySignature: string) =>
    apiRequest<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ paymentId, gatewayPaymentId, gatewaySignature }),
    }),
  savePayoutAccount: async (payoutData: any) =>
    apiRequest<any>('/payments/payout-account', {
      method: 'POST',
      body: JSON.stringify(payoutData),
    }),
  releasePayout: async (paymentId: string) =>
    apiRequest<any>('/payments/release-payout', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    }),
  getHistory: async () => apiRequest<any>('/payments/history'),
};
