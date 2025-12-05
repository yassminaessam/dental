/**
 * Patient-User Synchronization Service
 * 
 * This service ensures bidirectional sync between User and Patient tables:
 * 1. When a patient role user is created in User Management -> Create Patient record
 * 2. When a patient is created in Patients page -> Create User account (optional)
 */

import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { PatientsService } from './patients';
import { UsersService } from './users';
import type { User, Patient, UserPermission } from '@/lib/types';
import { ROLE_PERMISSIONS } from '@/lib/types';

export interface PatientUserSyncOptions {
  createUserAccount?: boolean; // Whether to create a user account for the patient
  defaultPassword?: string; // Default password for new user accounts
  sendWelcomeEmail?: boolean; // Whether to send a welcome email (future feature)
}

export const PatientUserSyncService = {
  /**
   * Create a Patient record from a User record (when user has 'patient' role)
   */
  async createPatientFromUser(user: User, additionalData?: Partial<Patient>): Promise<Patient | null> {
    try {
      // Check if patient already exists
      const existingPatient = await prisma.patient.findUnique({
        where: { email: user.email }
      });

      if (existingPatient) {
        // Update the user with the patientId
        await UsersService.update(user.id, { patientId: existingPatient.id });
        return PatientsService.get(existingPatient.id);
      }

      // Create new patient record
      const patientData = {
        name: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        dob: additionalData?.dob || new Date(2000, 0, 1), // Default DOB if not provided
        status: 'Active' as const,
        address: user.address,
        ecName: additionalData?.ecName,
        ecPhone: additionalData?.ecPhone,
        ecRelationship: additionalData?.ecRelationship,
        insuranceProvider: additionalData?.insuranceProvider,
        policyNumber: additionalData?.policyNumber,
        medicalHistory: additionalData?.medicalHistory,
      };

      const newPatient = await PatientsService.create(patientData);

      // Update the user record with the patientId
      await UsersService.update(user.id, { patientId: newPatient.id });

      return newPatient;
    } catch (error) {
      console.error('[PatientUserSync] Error creating patient from user:', error);
      return null;
    }
  },

  /**
   * Create a User account from a Patient record (optional, for patient portal access)
   */
  async createUserFromPatient(
    patient: Patient, 
    password: string,
    options?: PatientUserSyncOptions
  ): Promise<User | null> {
    try {
      console.log(`[PatientUserSync] Creating user account for patient: ${patient.email}`);
      
      // Check if user already exists
      const existingUser = await UsersService.getByEmail(patient.email);
      
      if (existingUser) {
        console.log(`[PatientUserSync] User already exists for ${patient.email}, linking patientId`);
        // Link user to patient if not already linked
        if (!existingUser.patientId) {
          await UsersService.update(existingUser.id, { patientId: patient.id });
        }
        return existingUser;
      }

      // Get proper permissions for patient role
      const patientPermissions: UserPermission[] = ROLE_PERMISSIONS.patient || ['view_own_data'];

      // Create new user account
      const userData = {
        email: patient.email,
        password: password,
        firstName: patient.name,
        lastName: patient.lastName,
        role: 'patient' as const,
        phone: patient.phone || undefined,
        address: patient.address || undefined,
        permissions: patientPermissions,
      };

      console.log(`[PatientUserSync] Creating user with data:`, { ...userData, password: '***' });
      const newUser = await UsersService.create(userData);
      console.log(`[PatientUserSync] User created successfully: ${newUser.id}`);

      // Update user with patientId to link the records
      await UsersService.update(newUser.id, { patientId: patient.id });
      console.log(`[PatientUserSync] Linked user ${newUser.id} to patient ${patient.id}`);

      return newUser;
    } catch (error: any) {
      console.error('[PatientUserSync] Error creating user from patient:', error);
      console.error('[PatientUserSync] Error details:', error.message, error.code);
      throw error; // Re-throw to allow caller to handle
    }
  },

  /**
   * Sync existing patients with users
   * This should be run once to sync existing data
   */
  async syncExistingPatientsAndUsers(): Promise<{ 
    patientsCreated: number;
    usersLinked: number;
    errors: string[];
  }> {
    const result = {
      patientsCreated: 0,
      usersLinked: 0,
      errors: [] as string[]
    };

    try {
      // 1. Find all patient role users without patientId
      const patientUsers = await prisma.user.findMany({
        where: {
          role: 'patient',
          patientId: null
        }
      });

      for (const user of patientUsers) {
        try {
          const patient = await this.createPatientFromUser({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as any,
            permissions: user.permissions as any,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            phone: user.phone || undefined,
            address: user.address || undefined,
          });

          if (patient) {
            result.patientsCreated++;
          }
        } catch (error: any) {
          result.errors.push(`Failed to create patient for user ${user.email}: ${error.message}`);
        }
      }

      // 2. Find all patients with emails that match user accounts
      const allPatients = await PatientsService.list();
      
      for (const patient of allPatients) {
        try {
          const user = await UsersService.getByEmail(patient.email);
          
          if (user && !user.patientId) {
            await UsersService.update(user.id, { patientId: patient.id });
            result.usersLinked++;
          }
        } catch (error: any) {
          result.errors.push(`Failed to link user for patient ${patient.email}: ${error.message}`);
        }
      }

      return result;
    } catch (error: any) {
      result.errors.push(`Sync failed: ${error.message}`);
      return result;
    }
  },

  /**
   * Check if a patient has a user account
   */
  async hasUserAccount(patientId: string): Promise<boolean> {
    try {
      const patient = await PatientsService.get(patientId);
      if (!patient) return false;

      const user = await UsersService.getByEmail(patient.email);
      return !!user;
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if a user has a patient record
   */
  async hasPatientRecord(userId: string): Promise<boolean> {
    try {
      const user = await UsersService.getById(userId);
      if (!user || user.role !== 'patient') return false;

      return !!user.patientId;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get patient record for a user
   */
  async getPatientForUser(userId: string): Promise<Patient | null> {
    try {
      const user = await UsersService.getById(userId);
      if (!user || !user.patientId) {
        // Try to find by email
        const patient = await prisma.patient.findUnique({
          where: { email: user?.email }
        });
        
        if (patient && user) {
          // Link them
          await UsersService.update(user.id, { patientId: patient.id });
          return PatientsService.get(patient.id);
        }
        
        return null;
      }

      return PatientsService.get(user.patientId);
    } catch (error) {
      console.error('[PatientUserSync] Error getting patient for user:', error);
      return null;
    }
  },

  /**
   * Get user account for a patient (by patientId link or email fallback)
   */
  async getUserForPatient(patientId: string): Promise<User | null> {
    try {
      // First try to find by patientId link (most reliable)
      const userByPatientId = await UsersService.getByPatientId(patientId);
      if (userByPatientId) return userByPatientId;

      // Fallback: find by email
      const patient = await PatientsService.get(patientId);
      if (!patient) return null;

      return UsersService.getByEmail(patient.email);
    } catch (error) {
      console.error('[PatientUserSync] Error getting user for patient:', error);
      return null;
    }
  },

  /**
   * Delete user account for a patient
   */
  async deleteUserForPatient(patientId: string): Promise<boolean> {
    try {
      // First try to find by patientId link
      let user = await UsersService.getByPatientId(patientId);
      
      // Fallback: find by email
      if (!user) {
        const patient = await PatientsService.get(patientId);
        if (!patient) return false;
        user = await UsersService.getByEmail(patient.email);
      }
      
      if (!user) return true; // No user to delete

      // Delete user from database
      await prisma.user.delete({ where: { id: user.id } });
      console.log(`[PatientUserSync] Deleted user account for patient ${patientId}`);
      return true;
    } catch (error) {
      console.error('[PatientUserSync] Error deleting user for patient:', error);
      return false;
    }
  },

  /**
   * Update user account when patient is updated
   */
  async updateUserFromPatient(patientId: string, updates: Partial<Patient>): Promise<User | null> {
    try {
      // Find user by patientId link (more reliable than email which may have changed)
      let user = await UsersService.getByPatientId(patientId);
      
      // Fallback: find by email if no patientId link
      if (!user) {
        const patient = await PatientsService.get(patientId);
        if (!patient) return null;
        user = await UsersService.getByEmail(patient.email);
      }
      
      if (!user) return null; // No user to update

      // Update user with patient changes
      const userUpdates: any = {};
      if (updates.name) userUpdates.firstName = updates.name;
      if (updates.lastName) userUpdates.lastName = updates.lastName;
      if (updates.phone) userUpdates.phone = updates.phone;
      if (updates.address) userUpdates.address = updates.address;
      if (updates.email) userUpdates.email = updates.email;

      if (Object.keys(userUpdates).length > 0) {
        const updatedUser = await UsersService.update(user.id, userUpdates);
        console.log(`[PatientUserSync] Updated user account for patient ${patientId}, email: ${updates.email || 'unchanged'}`);
        return updatedUser;
      }

      return user;
    } catch (error) {
      console.error('[PatientUserSync] Error updating user for patient:', error);
      return null;
    }
  },

  /**
   * Update patient record when user is updated
   */
  async updatePatientFromUser(userId: string, updates: Partial<User>): Promise<Patient | null> {
    try {
      const user = await UsersService.getById(userId);
      if (!user || !user.patientId) return null;

      // Update patient with user changes
      const patientUpdates: any = {};
      if (updates.firstName) patientUpdates.name = updates.firstName;
      if (updates.lastName) patientUpdates.lastName = updates.lastName;
      if (updates.phone) patientUpdates.phone = updates.phone;
      if (updates.address) patientUpdates.address = updates.address;
      if (updates.email) patientUpdates.email = updates.email;

      if (Object.keys(patientUpdates).length > 0) {
        const updatedPatient = await PatientsService.update(user.patientId, patientUpdates);
        console.log(`[PatientUserSync] Updated patient record for user ${userId}, email: ${updates.email || 'unchanged'}`);
        return updatedPatient;
      }

      return await PatientsService.get(user.patientId);
    } catch (error) {
      console.error('[PatientUserSync] Error updating patient for user:', error);
      return null;
    }
  }
};
