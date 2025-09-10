// Neon-based Authentication Service
// Replaces Firebase Auth with PostgreSQL-based authentication

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'doctor' | 'receptionist' | 'patient';
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

class NeonAuthService {
  
  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<{ user: AuthUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Set default permissions based on role
      const defaultPermissions = this.getDefaultPermissions(userData.role || 'patient');

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role || 'patient',
          permissions: defaultPermissions,
          hashedPassword,
          isActive: true,
        }
      });

      // Generate JWT token
      const token = this.generateJWT(user.id);

      // Create session
      await this.createSession(user.id, token);

      return {
        user: this.mapUserToAuthUser(user),
        token
      };

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<{ user: AuthUser; token: string }> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user || !user.hashedPassword) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateJWT(user.id);

      // Create session
      await this.createSession(user.id, token, ipAddress, userAgent);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      return {
        user: this.mapUserToAuthUser(user),
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(token: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE sessions 
        SET is_active = false 
        WHERE token = ${token}
      `;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token and get user
   */
  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      // Check if session exists and is active
      const session = await prisma.$queryRaw`
        SELECT s.*, u.* FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ${token} 
        AND s.is_active = true 
        AND s.expires_at > NOW()
      ` as any[];

      if (!session || session.length === 0) {
        return null;
      }

      const user = session[0];
      return this.mapUserToAuthUser(user);

    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Get current user by token
   */
  async getCurrentUser(token: string): Promise<AuthUser | null> {
    return this.verifyToken(token);
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.hashedPassword) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
      
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { hashedPassword: hashedNewPassword }
      });

      // Invalidate all sessions except current one
      await prisma.$executeRaw`
        UPDATE sessions 
        SET is_active = false 
        WHERE user_id = ${userId}
      `;

    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<string> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return 'If an account with this email exists, you will receive a password reset link.';
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Save reset token
      await prisma.$executeRaw`
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
        VALUES (${this.generateId()}, ${user.id}, ${resetToken}, ${expiresAt})
      `;

      // TODO: Send email with reset link
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return 'If an account with this email exists, you will receive a password reset link.';

    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const resetToken = await prisma.$queryRaw`
        SELECT * FROM password_reset_tokens 
        WHERE token = ${token} 
        AND expires_at > NOW() 
        AND used = false
      ` as any[];

      if (!resetToken || resetToken.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const tokenData = resetToken[0];

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      await prisma.user.update({
        where: { id: tokenData.user_id },
        data: {
          hashedPassword
        }
      });

      // Mark token as used
      await prisma.$executeRaw`
        UPDATE password_reset_tokens 
        SET used = true 
        WHERE id = ${tokenData.id}
      `;

      // Invalidate all user sessions
      await prisma.$executeRaw`
        UPDATE sessions 
        SET is_active = false 
        WHERE user_id = ${tokenData.user_id}
      `;

    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Private helper methods

  private generateJWT(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
  }

  private async createSession(userId: string, token: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.$executeRaw`
      INSERT INTO sessions (id, user_id, token, expires_at, ip_address, user_agent)
      VALUES (${this.generateId()}, ${userId}, ${token}, ${expiresAt}, ${ipAddress}, ${userAgent})
    `;
  }

  private mapUserToAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions || [],
      isActive: user.isActive
    };
  }

  private getDefaultPermissions(role: string): string[] {
    const permissionMap = {
      admin: [
        'view_patients', 'edit_patients', 'delete_patients',
        'view_appointments', 'edit_appointments', 'delete_appointments',
        'view_treatments', 'edit_treatments', 'delete_treatments',
        'view_billing', 'edit_billing',
        'view_staff', 'edit_staff',
        'view_inventory', 'edit_inventory',
        'view_settings', 'edit_settings',
        'view_analytics'
      ],
      doctor: [
        'view_patients', 'edit_patients',
        'view_appointments', 'edit_appointments',
        'view_treatments', 'edit_treatments',
        'view_medical_records', 'edit_medical_records',
        'view_dental_chart', 'edit_dental_chart'
      ],
      receptionist: [
        'view_patients', 'edit_patients',
        'view_appointments', 'edit_appointments',
        'view_billing',
        'view_communications', 'send_communications'
      ],
      patient: [
        'view_own_data',
        'view_patient_portal'
      ]
    };

    return permissionMap[role as keyof typeof permissionMap] || [];
  }

  private generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Clean up expired sessions and tokens
   */
  async cleanupExpired(): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM sessions WHERE expires_at < NOW()
      `;
      
      await prisma.$executeRaw`
        DELETE FROM password_reset_tokens WHERE expires_at < NOW()
      `;
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

export const neonAuth = new NeonAuthService();
export default neonAuth;