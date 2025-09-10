import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Define enum values as string literals
const UserRole = {
  admin: 'admin' as const,
  doctor: 'doctor' as const,
  receptionist: 'receptionist' as const,
  patient: 'patient' as const
};

const AppointmentStatus = {
  Scheduled: 'Scheduled' as const,
  Confirmed: 'Confirmed' as const,
  InProgress: 'InProgress' as const,
  Completed: 'Completed' as const,
  Cancelled: 'Cancelled' as const,
  NoShow: 'NoShow' as const
};

const TreatmentStatus = {
  Planned: 'Planned' as const,
  InProgress: 'InProgress' as const,
  Completed: 'Completed' as const,
  Cancelled: 'Cancelled' as const
};

const InvoiceStatus = {
  Draft: 'Draft' as const,
  Sent: 'Sent' as const,
  Paid: 'Paid' as const,
  Overdue: 'Overdue' as const,
  Cancelled: 'Cancelled' as const
};

// Sample data for seeding
const sampleUsers = [
  {
    id: 'admin-1',
    email: 'admin@cairodental.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: UserRole.admin,
    permissions: ['view_patients', 'edit_patients', 'delete_patients', 'view_appointments', 'edit_appointments', 'delete_appointments', 'view_treatments', 'edit_treatments', 'delete_treatments', 'view_billing', 'edit_billing', 'delete_billing', 'view_reports', 'edit_reports', 'view_staff', 'edit_staff', 'delete_staff', 'view_inventory', 'edit_inventory', 'view_settings', 'edit_settings', 'view_medical_records', 'edit_medical_records', 'view_dental_chart', 'edit_dental_chart', 'view_communications', 'send_communications', 'view_insurance', 'edit_insurance', 'view_analytics', 'view_patient_portal', 'edit_patient_portal'],
    phone: '+201000000000',
    isActive: true
  },
  {
    id: 'doctor-1',
    email: 'dr.ahmed@cairodental.com',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    role: UserRole.doctor,
    permissions: ['view_patients', 'edit_patients', 'view_appointments', 'edit_appointments', 'view_treatments', 'edit_treatments', 'view_billing', 'view_medical_records', 'edit_medical_records', 'view_dental_chart', 'edit_dental_chart', 'view_communications', 'send_communications', 'view_insurance', 'view_analytics'],
    specialization: 'General Dentistry',
    licenseNumber: 'DDS-2018-001',
    phone: '+201111111111',
    isActive: true
  },
  {
    id: 'receptionist-1',
    email: 'reception@cairodental.com',
    firstName: 'Fatima',
    lastName: 'Ali',
    role: UserRole.receptionist,
    permissions: ['view_patients', 'edit_patients', 'view_appointments', 'edit_appointments', 'view_billing', 'edit_billing', 'view_communications', 'send_communications', 'view_insurance', 'edit_insurance', 'view_inventory'],
    employeeId: 'REC-001',
    department: 'Front Office',
    phone: '+201222222222',
    isActive: true
  }
];

const samplePatients = [
  {
    id: 'patient-1',
    firstName: 'Omar',
    lastName: 'Mohamed',
    email: 'omar.mohamed@email.com',
    phone: '+201333333333',
    dateOfBirth: new Date('1985-05-15'),
    gender: 'Male',
    address: '123 Tahrir Square, Cairo',
    emergencyContact: 'Mona Mohamed',
    emergencyPhone: '+201444444444',
    insuranceProvider: 'Egyptian Health Insurance',
    insuranceNumber: 'EHI-123456789',
    allergies: 'Penicillin',
    medicalHistory: 'Hypertension, controlled with medication'
  },
  {
    id: 'patient-2',
    firstName: 'Nour',
    lastName: 'Hassan',
    email: 'nour.hassan@email.com',
    phone: '+201555555555',
    dateOfBirth: new Date('1990-12-08'),
    gender: 'Female',
    address: '456 Zamalek, Cairo',
    emergencyContact: 'Ahmed Hassan',
    emergencyPhone: '+201666666666',
    insuranceProvider: 'Cairo Insurance',
    insuranceNumber: 'CI-987654321',
    allergies: 'None',
    medicalHistory: 'No significant medical history'
  }
];

const sampleAppointments = [
  {
    id: 'appointment-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    dateTime: new Date('2025-09-15T10:00:00Z'),
    duration: 60,
    type: 'Regular Checkup',
    status: AppointmentStatus.Scheduled,
    notes: 'Routine dental examination and cleaning'
  },
  {
    id: 'appointment-2',
    patientId: 'patient-2',
    doctorId: 'doctor-1',
    dateTime: new Date('2025-09-16T14:30:00Z'),
    duration: 90,
    type: 'Root Canal',
    status: AppointmentStatus.Confirmed,
    notes: 'Root canal treatment for tooth #14'
  }
];

const sampleTreatments = [
  {
    id: 'treatment-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    appointmentId: 'appointment-1',
    date: new Date('2025-09-15T10:00:00Z'),
    procedure: 'Dental Cleaning',
    status: TreatmentStatus.Completed,
    cost: 150.00,
    duration: 60,
    notes: 'Routine prophylaxis completed successfully'
  },
  {
    id: 'treatment-2',
    patientId: 'patient-2',
    doctorId: 'doctor-1',
    appointmentId: 'appointment-2',
    date: new Date('2025-09-16T14:30:00Z'),
    procedure: 'Root Canal Treatment',
    tooth: '#14',
    status: TreatmentStatus.InProgress,
    cost: 800.00,
    duration: 90,
    notes: 'First session of root canal treatment'
  }
];

const sampleInvoices = [
  {
    id: 'invoice-1',
    patientId: 'patient-1',
    treatmentId: 'treatment-1',
    number: 'INV-2025-001',
    date: new Date('2025-09-15'),
    dueDate: new Date('2025-10-15'),
    amount: 150.00,
    status: InvoiceStatus.Sent,
    items: [
      {
        description: 'Dental Cleaning',
        quantity: 1,
        unitPrice: 150.00,
        total: 150.00
      }
    ]
  }
];

const sampleClinicSettings = [
  {
    id: 'clinic-settings-1',
    clinicName: 'Cairo Dental Clinic',
    address: '789 Medical District, Cairo, Egypt',
    phone: '+20-2-123-4567',
    email: 'info@cairodental.com',
    website: 'https://cairodental.com',
    businessHours: 'Mon-Fri 8:00-18:00, Sat 9:00-14:00',
    timezone: 'Africa/Cairo',
    appointmentDuration: 60,
    bookingLimit: 90,
    allowOnlineBooking: true,
    currency: 'EGP',
    language: 'ar'
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - be careful in production!)
    console.log('🧹 Clearing existing data...');
    await prisma.invoice.deleteMany();
    await prisma.treatment.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();
    await prisma.clinicSettings.deleteMany();

    // Seed Users
    console.log('👥 Seeding users...');
    for (const user of sampleUsers) {
      // Hash default password for demo (use a secure password in production)
      const hashedPassword = await bcrypt.hash('Password123!', 12);
      
      await prisma.user.create({
        data: {
          ...user,
          hashedPassword
        } as any
      });
    }
    console.log(`✅ Created ${sampleUsers.length} users`);

    // Seed Patients
    console.log('🏥 Seeding patients...');
    for (const patient of samplePatients) {
      await prisma.patient.create({
        data: patient
      });
    }
    console.log(`✅ Created ${samplePatients.length} patients`);

    // Seed Appointments
    console.log('📅 Seeding appointments...');
    for (const appointment of sampleAppointments) {
      await prisma.appointment.create({
        data: appointment as any
      });
    }
    console.log(`✅ Created ${sampleAppointments.length} appointments`);

    // Seed Treatments
    console.log('🦷 Seeding treatments...');
    for (const treatment of sampleTreatments) {
      await prisma.treatment.create({
        data: treatment as any
      });
    }
    console.log(`✅ Created ${sampleTreatments.length} treatments`);

    // Seed Invoices
    console.log('💰 Seeding invoices...');
    for (const invoice of sampleInvoices) {
      await prisma.invoice.create({
        data: invoice as any
      });
    }
    console.log(`✅ Created ${sampleInvoices.length} invoices`);

    // Seed Clinic Settings
    console.log('⚙️ Seeding clinic settings...');
    for (const settings of sampleClinicSettings) {
      await prisma.clinicSettings.create({
        data: settings
      });
    }
    console.log(`✅ Created ${sampleClinicSettings.length} clinic settings`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });