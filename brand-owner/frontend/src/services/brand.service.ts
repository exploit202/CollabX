import api from './api';

export const brandService = {
  // Dashboard
  async getDashboardData() {
    const res = await api.get('/brand/dashboard');
    return res.data;
  },

  // Campaigns
  async getCampaigns() {
    const res = await api.get('/brand/campaigns');
    return res.data;
  },

  async getCampaignById(id: string) {
    const res = await api.get(`/brand/campaigns/${id}`);
    return res.data;
  },

  async createCampaign(campaignData: any) {
    const res = await api.post('/brand/campaigns', campaignData);
    return res.data;
  },

  async updateCampaign(id: string, updates: any) {
    const res = await api.patch(`/brand/campaigns/${id}`, updates);
    return res.data;
  },

  async updateCampaignStatus(id: string, status: string) {
    const res = await api.patch(`/brand/campaigns/${id}/status`, { status });
    return res.data;
  },

  async deleteCampaign(id: string) {
    const res = await api.delete(`/brand/campaigns/${id}`);
    return res.data;
  },

  // Discover & Saved Creators
  async getDiscoverCreators(params?: any) {
    const res = await api.get('/brand/creators', { params });
    return res.data;
  },

  async getCreatorProfile(id: string) {
    const res = await api.get(`/brand/creators/${id}`);
    return res.data;
  },

  async getSavedCreators() {
    const res = await api.get('/brand/saved-creators');
    return res.data;
  },

  async saveCreator(creatorId: string) {
    const res = await api.post('/brand/saved-creators', { creatorId });
    return res.data;
  },

  async removeSavedCreator(creatorId: string) {
    const res = await api.delete(`/brand/saved-creators/${creatorId}`);
    return res.data;
  },

  // Invitations
  async getInvitations() {
    const res = await api.get('/brand/invitations');
    return res.data;
  },

  async createInvitation(invitationData: any) {
    const res = await api.post('/brand/invitations', invitationData);
    return res.data;
  },

  async cancelInvitation(id: string) {
    const res = await api.patch(`/brand/invitations/${id}/cancel`);
    return res.data;
  },

  // Negotiations
  async getNegotiations() {
    const res = await api.get('/brand/negotiations');
    return res.data;
  },

  async getNegotiationById(id: string) {
    const res = await api.get(`/brand/negotiations/${id}`);
    return res.data;
  },

  async createNegotiation(data: { invitationId: string; message?: string; currentBudget?: number }) {
    const res = await api.post('/brand/negotiations', data);
    return res.data;
  },

  async addNegotiationOffer(id: string, offerData: { message?: string; proposedBudget?: number; senderName?: string; senderAvatar?: string }) {
    const res = await api.post(`/brand/negotiations/${id}/offers`, offerData);
    return res.data;
  },

  async updateNegotiationStatus(id: string, status: 'agreed' | 'rejected') {
    const res = await api.patch(`/brand/negotiations/${id}/status`, { status });
    return res.data;
  },

  // Active Collaborations
  async getActiveCollaborations() {
    const res = await api.get('/brand/activecollaborations/brand');
    return res.data;
  },

  async createCollabFromNegotiation(negotiationId: string) {
    const res = await api.post(`/brand/activecollaborations/negotiation/${negotiationId}`);
    return res.data;
  },

  async updateCollabProgress(id: string, data: { progress?: number; status?: string; notes?: string }) {
    const res = await api.patch(`/brand/activecollaborations/${id}/progress`, data);
    return res.data;
  },

  async completeCollab(id: string) {
    const res = await api.patch(`/brand/activecollaborations/${id}/complete`);
    return res.data;
  },

  async cancelCollab(id: string, notes?: string) {
    const res = await api.patch(`/brand/activecollaborations/${id}/cancel`, { notes });
    return res.data;
  },

  // Notifications
  async getNotifications() {
    const res = await api.get('/brand/notifications');
    return res.data;
  },

  async markNotificationRead(id: string) {
    const res = await api.patch(`/brand/notifications/${id}/read`);
    return res.data;
  },

  async deleteNotification(id: string) {
    const res = await api.delete(`/brand/notifications/${id}`);
    return res.data;
  },

  // Settings
  async getNotificationSettings() {
    const res = await api.get('/brand/settings/notifications');
    return res.data;
  },

  async updateNotificationSettings(settings: any) {
    const res = await api.patch('/brand/settings/notifications', settings);
    return res.data;
  },

  async updatePassword(passwordData: { newPassword: string; confirmPassword: string }) {
    const res = await api.patch('/brand/settings/password', passwordData);
    return res.data;
  },
};

export default brandService;
