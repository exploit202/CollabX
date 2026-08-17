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
}

const CreatorSignupContext = createContext<CreatorSignupContextType | undefined>(undefined);

export const CreatorSignupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creator, setCreatorState] = useState<CreatorSignupUser | null>(null);

  const setCreator = (user: CreatorSignupUser) => {
    setCreatorState(user);
  };

  return (
    <CreatorSignupContext.Provider value={{ creator, setCreator }}>
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
