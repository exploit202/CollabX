import React, { createContext, useContext, useState } from 'react';
import { User, UserRole, BrandProfile, CreatorProfile } from '../types';
import { mockBrands, mockCreators } from '../data/mockData';
import { loginRequest } from '../lib/api';

const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest',
  email: 'guest@creatormatch.com',
  role: 'guest',
  avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=200',
  createdAt: new Date().toISOString(),
};

export const isGuestAllowedPath = (pathname: string) =>
  pathname === '/brand/discover' || pathname.startsWith('/brand/creator/');

export interface AuthDetails {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  category?: string;
  password?: string;
}

interface AuthContextType {
  user: User | BrandProfile | CreatorProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (role: UserRole, details?: AuthDetails) => Promise<void>;
  enterGuestMode: () => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updatedFields: Partial<User | BrandProfile | CreatorProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('brand');
  const [user, setUser] = useState<User | BrandProfile | CreatorProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isGuest = role === 'guest';

  const enterGuestMode = () => {
    setIsAuthenticated(true);
    setRole('guest');
    setUser(GUEST_USER);
  };

  const login = async (selectedRole: UserRole, details: AuthDetails = {}) => {
    if (selectedRole === 'guest') return;

    if (selectedRole === 'creator') {
      if (!details.email || !details.password) {
        throw new Error('Email and password are required.');
      }

      const response = await loginRequest(details.email, details.password);
      const backendUser = response.data.user;

      if (backendUser.role !== 'creator') {
        throw new Error('This account is not a Creator account.');
      }

      const creator: CreatorProfile = {
        id: backendUser._id,
        name: backendUser.fullName,
        email: backendUser.email,
        role: 'creator',
        avatar: backendUser.profileImage || '',
        verified: backendUser.isVerified,
        createdAt: new Date().toISOString(),
        bio: '',
        category: '',
        country: '',
        language: [],
        rating: 0,
        reviewCount: 0,
        totalCollaborations: 0,
        socials: [],
        pricing: [],
        portfolio: [],
        reviews: [],
      };

      setIsAuthenticated(true);
      setRole('creator');
      setUser(creator);
      return;
    }

    // Keep Brand/Admin on the existing mock flow until their backend modules
    // are integrated by their respective teams.
    setIsAuthenticated(true);
    setRole(selectedRole);

    const { name, email, phone, bio, category } = details;

    if (selectedRole === 'brand') {
      const base = mockBrands[0];
      const brand: BrandProfile = {
        ...base,
        name: name || base.name,
        companyName: name || base.companyName,
        email: email || base.email,
        phone: phone || base.phone,
        description: bio || base.description,
        industry: category || base.industry,
        avatar: '',
        logo: '',
        verified: false,
      };
      setUser(brand);
    } else {
      const admin: User = {
        id: 'admin-1',
        name: name || 'Admin User',
        email: email || 'admin@creatormatch.com',
        phone,
        role: 'admin',
        avatar: '',
        verified: true,
        createdAt: new Date().toISOString(),
      };
      setUser(admin);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setRole('brand');
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'guest') {
      enterGuestMode();
      return;
    }
    void login(newRole);
  };

  const updateUserProfile = (
    updatedFields: Partial<User | BrandProfile | CreatorProfile>
  ) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } as any : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isGuest,
        login,
        enterGuestMode,
        logout,
        switchRole,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
