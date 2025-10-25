import { prisma } from '@/lib/prisma';

// Define UserRole as string literals
const UserRole = {
  admin: 'admin' as const,
  doctor: 'doctor' as const,
  receptionist: 'receptionist' as const,
  patient: 'patient' as const
};

type User = any; // Simplified type for now

// Define UserPermission enum locally since it's used as strings in the schema
export enum UserPermission {
  VIEW_PATIENTS = 'view_patients',
  EDIT_PATIENTS = 'edit_patients',
  DELETE_PATIENTS = 'delete_patients',
  VIEW_APPOINTMENTS = 'view_appointments',
  EDIT_APPOINTMENTS = 'edit_appointments',
  DELETE_APPOINTMENTS = 'delete_appointments',
  VIEW_TREATMENTS = 'view_treatments',
  EDIT_TREATMENTS = 'edit_treatments',
  DELETE_TREATMENTS = 'delete_treatments',
  VIEW_BILLING = 'view_billing',
  EDIT_BILLING = 'edit_billing',
  DELETE_BILLING = 'delete_billing',
  VIEW_REPORTS = 'view_reports',
}
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  employeeId?: string;
  department?: string;
}

export interface AuthUser extends Omit<User, 'permissions'> {
  permissions: UserPermission[];
}

// JWT secret - in production, use a secure environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key';

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    try {
      const { email, password } = credentials;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // For demo purposes, we'll use a simple password check
      // In production, you should hash passwords properly
      const isValidPassword = await bcrypt.compare(password, (user as any).passwordHash || '');
      
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const authUser: AuthUser = {
        ...user,
        permissions: user.permissions as UserPermission[]
      };

      return { user: authUser, token };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterData & { permissions?: UserPermission[] }): Promise<AuthUser> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role as any,
          permissions: data.permissions || this.getDefaultPermissions(data.role),
          passwordHash: hashedPassword,
          isActive: true,
          // Optional fields
          phone: data.phone,
          specialization: data.specialization,
          licenseNumber: data.licenseNumber,
          employeeId: data.employeeId,
          department: data.department,
        }
      });

      const authUser: AuthUser = {
        ...user,
        permissions: user.permissions as UserPermission[]
      };

      return authUser;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register user');
    }
  }

  /**
   * Verify JWT token and get user
   */
  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        return null;
      }

      const authUser: AuthUser = {
        ...user,
        permissions: user.permissions as UserPermission[]
      };

      return authUser;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(uid: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: uid }
      });

      if (!user) {
        return null;
      }

      const authUser: AuthUser = {
        ...user,
        permissions: user.permissions as UserPermission[]
      };

      return authUser;
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
      await prisma.user.update({
        where: { id: uid },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<AuthUser[]> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return users.map((user: any) => ({
        ...user,
        permissions: user.permissions as UserPermission[]
      }));
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, (user as any).passwordHash || '');
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { 
          passwordHash: hashedNewPassword,
          updatedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  }

  /**
   * Reset password (generate reset token)
   */
  static async requestPasswordReset(email: string): Promise<string> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // In a real application, you would save this token to the database
      // and send it via email
      
      return resetToken;
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      throw new Error(error.message || 'Failed to request password reset');
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { 
          passwordHash: hashedPassword,
          updatedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  /**
   * Get default permissions for a role
   */
  private static getDefaultPermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      admin: [
        'view_patients', 'edit_patients', 'delete_patients',
        'view_appointments', 'edit_appointments', 'delete_appointments',
        'view_treatments', 'edit_treatments', 'delete_treatments',
        'view_billing', 'edit_billing', 'delete_billing',
        'view_reports', 'edit_reports',
        'view_staff', 'edit_staff', 'delete_staff',
        'view_inventory', 'edit_inventory',
        'view_settings', 'edit_settings',
        'view_medical_records', 'edit_medical_records',
        'view_dental_chart', 'edit_dental_chart',
        'view_communications', 'send_communications',
        'view_insurance', 'edit_insurance',
        'view_analytics',
        'view_patient_portal', 'edit_patient_portal'
      ],
      doctor: [
        'view_patients', 'edit_patients',
        'view_appointments', 'edit_appointments',
        'view_treatments', 'edit_treatments',
        'view_billing',
        'view_medical_records', 'edit_medical_records',
        'view_dental_chart', 'edit_dental_chart',
        'view_communications', 'send_communications',
        'view_insurance',
        'view_analytics'
      ],
      receptionist: [
        'view_patients', 'edit_patients',
        'view_appointments', 'edit_appointments',
        'view_billing', 'edit_billing',
        'view_communications', 'send_communications',
        'view_insurance', 'edit_insurance',
        'view_inventory'
      ],
      patient: [
        'view_own_data'
      ]
    };

    return rolePermissions[role] || [];
  }
}

// Utility functions for role checking
export const isAdmin = (user: AuthUser | null): boolean => user?.role === 'admin';
export const isDoctor = (user: AuthUser | null): boolean => user?.role === 'doctor';
export const isReceptionist = (user: AuthUser | null): boolean => user?.role === 'receptionist';
export const isPatient = (user: AuthUser | null): boolean => user?.role === 'patient';

export const hasPermission = (user: AuthUser | null, permission: string): boolean => {
  return user?.permissions.includes(permission as UserPermission) || false;
};