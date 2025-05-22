
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  quickLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser).user);
      } catch (error) {
        // If there's an error parsing the stored user, clear it
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simplified: Create a demo user and bypass actual API login
      const demoUser = {
        access_token: "demo_token_12345",
        token_type: "bearer",
        user: {
          id: email.replace(/[^a-zA-Z0-9]/g, "_"),
          name: email.split('@')[0],
          email: email
        }
      };
      
      setUser(demoUser.user);
      localStorage.setItem('user', JSON.stringify(demoUser));
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simplified: Create a demo user and bypass actual API registration
      const demoUser = {
        access_token: "demo_token_12345",
        token_type: "bearer",
        user: {
          id: email.replace(/[^a-zA-Z0-9]/g, "_"),
          name: name,
          email: email
        }
      };
      
      setUser(demoUser.user);
      localStorage.setItem('user', JSON.stringify(demoUser));
      toast.success('Registered successfully');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async () => {
    setIsLoading(true);
    try {
      // Create demo user data
      const demoUser = {
        access_token: "demo_token_12345",
        token_type: "bearer",
        user: {
          id: "demo123",
          name: "Demo User",
          email: "demo@example.com"
        }
      };
      
      // Set user in state and localStorage
      setUser(demoUser.user);
      localStorage.setItem('user', JSON.stringify(demoUser));
      toast.success('Quick access successful');
    } catch (error) {
      console.error('Quick login error:', error);
      toast.error('Quick access failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    quickLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
