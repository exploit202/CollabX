import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, getBrandProfile, getCreatorProfile } from '../lib/api';

export type UserRole = 'brand' | 'creator' | 'admin' | 'guest';

export const isGuestAllowedPath = (pathname: string) =>
  pathname === '/brand/discover' || pathname.startsWith('/brand/creator/');

export interface User {
  id: string;
  _id?: string;
  name: string;
  fullName?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  profileImage?: string | null;
  companyName?: string;
  verified?: boolean;
}

interface AuthContextType {
  user: any;
  role: UserRole;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (token: string, user: any, role?: UserRole) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateUserProfile: (updatedFields: Partial<any>) => void;
  enterGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('collabx_role') as UserRole;
    return savedRole && ['brand', 'creator', 'admin', 'guest'].includes(savedRole) ? savedRole : 'guest';
  });

  const [user, setUser] = useState<any>(() => {
    const savedUserStr = localStorage.getItem('collabx_user');
    try {
      return savedUserStr ? JSON.parse(savedUserStr) : null;
    } catch {
      localStorage.removeItem('collabx_user');
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!getToken() && role !== 'guest';
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isGuest = role === 'guest';

  const login = (token: string, userData: any, userRole?: UserRole) => {
    setToken(token);
    const assignedRole = userRole || userData?.role || 'brand';
    setRole(assignedRole);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('collabx_role', assignedRole);
    localStorage.setItem('collabx_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('collabx_role');
    localStorage.removeItem('collabx_user');
    setIsAuthenticated(false);
    setUser(null);
    setRole('guest');
    setIsLoading(false);
  };

  const enterGuestMode = () => {
    setToken(null);
    localStorage.removeItem('collabx_role');
    localStorage.removeItem('collabx_user');
    setIsAuthenticated(true);
    setRole('guest');
    setUser({
      id: 'guest',
      name: 'Guest User',
      email: 'guest@collabx.com',
      role: 'guest'
    });
    setIsLoading(false);
  };

  const refreshSession = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      try {
        const brandRes = await getBrandProfile();
        if (brandRes.success && brandRes.data?.profile) {
          const profile = brandRes.data.profile;
          const updatedUser = {
            ...profile,
            id: profile.userId?._id || profile.userId,
            name: profile.companyName || 'Brand',
            companyName: profile.companyName,
            role: 'brand'
          };
          setUser(updatedUser);
          setRole('brand');
          setIsAuthenticated(true);
          localStorage.setItem('collabx_role', 'brand');
          localStorage.setItem('collabx_user', JSON.stringify(updatedUser));
          setIsLoading(false);
          return;
        }
      } catch (e) {
        /* Not a valid brand token */
      }

      try {
        const creatorRes = await getCreatorProfile();
        if (creatorRes.success && (creatorRes.data?.user || creatorRes.data?.profile)) {
          const u = creatorRes.data.user;
          const profile = creatorRes.data.profile;
          const displayName = u?.fullName || u?.name || profile?.userId?.fullName || 'Creator';
          const updatedUser = {
            ...profile,
            ...u,
            id: u?._id || profile?.userId,
            name: displayName,
            fullName: displayName,
            email: u?.email || profile?.email,
            role: 'creator'
          };
          setUser(updatedUser);
          setRole('creator');
          setIsAuthenticated(true);
          localStorage.setItem('collabx_role', 'creator');
          localStorage.setItem('collabx_user', JSON.stringify(updatedUser));
          setIsLoading(false);
          return;
        }
      } catch (e) {
        /* Not a valid creator token */
      }

      // If token is invalid or both profile calls failed
      logout();
    } catch (err) {
      console.error('Failed to restore session:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const updateUserProfile = (updatedFields: Partial<any>) => {
    setUser((prev: any) => {
      const nextUser = prev ? { ...prev, ...updatedFields } : null;
      if (nextUser) {
        try {
          localStorage.setItem('collabx_user', JSON.stringify(nextUser));
        } catch {
          /* Storage full or restricted */
        }
      }
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isGuest,
        isLoading,
        login,
        logout,
        refreshSession,
        updateUserProfile,
        enterGuestMode
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
