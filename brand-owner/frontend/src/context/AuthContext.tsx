import React, { createContext, useContext, useState } from 'react';
import { User, UserRole, BrandProfile, CreatorProfile } from '../types';
import { mockBrands, mockCreators } from '../data/mockData';
import authService from '../services/auth.service';

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
  loginApi: (credentials: { email: string; password: string; role?: UserRole }) => Promise<any>;
  registerApi: (payload: any) => Promise<any>;
  enterGuestMode: () => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updatedFields: Partial<User | BrandProfile | CreatorProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem('user_role') as UserRole) || 'brand');
  const [user, setUser] = useState<User | BrandProfile | CreatorProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('token'));

  const isGuest = role === 'guest';

  // Check stored token on load
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    authService
      .getBrandProfile()
      .then((res) => {
        const profile = res.data?.profile || res.profile;
        if (profile) {
          const mappedUser: BrandProfile = {
            id: profile.userId?._id || profile.userId?.id || profile._id,
            name: profile.userId?.fullName || profile.companyName || 'Brand User',
            email: profile.userId?.email || '',
            role: 'brand',
            avatar: profile.userId?.profileImage || profile.companyLogo || '',
            companyName: profile.companyName || '',
            industry: profile.industry || '',
            website: profile.website || '',
            logo: profile.companyLogo || '',
            description: profile.aboutBrand || '',
            country: profile.location?.country || 'India',
            activeCampaignsCount: 0,
            totalSpent: 0,
            createdAt: profile.createdAt || new Date().toISOString(),
          };
          setUser(mappedUser);
          setIsAuthenticated(true);
          setRole('brand');
        }
      })
      .catch((err) => {
        console.warn('Initial session check error:', err.message);
      });
  }, []);

  const enterGuestMode = () => {
    setIsAuthenticated(true);
    setRole('guest');
    setUser(GUEST_USER);
  };

  const loginApi = async (credentials: { email: string; password: string; role?: UserRole }) => {
    const res = await authService.login({ email: credentials.email, password: credentials.password });
    const { token, user: apiUser } = res.data || res;
    if (token) {
      localStorage.setItem('token', token);
      const selectedRole = credentials.role || apiUser.role || 'brand';
      localStorage.setItem('user_role', selectedRole);
      setIsAuthenticated(true);
      setRole(selectedRole);

      // Fetch or format profile
      if (selectedRole === 'brand') {
        try {
          const profileRes = await authService.getBrandProfile();
          const profile = profileRes.data?.profile || profileRes.profile;
          if (profile) {
            const mappedUser: BrandProfile = {
              id: apiUser._id || apiUser.id,
              name: apiUser.fullName || profile.companyName || 'Brand User',
              email: apiUser.email,
              role: 'brand',
              avatar: apiUser.profileImage || profile.companyLogo || '',
              companyName: profile.companyName || '',
              industry: profile.industry || '',
              website: profile.website || '',
              logo: profile.companyLogo || '',
              description: profile.aboutBrand || '',
              country: profile.location?.country || 'India',
              activeCampaignsCount: 0,
              totalSpent: 0,
              createdAt: apiUser.createdAt || new Date().toISOString(),
            };
            setUser(mappedUser);
            return res;
          }
        } catch (_) {}
      }

      setUser({
        id: apiUser._id || apiUser.id,
        name: apiUser.fullName || 'User',
        email: apiUser.email,
        role: selectedRole,
        avatar: apiUser.profileImage || '',
        createdAt: apiUser.createdAt || new Date().toISOString(),
      } as User);
    }
    return res;
  };

  const registerApi = async (payload: any) => {
    const res = await authService.register(payload);
    return res;
  };

  const login = (selectedRole: UserRole, details: AuthDetails = {}) => {
    if (selectedRole === 'guest') return;
    setIsAuthenticated(true);
    setRole(selectedRole);
    localStorage.setItem('user_role', selectedRole);

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
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
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
    setUser((prev) => (prev ? ({ ...prev, ...updatedFields } as any) : null));
    if (role === 'brand') {
      authService
        .updateBrandProfile({
          companyName: (updatedFields as any).companyName || (user as any)?.companyName,
          industry: (updatedFields as any).industry || (user as any)?.industry,
          aboutBrand: (updatedFields as any).description || (user as any)?.description,
          companyLogo: (updatedFields as any).logo || (user as any)?.logo,
          website: (updatedFields as any).website || (user as any)?.website,
        })
        .catch((err) => console.warn('Failed to update brand profile on API:', err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isGuest,
        login,
        loginApi,
        registerApi,
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
