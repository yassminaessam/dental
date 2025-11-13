/**
 * Script to add a new doctor to the system
 * 
 * Usage:
 * node scripts/add-doctor.js
 * 
 * This script will:
 * 1. Prompt for doctor information
 * 2. Create a user account with role='doctor'
 * 3. Set specialization, license number, and other details
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function addDoctor() {
  try {
    console.log('\n=== إضافة طبيب جديد / Add New Doctor ===\n');

    // Collect doctor information
    const firstName = await question('First Name (الاسم الأول): ');
    const lastName = await question('Last Name (اسم العائلة): ');
    const email = await question('Email (البريد الإلكتروني): ');
    const password = await question('Password (كلمة المرور): ');
    const phone = await question('Phone (رقم الهاتف): ');
    const specialization = await question('Specialization (التخصص) [e.g., Orthodontics, Endodontics, General Dentistry]: ');
    const licenseNumber = await question('License Number (رقم الترخيص) [optional]: ');
    const department = await question('Department (القسم) [optional]: ');

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      console.error('\n❌ Error: First name, last name, email, and password are required!');
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('\n❌ Error: A user with this email already exists!');
      process.exit(1);
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the doctor user
    const doctor = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'doctor',
        phone: phone || null,
        specialization: specialization || null,
        licenseNumber: licenseNumber || null,
        department: department || null,
        isActive: true,
        permissions: [
          'view_patients',
          'edit_patients',
          'view_appointments',
          'edit_appointments',
          'view_treatments',
          'edit_treatments',
          'view_medical_records',
          'edit_medical_records',
          'view_dental_chart',
          'edit_dental_chart',
          'view_billing',
          'view_inventory',
          'view_own_data',
        ],
      },
    });

    console.log('\n✅ Doctor added successfully!');
    console.log('\n=== Doctor Details ===');
    console.log(`ID: ${doctor.id}`);
    console.log(`Name: ${doctor.firstName} ${doctor.lastName}`);
    console.log(`Email: ${doctor.email}`);
    console.log(`Phone: ${doctor.phone || 'N/A'}`);
    console.log(`Specialization: ${doctor.specialization || 'N/A'}`);
    console.log(`License Number: ${doctor.licenseNumber || 'N/A'}`);
    console.log(`Department: ${doctor.department || 'N/A'}`);
    console.log(`Role: ${doctor.role}`);
    console.log(`Active: ${doctor.isActive}`);
    console.log('\nThe doctor can now login with the provided email and password.');
    
  } catch (error) {
    console.error('\n❌ Error adding doctor:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the script
addDoctor();
