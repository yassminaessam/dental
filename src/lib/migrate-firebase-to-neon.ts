/**
 * Firebase to Neon Migration Utility
 * 
 * This script helps migrate data from Firebase Firestore to Neon PostgreSQL
 * Run this after setting up your Neon database and before switching the application
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Firebase config (your existing Firebase configuration)
const firebaseConfig = {
  apiKey: "AIzaSyAyhz89y2Y9ucaB2xi5xFAcALhkMH-HBIY",
  authDomain: "dental-a627d.firebaseapp.com",
  projectId: "dental-a627d",
  storageBucket: "dental-a627d.firebasestorage.app",
  messagingSenderId: "61708021549",
  appId: "1:61708021549:web:682cd642b856c0f35f2da4",
  measurementId: "G-KZZD0JR71E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, 'migration');
const firestore = getFirestore(app);

interface MigrationStats {
  collections: string[];
  totalDocuments: number;
  migratedDocuments: number;
  errors: string[];
}

class FirebaseToNeonMigrator {
  private stats: MigrationStats = {
    collections: [],
    totalDocuments: 0,
    migratedDocuments: 0,
    errors: []
  };

  /**
   * Main migration function
   */
  async migrate(): Promise<MigrationStats> {
    console.log('🚀 Starting Firebase to Neon migration...');
    
    try {
      // Migrate collections in order (due to foreign key constraints)
      await this.migrateUsers();
      await this.migratePatients();
      await this.migrateAppointments();
      await this.migrateTreatments();
      await this.migrateInvoices();
      await this.migrateStaff();
      await this.migrateInventory();
      await this.migrateMedicalRecords();
      await this.migrateClinicalImages();
      await this.migrateToothImageLinks();
      await this.migrateInsuranceClaims();
      await this.migrateInsuranceProviders();
      await this.migratePurchaseOrders();
      await this.migrateSuppliers();
      await this.migrateMedications();
      await this.migratePrescriptions();
      await this.migrateMessages();
      await this.migrateReferrals();
      await this.migrateSpecialists();
      await this.migratePortalUsers();
      await this.migrateSharedDocuments();
      await this.migrateTransactions();
      await this.migrateClinicSettings();

      console.log('✅ Migration completed successfully!');
      console.log(`📊 Total documents migrated: ${this.stats.migratedDocuments}/${this.stats.totalDocuments}`);
      
      if (this.stats.errors.length > 0) {
        console.log('⚠️ Errors encountered:');
        this.stats.errors.forEach(error => console.log(`  - ${error}`));
      }

    } catch (error) {
      console.error('❌ Migration failed:', error);
      this.stats.errors.push(`Migration failed: ${error}`);
    }

    return this.stats;
  }

  /**
   * Generic function to migrate a Firebase collection to Prisma model
   */
  private async migrateCollection(
    collectionName: string,
    transform: (doc: any) => any,
    prismaModel: any
  ): Promise<void> {
    try {
      console.log(`📂 Migrating ${collectionName}...`);
      
      const querySnapshot = await getDocs(collection(firestore, collectionName));
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      this.stats.collections.push(collectionName);
      this.stats.totalDocuments += documents.length;

      for (const doc of documents) {
        try {
          const transformedDoc = await transform(doc);
          if (transformedDoc) {
            await prismaModel.upsert({
              where: { id: doc.id },
              create: transformedDoc,
              update: transformedDoc
            });
            this.stats.migratedDocuments++;
          }
        } catch (error) {
          const errorMsg = `Error migrating ${collectionName} document ${doc.id}: ${error}`;
          console.error(`  ❌ ${errorMsg}`);
          this.stats.errors.push(errorMsg);
        }
      }
      
      console.log(`  ✅ Migrated ${documents.length} ${collectionName} documents`);
    } catch (error) {
      const errorMsg = `Error migrating ${collectionName} collection: ${error}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
    }
  }

  /**
   * Migrate users collection
   */
  private async migrateUsers(): Promise<void> {
    await this.migrateCollection('users', async (doc) => {
      // Generate a default hashed password for migrated users
      const hashedPassword = await bcrypt.hash('TempPassword123!', 12);
      
      return {
        id: doc.id,
        email: doc.email?.toLowerCase() || '',
        firstName: doc.firstName || '',
        lastName: doc.lastName || '',
        role: doc.role || 'patient',
        permissions: Array.isArray(doc.permissions) ? doc.permissions : [],
        hashedPassword,
        isActive: doc.isActive !== false,
        createdAt: doc.createdAt?.toDate() || new Date(),
        updatedAt: doc.updatedAt?.toDate() || new Date(),
        lastLoginAt: doc.lastLogin?.toDate() || null,
        specialization: doc.specialization || null,
        licenseNumber: doc.licenseNumber || null,
        employeeId: doc.employeeId || null,
        department: doc.department || null,
        patientId: doc.patientId || null,
        phone: doc.phone || null,
        address: doc.address || null,
        profileImageUrl: doc.profileImageUrl || null
      };
    }, prisma.user);
  }

  /**
   * Migrate patients collection
   */
  private async migratePatients(): Promise<void> {
    await this.migrateCollection('patients', (doc) => ({
      id: doc.id,
      firstName: doc.firstName || '',
      lastName: doc.lastName || '',
      email: doc.email || null,
      phone: doc.phone || null,
      address: doc.address || null,
      dateOfBirth: doc.dob ? new Date(doc.dob) : null,
      gender: doc.gender || null,
      emergencyContact: doc.emergencyContact || null,
      emergencyPhone: doc.emergencyPhone || null,
      insuranceProvider: doc.insuranceProvider || null,
      insuranceNumber: doc.insuranceNumber || null,
      allergies: doc.allergies || null,
      medicalHistory: doc.medicalHistory || null,
      currentMedications: doc.currentMedications || null,
      createdAt: doc.createdAt?.toDate() || new Date(),
      updatedAt: doc.updatedAt?.toDate() || new Date()
    }), prisma.patient);
  }

  /**
   * Migrate appointments collection
   */
  private async migrateAppointments(): Promise<void> {
    await this.migrateCollection('appointments', (doc) => ({
      id: doc.id,
      patientId: doc.patientId || doc.patient || '',
      doctorId: doc.doctorId || doc.doctor || '',
      dateTime: doc.dateTime ? new Date(doc.dateTime) : new Date(),
      duration: parseInt(doc.duration) || 60,
      type: doc.type || 'Consultation',
      status: doc.status || 'scheduled',
      notes: doc.notes || null,
      treatmentPlan: doc.treatmentPlan || null,
      followUpRequired: doc.followUpRequired || false,
      createdAt: doc.createdAt?.toDate() || new Date(),
      updatedAt: doc.updatedAt?.toDate() || new Date()
    }), prisma.appointment);
  }

  /**
   * Migrate treatments collection
   */
  private async migrateTreatments(): Promise<void> {
    await this.migrateCollection('treatments', (doc) => ({
      id: doc.id,
      patientId: doc.patientId || doc.patient || '',
      doctorId: doc.doctorId || doc.doctor || '',
      appointmentId: doc.appointmentId || null,
      date: doc.date ? new Date(doc.date) : new Date(),
      procedure: doc.procedure || doc.treatment || '',
      tooth: doc.tooth || null,
      status: doc.status || 'planned',
      notes: doc.notes || null,
      cost: doc.cost ? parseFloat(doc.cost) : null,
      duration: doc.duration ? parseInt(doc.duration) : null,
      materialUsed: doc.materialUsed || null,
      followUpDate: doc.followUpDate ? new Date(doc.followUpDate) : null,
      createdAt: doc.createdAt?.toDate() || new Date(),
      updatedAt: doc.updatedAt?.toDate() || new Date()
    }), prisma.treatment);
  }

  /**
   * Migrate invoices collection
   */
  private async migrateInvoices(): Promise<void> {
    await this.migrateCollection('invoices', (doc) => ({
      id: doc.id,
      patientId: doc.patientId || doc.patient || '',
      treatmentId: doc.treatmentId || null,
      number: doc.number || `INV-${doc.id}`,
      date: doc.date ? new Date(doc.date) : new Date(),
      dueDate: doc.dueDate ? new Date(doc.dueDate) : null,
      amount: parseFloat(doc.amount) || 0,
      paid: parseFloat(doc.paid) || 0,
      status: doc.status || 'pending',
      items: doc.items || [],
      notes: doc.notes || null,
      createdAt: doc.createdAt?.toDate() || new Date(),
      updatedAt: doc.updatedAt?.toDate() || new Date()
    }), prisma.invoice);
  }

  // Add methods for other collections...
  private async migrateStaff(): Promise<void> {
    // Implementation for staff migration
    await this.migrateCollection('staff', (doc) => ({
      id: doc.id,
      employeeId: doc.employeeId || doc.id,
      firstName: doc.firstName || '',
      lastName: doc.lastName || '',
      email: doc.email || '',
      phone: doc.phone || null,
      role: doc.role || '',
      department: doc.department || null,
      specialization: doc.specialization || null,
      licenseNumber: doc.licenseNumber || null,
      hireDate: doc.hireDate ? new Date(doc.hireDate) : new Date(),
      salary: doc.salary ? parseFloat(doc.salary) : null,
      isActive: doc.isActive !== false,
      address: doc.address || null,
      emergencyContact: doc.emergencyContact || null,
      emergencyPhone: doc.emergencyPhone || null,
      notes: doc.notes || null,
      createdAt: doc.createdAt?.toDate() || new Date(),
      updatedAt: doc.updatedAt?.toDate() || new Date()
    }), prisma.staff);
  }

  private async migrateInventory(): Promise<void> {
    await this.migrateCollection('inventory', (doc) => ({
      id: doc.id,
      name: doc.name || '',
      sku: doc.sku || doc.id,
      category: doc.category || '',
      supplier: doc.supplier || null,
      quantity: parseInt(doc.quantity) || 0,
      minQuantity: parseInt(doc.minQuantity) || 0,
      maxQuantity: doc.maxQuantity ? parseInt(doc.maxQuantity) : null,
      unit: doc.unit || 'pcs',
      costPrice: doc.costPrice ? parseFloat(doc.costPrice) : null,
      salePrice: doc.salePrice ? parseFloat(doc.salePrice) : null,
      status: doc.status || 'active',
      location: doc.location || null,
      expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
      notes: doc.notes || null,
      createdAt: doc.createdAt?.toDate() || new Date(),
      updatedAt: doc.updatedAt?.toDate() || new Date()
    }), prisma.inventoryItem);
  }

  // Stub methods for other collections - implement as needed
  private async migrateMedicalRecords(): Promise<void> {
    console.log('📂 Skipping medical-records (implement if needed)...');
  }

  private async migrateClinicalImages(): Promise<void> {
    console.log('📂 Skipping clinical-images (implement if needed)...');
  }

  private async migrateToothImageLinks(): Promise<void> {
    console.log('📂 Skipping tooth-image-links (implement if needed)...');
  }

  private async migrateInsuranceClaims(): Promise<void> {
    console.log('📂 Skipping insurance-claims (implement if needed)...');
  }

  private async migrateInsuranceProviders(): Promise<void> {
    console.log('📂 Skipping insurance-providers (implement if needed)...');
  }

  private async migratePurchaseOrders(): Promise<void> {
    console.log('📂 Skipping purchase-orders (implement if needed)...');
  }

  private async migrateSuppliers(): Promise<void> {
    console.log('📂 Skipping suppliers (implement if needed)...');
  }

  private async migrateMedications(): Promise<void> {
    console.log('📂 Skipping medications (implement if needed)...');
  }

  private async migratePrescriptions(): Promise<void> {
    console.log('📂 Skipping prescriptions (implement if needed)...');
  }

  private async migrateMessages(): Promise<void> {
    console.log('📂 Skipping messages (implement if needed)...');
  }

  private async migrateReferrals(): Promise<void> {
    console.log('📂 Skipping referrals (implement if needed)...');
  }

  private async migrateSpecialists(): Promise<void> {
    console.log('📂 Skipping specialists (implement if needed)...');
  }

  private async migratePortalUsers(): Promise<void> {
    console.log('📂 Skipping portal-users (implement if needed)...');
  }

  private async migrateSharedDocuments(): Promise<void> {
    console.log('📂 Skipping shared-documents (implement if needed)...');
  }

  private async migrateTransactions(): Promise<void> {
    console.log('📂 Skipping transactions (implement if needed)...');
  }

  private async migrateClinicSettings(): Promise<void> {
    await this.migrateCollection('clinic-settings', (doc) => ({
      id: doc.id,
      clinicName: doc.clinicName || 'Dental Clinic',
      address: doc.address || null,
      phone: doc.phone || null,
      email: doc.email || null,
      website: doc.website || null,
      logo: doc.logo || null,
      businessHours: doc.businessHours || null,
      timezone: doc.timezone || null,
      appointmentDuration: doc.appointmentDuration ? parseInt(doc.appointmentDuration) : 60,
      bookingLimit: doc.bookingLimit ? parseInt(doc.bookingLimit) : 90,
      allowOnlineBooking: doc.allowOnlineBooking !== false,
      currency: doc.currency || 'USD',
      language: doc.language || 'en',
      theme: doc.theme || 'light',
      createdAt: doc.createdAt?.toDate() || new Date(),
      updatedAt: doc.updatedAt?.toDate() || new Date()
    }), prisma.clinicSettings);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const migrator = new FirebaseToNeonMigrator();
  migrator.migrate()
    .then((stats) => {
      console.log('\n📊 Migration Statistics:');
      console.log(`Collections: ${stats.collections.join(', ')}`);
      console.log(`Total documents: ${stats.totalDocuments}`);
      console.log(`Migrated documents: ${stats.migratedDocuments}`);
      console.log(`Errors: ${stats.errors.length}`);
      
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { FirebaseToNeonMigrator };