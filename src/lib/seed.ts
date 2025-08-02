
// A script to seed the database with some initial data.
// This is useful for development and testing purposes.
// To run this script, use the command: `npm run seed`

import { db } from './firebase';
import { collection, setDoc, doc } from 'firebase/firestore';
import { insuranceProviders } from './data/insurance-providers';

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
    const initialPatientsData = [
        { 
            id: 'pat1', name: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '01234567890', 
            dob: new Date('1985-05-20'), age: 39, lastVisit: '2024-05-10', status: 'Active',
            address: '123 Nile St, Zamalek, Cairo', ecName: 'Jane Doe', ecPhone: '01234567891', ecRelationship: 'Spouse',
            insuranceProvider: 'Misr Insurance', policyNumber: 'MISR123456', medicalHistory: [{condition: 'Pollen Allergy'}]
        },
        { 
            id: 'pat2', name: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '01123456789', 
            dob: new Date('1992-09-15'), age: 31, lastVisit: '2024-04-22', status: 'Active',
            address: '456 Orabi St, Mohandessin, Giza', ecName: 'John Smith', ecPhone: '01123456780', ecRelationship: 'Spouse',
            insuranceProvider: 'Allianz', policyNumber: 'ALZ789012', medicalHistory: []
        },
    ];
    
    const initialAppointmentsData = [
        { id: 'apt1', dateTime: new Date('2024-07-29T10:00:00'), patient: 'John Doe', doctor: 'Dr. Nourhan', type: 'Check-up', duration: '30 minutes', status: 'Confirmed' },
        { id: 'apt2', dateTime: new Date('2024-07-29T11:00:00'), patient: 'Jane Smith', doctor: 'Dr. Khaled', type: 'Cleaning', duration: '1 hour', status: 'Confirmed' },
        { id: 'apt3', dateTime: new Date('2024-07-30T14:00:00'), patient: 'Ahmed Ali', doctor: 'Dr. Mariam', type: 'Filling', duration: '1 hour', status: 'Pending' },
    ];
    
    const initialTreatmentsData = [
        { id: 'trt1', date: '2024-05-10', patient: 'John Doe', procedure: 'Crown Placement', doctor: 'Dr. Nourhan', tooth: '14', cost: 'EGP 2,500', status: 'Completed', followUp: '2024-11-10' },
        { id: 'trt2', date: '2024-04-22', patient: 'Jane Smith', procedure: 'Root Canal', doctor: 'Dr. Khaled', tooth: '25', cost: 'EGP 3,500', status: 'Completed', followUp: '2024-10-22' },
        { id: 'trt3', date: '2024-06-15', patient: 'John Doe', procedure: 'Wisdom Tooth Extraction', doctor: 'Dr. Khaled', tooth: '18', cost: 'EGP 1,800', status: 'In Progress', followUp: '2024-06-22' },
    ];
    
    const initialInvoicesData = [
        { id: 'INV-001', patient: 'John Doe', patientId: 'pat1', issueDate: '2024-05-10', dueDate: '2024-06-09', totalAmount: 2500, amountPaid: 2500, status: 'Paid', items: [{id: '1', description: 'Crown Placement', quantity: 1, unitPrice: 2500}] },
        { id: 'INV-002', patient: 'Jane Smith', patientId: 'pat2', issueDate: '2024-04-22', dueDate: '2024-05-22', totalAmount: 3500, amountPaid: 2000, status: 'Partially Paid', items: [{id: '1', description: 'Root Canal Therapy', quantity: 1, unitPrice: 3500}] },
        { id: 'INV-003', patient: 'John Doe', patientId: 'pat1', issueDate: '2024-06-15', dueDate: '2024-07-15', totalAmount: 1800, amountPaid: 0, status: 'Unpaid', items: [{id: '1', description: 'Wisdom Tooth Extraction', quantity: 1, unitPrice: 1800}] },
    ];
    
    const initialInventoryItemsData = [
        { id: 'inv1', name: 'Dental Composite', expires: '2025-12-31', category: 'Restorative', stock: 17, min: 20, max: 100, status: 'Low Stock', unitCost: 'EGP 500', supplier: 'Nile Medical' },
        { id: 'inv2', name: 'Anesthetic Cartridges', expires: '2026-06-30', category: 'Anesthetics', stock: 15, min: 50, max: 200, status: 'Low Stock', unitCost: 'EGP 15', supplier: 'PharmaPlus' },
        { id: 'inv3', name: 'Digital X-Ray Films', expires: '2025-08-15', category: 'Radiology', stock: 25, min: 30, max: 150, status: 'Low Stock', unitCost: 'EGP 60', supplier: 'DentalTech Solutions' },
        { id: 'inv4', name: 'Dental Impression Material', expires: '2025-10-20', category: 'Restorative', stock: 45, min: 15, max: 80, status: 'Normal', unitCost: 'EGP 120', supplier: 'Nile Medical' },
        { id: 'inv5', name: 'Surgical Gloves', expires: '2026-02-28', category: 'Protective Equipment', stock: 8, min: 25, max: 100, status: 'Low Stock', unitCost: 'EGP 2.5', supplier: 'Cairo Dental Distributors' },
    ];
    
    const initialStaffData = [
        { id: 'staff1', name: 'Dr. Nourhan', role: 'Dentist', email: 'dr.nourhan@cairodental.com', phone: '01012345678', schedule: 'Sun-Thu, 9am-5pm', salary: 'EGP 960,000', hireDate: '2020-01-15', status: 'Active' },
        { id: 'staff2', name: 'Dr. Khaled', role: 'Dentist', email: 'dr.khaled@cairodental.com', phone: '01123456789', schedule: 'Mon-Fri, 10am-6pm', salary: 'EGP 900,000', hireDate: '2021-03-20', status: 'Active' },
    ];
    
    const initialMedicalRecordsData = [
        { id: 'rec1', patient: 'John Doe', type: 'SOAP', complaint: 'Toothache', provider: 'Dr. Nourhan', date: '2024-05-10', status: 'Final' },
        { id: 'rec2', patient: 'Jane Smith', type: 'Clinical Note', complaint: 'Sensitivity', provider: 'Dr. Khaled', date: '2024-04-22', status: 'Final' },
    ];
    
    const initialClinicalImagesData = [
        { id: 'img1', patient: 'John Doe', type: 'X-Ray', date: '2024-05-10', imageUrl: 'https://placehold.co/600x400.png', caption: 'X-Ray of tooth #14' },
        { id: 'img2', patient: 'Jane Smith', type: 'Intraoral Photo', date: '2024-04-22', imageUrl: 'https://placehold.co/600x400.png', caption: 'Photo of tooth #25' },
    ];
    
    const initialInsuranceClaimsData = [
        { id: 'clm1', patient: 'John Doe', patientId: 'pat1', insurance: 'Misr Insurance', procedure: 'Crown Placement', procedureCode: 'D2740', amount: 'EGP 2500', approvedAmount: 'EGP 2000', status: 'Approved', submitDate: '2024-05-11' },
        { id: 'clm2', patient: 'Jane Smith', patientId: 'pat2', insurance: 'Allianz', procedure: 'Root Canal', procedureCode: 'D3330', amount: 'EGP 3500', approvedAmount: null, status: 'Processing', submitDate: '2024-04-23' },
        { id: 'clm3', patient: 'John Doe', patientId: 'pat1', insurance: 'Misr Insurance', procedure: 'Wisdom Tooth Extraction', procedureCode: 'D7210', amount: 'EGP 1800', approvedAmount: null, status: 'Denied', statusReason: 'Not covered', submitDate: '2024-06-16' },
    ];

    const initialOutgoingReferralsData = [
        { id: 'ref1', patient: 'John Doe', specialist: 'Dr. Ahmed Mahmoud', specialty: 'Oral Surgery', reason: 'Impacted wisdom tooth evaluation', urgency: 'routine', status: 'completed', date: '2024-06-01', apptDate: '2024-06-15' },
        { id: 'ref2', patient: 'Jane Smith', specialist: 'Dr. Fatima Zahra', specialty: 'Periodontics', reason: 'Advanced gum disease treatment', urgency: 'urgent', status: 'scheduled', date: '2024-07-20', apptDate: '2024-08-05' },
    ];
    
    const initialSpecialistNetwork = [
        { id: 'spec1', name: 'Dr. Ahmed Mahmoud', specialty: 'Oral Surgery', phone: '01298765432', email: 'ahmed.mahmoud@oralsurgery.com', clinicName: 'Cairo Oral Surgeons' },
        { id: 'spec2', name: 'Dr. Fatima Zahra', specialty: 'Periodontics', phone: '01198765432', email: 'fatima.zahra@perio.com', clinicName: 'Giza Perio Clinic' },
    ];
    
    const initialPurchaseOrdersData = [
        { id: 'po1', supplier: 'Nile Medical', orderDate: '2024-07-15', deliveryDate: '2024-07-22', total: 'EGP 15,000', status: 'Delivered', items: [{ itemId: 'inv1', description: 'Dental Composite', quantity: 30, unitPrice: 500 }] },
        { id: 'po2', supplier: 'PharmaPlus', orderDate: '2024-07-18', deliveryDate: '2024-07-25', total: 'EGP 3,000', status: 'Shipped', items: [{ itemId: 'inv2', description: 'Anesthetic Cartridges', quantity: 200, unitPrice: 15 }] },
        { id: 'po3', supplier: 'Nile Medical', orderDate: '2024-07-20', deliveryDate: '2024-07-28', total: 'EGP 8,500', status: 'Pending', items: [{ itemId: 'inv1', description: 'Dental Composite', quantity: 17, unitPrice: 500 }] },
        { id: 'po4', supplier: 'PharmaPlus', orderDate: '2024-07-22', deliveryDate: '2024-07-30', total: 'EGP 2,250', status: 'Pending', items: [{ itemId: 'med2', description: 'Ibuprofen 400mg', quantity: 150, unitPrice: 15 }] },
        { id: 'po5', supplier: 'DentalTech Solutions', orderDate: '2024-07-19', deliveryDate: '2024-07-26', total: 'EGP 12,000', status: 'Shipped', items: [{ itemId: 'inv3', description: 'Digital X-Ray Films', quantity: 200, unitPrice: 60 }] },
    ];
    
    const initialSuppliersData = [
        { id: 'sup1', name: 'Nile Medical', address: '123 Corniche, Cairo', phone: '0225550101', email: 'sales@nilemedical.com', category: 'Dental Supplies', paymentTerms: 'Net 30', rating: 4.8, status: 'active' },
        { id: 'sup2', name: 'PharmaPlus', address: '45 Industrial Zone, Giza', phone: '0238880202', email: 'contact@pharmaplus.com', category: 'Medications', paymentTerms: 'Net 60', rating: 4.5, status: 'active' },
        { id: 'sup3', name: 'DentalTech Solutions', address: '78 Zamalek District, Cairo', phone: '0227770303', email: 'orders@dentaltech.com', category: 'Equipment & Technology', paymentTerms: 'Net 45', rating: 4.9, status: 'active' },
        { id: 'sup4', name: 'Cairo Dental Distributors', address: '92 Heliopolis, Cairo', phone: '0224440404', email: 'supply@cairodental.com', category: 'Dental Supplies', paymentTerms: 'Net 30', rating: 4.2, status: 'active' },
    ];
    
    const initialMedicationInventoryData = [
        { id: 'med1', name: 'Amoxicillin', fullName: 'Amoxicillin 500mg', strength: '500mg', form: 'Capsule', category: 'Antibiotics', stock: 100, unitPrice: 'EGP 25.00', expiryDate: '2025-12-31', status: 'In Stock' },
        { id: 'med2', name: 'Ibuprofen', fullName: 'Ibuprofen 400mg', strength: '400mg', form: 'Tablet', category: 'Pain Relief', stock: 15, unitPrice: 'EGP 15.00', expiryDate: '2026-06-30', status: 'Low Stock' },
        { id: 'med3', name: 'Lidocaine', fullName: 'Lidocaine 2% Injection', strength: '2%', form: 'Injection', category: 'Anesthetics', stock: 8, unitPrice: 'EGP 45.00', expiryDate: '2025-09-15', status: 'Low Stock' },
        { id: 'med4', name: 'Chlorhexidine', fullName: 'Chlorhexidine Mouthwash', strength: '0.12%', form: 'Solution', category: 'Antiseptics', stock: 25, unitPrice: 'EGP 35.00', expiryDate: '2026-03-20', status: 'In Stock' },
        { id: 'med5', name: 'Acetaminophen', fullName: 'Acetaminophen 500mg', strength: '500mg', form: 'Tablet', category: 'Pain Relief', stock: 5, unitPrice: 'EGP 12.00', expiryDate: '2025-11-10', status: 'Out of Stock' },
    ];
    
    const initialPrescriptionRecordsData = [
        { id: 'rx1', patient: 'John Doe', medication: 'Amoxicillin', strength: '500mg', dosage: '1 capsule 3 times daily', duration: '7 days', refills: 0, doctor: 'Dr. Nourhan', date: '2024-06-15', status: 'Completed' },
        { id: 'rx2', patient: 'Jane Smith', medication: 'Ibuprofen', strength: '400mg', dosage: '1 tablet as needed for pain', duration: 'N/A', refills: 2, doctor: 'Dr. Khaled', date: '2024-04-22', status: 'Active' },
    ];
    
    const initialRecentMessagesData = [
        { id: 'msg1', patient: 'John Doe', type: 'Email', content: 'Appointment Reminder', subContent: 'This is a reminder for your appointment on 2024-07-29.', status: 'Sent', sent: '2024-07-28 10:00 AM', category: 'appointment', priority: 'normal', date: '2024-07-28', subject: 'Appointment Reminder', snippet: 'Your appointment is tomorrow...', fullMessage: 'Dear John, This is a friendly reminder for your appointment with Dr. Nourhan tomorrow at 10:00 AM. We look forward to seeing you.' },
        { id: 'msg2', patient: 'Jane Smith', type: 'SMS', content: 'Billing Inquiry', subContent: 'Patient asked about the remaining balance on INV-002.', status: 'Unread', sent: '2024-07-27 03:30 PM', category: 'billing', priority: 'high', date: '2024-07-27', subject: 'Billing Inquiry', snippet: 'What is my remaining balance?', fullMessage: 'Hello, I was wondering what the remaining balance is on my invoice INV-002. Can you please let me know? Thanks, Jane.' },
    ];
    
    const initialPortalUsersData = [
        { id: 'user1', name: 'John Doe', email: 'john.doe@example.com', status: 'Active', lastLogin: '2024-07-25' },
        { id: 'user2', name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Active', lastLogin: '2024-07-26' },
    ];
    
    const initialSharedDocumentsData = [
        { id: 'doc1', name: 'Treatment Plan - Crown', patient: 'John Doe', type: 'Treatment Plan', sharedDate: '2024-05-10' },
        { id: 'doc2', name: 'Invoice INV-002', patient: 'Jane Smith', type: 'Invoice', sharedDate: '2024-04-22' },
    ];

    const initialClinicSettingsData = [
      { 
        id: 'main', 
        clinicName: 'Cairo Dental Clinic',
        phoneNumber: '0225551234',
        email: 'info@cairodental.com',
        website: 'www.cairodental.com',
        address: '123 Tahrir Street, Downtown, Cairo, Egypt',
        businessHours: 'mon-fri-8-6',
        timezone: 'eastern',
        appointmentDuration: '60',
        bookingLimit: '90',
        allowOnlineBooking: true
      }
    ];

  console.log('Starting database seed...');

  await seedCollection('patients', initialPatientsData.map(p => ({...p, dob: p.dob.toISOString() })));
  await seedCollection('appointments', initialAppointmentsData.map(a => ({...a, dateTime: a.dateTime.toISOString() })));
  await seedCollection('treatments', initialTreatmentsData);
  await seedCollection('invoices', initialInvoicesData);
  await seedCollection('inventory', initialInventoryItemsData);
  await seedCollection('staff', initialStaffData);
  await seedCollection('medical-records', initialMedicalRecordsData);
  await seedCollection('clinical-images', initialClinicalImagesData);
  await seedCollection('insurance-claims', initialInsuranceClaimsData);
  await seedCollection('insurance-providers', insuranceProviders);
  await seedCollection('referrals', initialOutgoingReferralsData);
  await seedCollection('specialists', initialSpecialistNetwork);
  await seedCollection('purchase-orders', initialPurchaseOrdersData);
  await seedCollection('suppliers', initialSuppliersData);
  await seedCollection('medications', initialMedicationInventoryData);
  await seedCollection('prescriptions', initialPrescriptionRecordsData);
  await seedCollection('messages', initialRecentMessagesData);
  await seedCollection('portal-users', initialPortalUsersData);
  await seedCollection('shared-documents', initialSharedDocumentsData);
  await seedCollection('clinic-settings', initialClinicSettingsData);

  console.log('Database seeding completed successfully!');
}

seedDatabase().catch(console.error);
