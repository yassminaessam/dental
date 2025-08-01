// A script to seed the database with some initial data.
// This is useful for development and testing purposes.
// To run this script, use the command: `npm run seed`

import { db } from './firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import {
  initialPatientsData,
  initialAppointmentsData,
  initialTreatmentsData,
  initialInvoicesData,
  initialInventoryItemsData,
  initialStaffData,
  initialMedicalRecordsData,
  initialClinicalImagesData,
  initialInsuranceClaimsData,
  initialOutgoingReferralsData,
  initialSpecialistNetwork,
  initialPurchaseOrdersData,
  initialSuppliersData,
  initialMedicationInventoryData,
  initialPrescriptionRecordsData,
  initialRecentMessagesData,
  initialPortalUsersData,
  initialSharedDocumentsData
} from './data';

async function seedCollection(collectionName: string, data: any[]) {
  console.log(`Seeding ${collectionName}...`);
  for (const item of data) {
    try {
      // Use the existing 'id' field for the document ID in Firestore
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, item);
      console.log(`Added ${collectionName} with ID: ${item.id}`);
    } catch (e) {
      console.error(`Error adding document to ${collectionName}: `, e);
    }
  }
  console.log(`${collectionName} seeding finished.`);
}

async function seedDatabase() {
  console.log('Starting database seed...');

  await seedCollection('patients', initialPatientsData);
  await seedCollection('appointments', initialAppointmentsData.map(a => ({...a, dateTime: a.dateTime.toISOString() })));
  await seedCollection('treatments', initialTreatmentsData);
  await seedCollection('invoices', initialInvoicesData);
  await seedCollection('inventory', initialInventoryItemsData);
  await seedCollection('staff', initialStaffData);
  await seedCollection('medical-records', initialMedicalRecordsData);
  await seedCollection('clinical-images', initialClinicalImagesData);
  await seedCollection('insurance-claims', initialInsuranceClaimsData);
  await seedCollection('referrals', initialOutgoingReferralsData);
  await seedCollection('specialists', initialSpecialistNetwork);
  await seedCollection('purchase-orders', initialPurchaseOrdersData);
  await seedCollection('suppliers', initialSuppliersData);
  await seedCollection('medications', initialMedicationInventoryData);
  await seedCollection('prescriptions', initialPrescriptionRecordsData);
  await seedCollection('messages', initialRecentMessagesData);
  await seedCollection('portal-users', initialPortalUsersData);
  await seedCollection('shared-documents', initialSharedDocumentsData);

  console.log('Database seeding completed successfully!');
}

seedDatabase().catch(console.error);
