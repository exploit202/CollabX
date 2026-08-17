import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: 'brand' | 'creator' | 'admin';
  companyName?: string;
  industry?: string;
  aboutBrand?: string;
  bio?: string;
  niche?: string[];
}

export const authService = {
  async login(payload: LoginPayload) {
    const res = await api.post('/auth/login', payload);
    return res.data;
  },

  async register(payload: RegisterPayload) {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  async getBrandProfile() {
    const res = await api.get('/brand/profile');
    return res.data;
  },

  async updateBrandProfile(data: any) {
    const res = await api.patch('/brand/profile', data);
    return res.data;
  },
};

export default authService;
