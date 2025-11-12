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
import type { User, Patient } from '@/lib/types';

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
      // Check if user already exists
      const existingUser = await UsersService.getByEmail(patient.email);
      
      if (existingUser) {
        // Update patient with userId
        await PatientsService.update(patient.id, {});
        return existingUser;
      }

      // Create new user account
      const userData = {
        email: patient.email,
        password: password,
        firstName: patient.name,
        lastName: patient.lastName,
        role: 'patient' as const,
        phone: patient.phone,
        address: patient.address,
        permissions: ['view_own_data'], // Default patient permissions
      };

      const newUser = await UsersService.create(userData);

      // Update patient with userId (store in patientId field in User table)
      await UsersService.update(newUser.id, { patientId: patient.id });

      return newUser;
    } catch (error) {
      console.error('[PatientUserSync] Error creating user from patient:', error);
      return null;
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
   * Get user account for a patient
   */
  async getUserForPatient(patientId: string): Promise<User | null> {
    try {
      const patient = await PatientsService.get(patientId);
      if (!patient) return null;

      return UsersService.getByEmail(patient.email);
    } catch (error) {
      console.error('[PatientUserSync] Error getting user for patient:', error);
      return null;
    }
  }
};
