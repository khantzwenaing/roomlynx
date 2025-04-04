
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  user: User | null; // Added for backward compatibility
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Add isLoading property
  error: string | null; // Add error property
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock login - in a real app, this would call your authentication API
      const mockUser: User = {
        id: '1',
        email: email,
        role: 'admin',
        name: 'Test User',
        created_at: new Date().toISOString()
      };
      
      setCurrentUser(mockUser);
      setIsLoading(false);
      return mockUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setError(null);
  };

  const value = {
    currentUser,
    user: currentUser, // Add user property mapped to currentUser for backward compatibility
    login,
    logout,
    isAuthenticated: !!currentUser,
    isLoading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
