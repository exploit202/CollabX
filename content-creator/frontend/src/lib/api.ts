const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:5000';

export type ApiError = Error & { status?: number };

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  let payload: any = null;
  try { payload = await response.json(); } catch { /* non-JSON */ }

  if (!response.ok || payload?.success === false) {
    const error = new Error(
      payload?.message || `Request failed with status ${response.status}`
    ) as ApiError;
    error.status = response.status;
    throw error;
  }
  return payload as T;
};

export interface LoginResponse {
  success: boolean;
  data: { user: {
    _id: string;
    fullName: string;
    email: string;
    role: 'creator' | 'brand' | 'admin';
    profileImage: string | null;
    isVerified: boolean;
    isActive: boolean;
  }};
}

export interface DashboardResponse {
  success: boolean;
  data: {
    stats: {
      totalEarnings: number;
      brandInvitations: number;
      activeCampaigns: number;
      openNegotiations: number;
      profileViews: number;
    };
    profile: any | null;
    recentRequests: any[];
    recentNegotiations: any[];
    activeCollaborations: any[];
  };
}

export interface ProfileResponse { success: boolean; data: { user: any; profile: any | null } }

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'invitation' | 'negotiation' | 'collaboration' | 'campaign' | 'system';
  read: boolean;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const loginRequest = (email: string, password: string) =>
  request<LoginResponse>('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  });

export const getDashboard = () => request<DashboardResponse>('/api/creator/dashboard');
export const getProfile = () => request<ProfileResponse>('/api/creator/profile');
export const updateProfile = (body: Record<string, unknown>) =>
  request<ProfileResponse>('/api/creator/profile', { method: 'PATCH', body: JSON.stringify(body) });
export const getNotifications = () => request<NotificationsResponse>('/api/creator/notifications');
export const getUnreadNotificationCount = () =>
  request<{ success: boolean; count: number }>('/api/creator/notifications/unread-count');
export const markNotificationAsRead = (id: string) =>
  request<{ success: boolean; data: NotificationItem }>(`/api/creator/notifications/${id}/read`, { method: 'PATCH' });
export const markAllNotificationsAsRead = () =>
  request<{ success: boolean; data: { modifiedCount: number } }>('/api/creator/notifications/read-all', { method: 'PATCH' });
export const respondToCreatorRequest = (id: string, status: 'accepted' | 'rejected' | 'negotiating') =>
  request<{ success: boolean; data: any }>(`/api/creator/requests/${id}/respond`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  });
