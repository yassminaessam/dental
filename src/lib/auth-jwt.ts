'use client';

import type { User, LoginCredentials, RegisterData, UserRole, UserPermission } from './types';
import { ROLE_PERMISSIONS } from './types';

// JWT token management
const JWT_SECRET = process.env.JWT_SECRET || 'dental_clinic_jwt_secret_key_2025_very_secure_random_string_for_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  
  /**
   * Sign in with email and password
   */
  static async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sign in');
      }

      const data = await response.json();
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterData & { permissions?: UserPermission[] }): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          permissions: data.permissions || ROLE_PERMISSIONS[data.role],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to register user');
      }

      const result = await response.json();
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
      }

      return result;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register user');
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
      
      // Call logout API to invalidate server-side session if needed
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      }).catch(() => {
        // Ignore errors during logout API call
      });
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem('user_data');
      const token = localStorage.getItem('auth_token');
      
      if (!userData || !token) return null;
      
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get stored JWT token
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getToken() !== null && this.getCurrentUser() !== null;
  }

  /**
   * Get user profile from server
   */
  static async getUserProfile(uid: string): Promise<User | null> {
    try {
      const response = await fetch(`/api/auth/user/${uid}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const response = await fetch(`/api/auth/user/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      // Update localStorage if updating current user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === uid) {
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const response = await fetch(`/api/auth/users?role=${role}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(uid: string): Promise<void> {
    try {
      const response = await fetch(`/api/auth/user/${uid}/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to deactivate user');
      }
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      throw new Error('Failed to deactivate user');
    }
  }

  /**
   * Activate user account
   */
  static async activateUser(uid: string): Promise<void> {
    try {
      const response = await fetch(`/api/auth/user/${uid}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to activate user');
      }
    } catch (error: any) {
      console.error('Error activating user:', error);
      throw new Error('Failed to activate user');
    }
  }

  /**
   * Update user permissions
   */
  static async updateUserPermissions(uid: string, permissions: UserPermission[]): Promise<void> {
    try {
      const response = await fetch(`/api/auth/user/${uid}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user permissions');
      }
    } catch (error: any) {
      console.error('Error updating user permissions:', error);
      throw new Error('Failed to update user permissions');
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;
    return user.permissions.includes(permission as any);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(user: User | null, permissions: string[]): boolean {
    if (!user) return false;
    return permissions.some(permission => user.permissions.includes(permission as any));
  }

  /**
   * Listen to auth state changes (simplified for JWT)
   */
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    // For JWT, we'll check periodically or when localStorage changes
    const checkAuth = () => {
      const user = this.getCurrentUser();
      callback(user);
    };

    // Initial check
    checkAuth();

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data' || e.key === 'auth_token') {
        checkAuth();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    // Return cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }

  /**
   * Refresh user data from server
   */
  static async refreshUser(): Promise<User | null> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    try {
      const updatedUser = await this.getUserProfile(currentUser.id);
      if (updatedUser && typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
      return updatedUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return currentUser;
    }
  }
}

// Utility functions for role checking
export const isAdmin = (user: User | null): boolean => user?.role === 'admin';
export const isDoctor = (user: User | null): boolean => user?.role === 'doctor';
export const isReceptionist = (user: User | null): boolean => user?.role === 'receptionist';
export const isPatient = (user: User | null): boolean => user?.role === 'patient';
export const isStaff = (user: User | null): boolean => user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'receptionist';