'use client';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import type { User, LoginCredentials, RegisterData, UserRole, UserPermission } from './types';
import { ROLE_PERMISSIONS } from './types';

export class AuthService {
  
  /**
   * Sign in with email and password
   */
  static async signIn(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      const user = await this.getUserProfile(userCredential.user.uid);
      if (!user) {
        throw new Error('User profile not found');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact your administrator.');
      }

      // Update last login
      await this.updateLastLogin(user.id);
      
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
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const userData: User = {
        id: userCredential.user.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        permissions: data.permissions || ROLE_PERMISSIONS[data.role],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Only include optional fields if they have values
        ...(data.specialization && { specialization: data.specialization }),
        ...(data.licenseNumber && { licenseNumber: data.licenseNumber }),
        ...(data.employeeId && { employeeId: data.employeeId }),
        ...(data.department && { department: data.department }),
        ...(data.phone && { phone: data.phone }),
      };

      // Prepare data for Firestore (remove undefined values)
      const firestoreData = Object.fromEntries(
        Object.entries({
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }).filter(([_, value]) => value !== undefined)
      );

      // Save user profile to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), firestoreData);

      return userData;
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
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Get user profile from Firestore
   */
  static async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          id: uid,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate(),
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: serverTimestamp(),
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
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastLoginAt: doc.data().lastLoginAt?.toDate(),
      })) as User[];
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
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', role));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastLoginAt: doc.data().lastLoginAt?.toDate(),
      })) as User[];
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
      await updateDoc(doc(db, 'users', uid), {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
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
      await updateDoc(doc(db, 'users', uid), {
        isActive: true,
        updatedAt: serverTimestamp(),
      });
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
      await updateDoc(doc(db, 'users', uid), {
        permissions: permissions,
        updatedAt: serverTimestamp(),
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
  static getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.getUserProfile(firebaseUser.uid);
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

// Utility functions for role checking
export const isAdmin = (user: User | null): boolean => user?.role === 'admin';
export const isDoctor = (user: User | null): boolean => user?.role === 'doctor';
export const isReceptionist = (user: User | null): boolean => user?.role === 'receptionist';
export const isPatient = (user: User | null): boolean => user?.role === 'patient';
export const isStaff = (user: User | null): boolean => user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'receptionist';
