'use client';

import type { User, LoginCredentials, RegisterData, UserRole, UserPermission } from './types';

const SESSION_KEY = 'sessionUserId';
const AUTH_API_BASE = '/api/auth';

function setSessionUserId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, id);
  window.dispatchEvent(new StorageEvent('storage', { key: SESSION_KEY, newValue: id }));
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new StorageEvent('storage', { key: SESSION_KEY, newValue: null } as any));
}

async function getSessionUser(): Promise<User | null> {
  if (typeof window === 'undefined') return null;
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  try {
    const response = await fetch(`${AUTH_API_BASE}/users/${id}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (response.status === 404) {
      // Stale session id -> clear and treat as signed out
      clearSession();
      return null;
    }
    if (!response.ok) return null;
    const { user } = (await response.json()) as { user: User };
    return user ?? null;
  } catch (error) {
    console.error('Failed to fetch session user', error);
    return null;
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = (body as { error?: string }).error ?? 'Request failed';
    throw new Error(errorMessage);
  }

  return body as T;
}

export class AuthService {
  
  /**
   * Sign in with email and password
   */
  static async signIn(credentials: LoginCredentials): Promise<User> {
    try {
      const { user } = await requestJson<{ user: User }>(`${AUTH_API_BASE}/sign-in`, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      setSessionUserId(user.id);
      return user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterData & { permissions?: UserPermission[] }): Promise<User> {
    try {
      const { user } = await requestJson<{ user: User }>(`${AUTH_API_BASE}/register`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setSessionUserId(user.id);
      return user;
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
      // Attempt to invalidate server-side session if present; ignore failures
      try {
        await fetch(`${AUTH_API_BASE}/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      } catch (_) {
        // no-op
      }
      clearSession();
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Get user profile from Firestore
   */
  static async getUserProfile(id: string): Promise<User | null> {
    try {
      const { user } = await requestJson<{ user: User }>(`${AUTH_API_BASE}/users/${id}`);
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(id: string): Promise<void> {
    try {
      await requestJson<{ user: User }>(`${AUTH_API_BASE}/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ lastLoginAt: new Date().toISOString() }),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(id: string, updates: Partial<User>): Promise<void> {
    try {
      await requestJson<{ user: User }>(`${AUTH_API_BASE}/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
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
      const { users } = await requestJson<{ users: User[] }>(`${AUTH_API_BASE}/users`);
      return users;
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
      const { users } = await requestJson<{ users: User[] }>(`${AUTH_API_BASE}/users?role=${encodeURIComponent(role)}`);
      return users;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(id: string): Promise<void> {
    try {
      await requestJson<{ user: User }>(`${AUTH_API_BASE}/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: false }),
      });
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      throw new Error('Failed to deactivate user');
    }
  }

  /**
   * Activate user account
   */
  static async activateUser(id: string): Promise<void> {
    try {
      await requestJson<{ user: User }>(`${AUTH_API_BASE}/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
      });
    } catch (error: any) {
      console.error('Error activating user:', error);
      throw new Error('Failed to activate user');
    }
  }

  /**
   * Update user permissions
   */
  static async updateUserPermissions(id: string, permissions: UserPermission[]): Promise<void> {
    try {
      await requestJson<{ user: User }>(`${AUTH_API_BASE}/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ permissions }),
      });
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
   * Get current Firebase user
   */
  static getCurrentFirebaseUser(): null { return null; }

  static async getCurrentUser(): Promise<User | null> {
    return await getSessionUser();
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    let cancelled = false;
    (async () => {
      const u = await getSessionUser();
      if (!cancelled) callback(u);
    })();
    const handler = async (e: StorageEvent) => {
      if (e.key && e.key !== SESSION_KEY) return;
      const u = await getSessionUser();
      if (!cancelled) callback(u);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handler);
    }
    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') window.removeEventListener('storage', handler);
    };
  }
}

// Utility functions for role checking
export const isAdmin = (user: User | null): boolean => user?.role === 'admin';
export const isDoctor = (user: User | null): boolean => user?.role === 'doctor';
export const isReceptionist = (user: User | null): boolean => user?.role === 'receptionist';
export const isPatient = (user: User | null): boolean => user?.role === 'patient';
export const isStaff = (user: User | null): boolean => user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'receptionist';
