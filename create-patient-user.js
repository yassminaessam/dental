const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createPatientUser() {
  try {
    const email = 'patient@cairodental.com';
    const password = 'Patient@123';
    const passwordHash = await bcrypt.hash(password, 12);

    // First, create the patient record in the Patient table
    const patient = await prisma.patient.create({
      data: {
        name: 'Ahmed',
        lastName: 'Mohamed',
        email: email,
        phone: '+20 100 123 4567',
        dob: new Date('1990-05-15'),
        status: 'Active',
        address: '123 Cairo Street, Nasr City, Cairo',
        ecName: 'Fatima Mohamed',
        ecPhone: '+20 100 765 4321',
        ecRelationship: 'Wife',
        insuranceProvider: 'National Health Insurance',
        policyNumber: 'NHI-2024-789456',
        medicalHistory: {
          allergies: ['Penicillin'],
          conditions: [],
          medications: [],
          notes: 'Regular dental check-ups recommended'
        }
      }
    });

    console.log('✅ Patient record created:', {
      id: patient.id,
      name: `${patient.name} ${patient.lastName}`,
      email: patient.email
    });

    // Then create the user account
    const user = await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
        firstName: 'Ahmed',
        lastName: 'Mohamed',
        role: 'patient',
        permissions: ['view_own_data', 'book_appointments', 'view_own_appointments', 'view_own_records'],
        isActive: true,
        patientId: patient.id,
        phone: '+20 100 123 4567',
        address: '123 Cairo Street, Nasr City, Cairo'
      }
    });

    console.log('\n✅ User account created:', {
      id: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patientId
    });

    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('Role:     ', 'patient');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Patient user created successfully!');

  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Error: User with this email already exists');
      console.log('\n📋 EXISTING CREDENTIALS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:    ', 'patient@cairodental.com');
      console.log('Password: ', 'Patient@123');
      console.log('Role:     ', 'patient');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.error('❌ Error creating patient user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createPatientUser();
