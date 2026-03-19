import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: (userData: User) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ctrl+R / page refresh pe user data restore karo
    try {
      const saved = localStorage.getItem('moverewards_user');
      const token = localStorage.getItem('mr_token');
      if (saved && token) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      }
    } catch {
      // JSON parse error - clear bad data
      localStorage.removeItem('moverewards_user');
      localStorage.removeItem('mr_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('moverewards_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('moverewards_user');
    localStorage.removeItem('mr_token');
  };

  const refreshUser = (u: User) => {
    setUser(u);
    localStorage.setItem('moverewards_user', JSON.stringify(u));
  };

  // Loading state - prevents flash of login page on refresh
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout, refreshUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === UserRole.ADMIN
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
