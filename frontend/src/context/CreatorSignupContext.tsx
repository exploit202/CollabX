import React, { createContext, useContext, useState } from 'react';

export interface CreatorSignupUser {
  userId: string;
  fullName: string;
  email: string;
  role: 'creator';
}

interface CreatorSignupContextType {
  creator: CreatorSignupUser | null;
  setCreator: (user: CreatorSignupUser) => void;
  clearCreator: () => void;
}

const CreatorSignupContext = createContext<CreatorSignupContextType | undefined>(undefined);

export const CreatorSignupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creator, setCreatorState] = useState<CreatorSignupUser | null>(() => {
    try {
      const saved = localStorage.getItem('collabx_pending_creator');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setCreator = (user: CreatorSignupUser) => {
    setCreatorState(user);
    try {
      localStorage.setItem('collabx_pending_creator', JSON.stringify(user));
    } catch {
      /* Storage quota */
    }
  };

  const clearCreator = () => {
    setCreatorState(null);
    localStorage.removeItem('collabx_pending_creator');
  };

  return (
    <CreatorSignupContext.Provider value={{ creator, setCreator, clearCreator }}>
      {children}
    </CreatorSignupContext.Provider>
  );
};

export const useCreatorSignup = () => {
  const context = useContext(CreatorSignupContext);
  if (!context) {
    throw new Error('useCreatorSignup must be used within a CreatorSignupProvider');
  }
  return context;
};
