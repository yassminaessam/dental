'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '@/lib/auth';
import type { User, AuthState } from '@/lib/types';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      });
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await AuthService.signIn({ email, password });
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await AuthService.signOut();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const refreshUser = async () => {
    const user = await AuthService.getCurrentUser();
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      signIn,
      signOut,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hooks for role-based access
export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [isLoading, isAuthenticated]);

  return { user, isLoading, isAuthenticated };
}

export function useRequireRole(allowedRoles: string[]) {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        window.location.href = '/login';
      } else if (user && !allowedRoles.includes(user.role)) {
        window.location.href = '/unauthorized';
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles]);

  return { user, isLoading, isAuthenticated };
}

export function usePermission(permission: string) {
  const { user } = useAuth();
  return AuthService.hasPermission(user, permission);
}

export function useAnyPermission(permissions: string[]) {
  const { user } = useAuth();
  return AuthService.hasAnyPermission(user, permissions);
}
