import React, { createContext, useContext, useState } from 'react';
import { User, UserRole, BrandProfile, CreatorProfile } from '../types';
import { mockBrands, mockCreators } from '../data/mockData';

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

// Details collected on the login/signup forms. Nothing here is required -
// whatever the person actually typed is what ends up on their profile.
export interface AuthDetails {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  category?: string;
}

interface AuthContextType {
  user: User | BrandProfile | CreatorProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (role: UserRole, details?: AuthDetails) => void;
  enterGuestMode: () => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updatedFields: Partial<User | BrandProfile | CreatorProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('brand');
  const [user, setUser] = useState<User | BrandProfile | CreatorProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const isGuest = role === 'guest';

  const enterGuestMode = () => {
    setIsAuthenticated(true);
    setRole('guest');
    setUser(GUEST_USER);
  };

  // Builds the signed-in profile from what was actually entered on the
  // login/signup form. There's no real backend or photo upload yet, so we
  // borrow a mock account's structural data (pricing, portfolio, etc. for
  // creators; industry defaults for brands) but the identity fields - name,
  // email, phone, bio/category, avatar - always come from what the person
  // typed, never a hardcoded demo persona. No avatar means the UI shows
  // initials instead of a stranger's stock photo.
  const login = (selectedRole: UserRole, details: AuthDetails = {}) => {
    if (selectedRole === 'guest') return;
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
    } else if (selectedRole === 'creator') {
      const base = mockCreators[0];
      const creator: CreatorProfile = {
        ...base,
        name: name || base.name,
        email: email || base.email,
        phone: phone || base.phone,
        bio: bio || base.bio,
        category: category || base.category,
        avatar: '',
        verified: false,
      };
      setUser(creator);
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
    login(newRole);
  };

  const updateUserProfile = (updatedFields: Partial<User | BrandProfile | CreatorProfile>) => {
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
