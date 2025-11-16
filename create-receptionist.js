const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const receptionistUser = {
  email: 'receptionist@cairodental.com',
  password: 'Receptionist@123',
  firstName: 'Sarah',
  lastName: 'Ahmed',
  role: 'receptionist',
  phone: '+20 100 234 5678',
  address: '456 Tahrir Street, Downtown, Cairo',
  permissions: [
    'view_appointments',
    'create_appointments',
    'edit_appointments',
    'view_patients',
    'create_patients',
    'edit_patients',
    'view_billing',
    'create_invoices',
    'record_payments'
  ]
};

async function createReceptionistUser() {
  try {
    console.log('🔐 Creating Receptionist User Account...\n');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: receptionistUser.email }
    });

    if (existingUser) {
      console.log('⚠️  User already exists with email:', receptionistUser.email);
      console.log('\n📋 Existing User Details:');
      console.log('================================');
      console.log(`Email: ${existingUser.email}`);
      console.log(`Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`Role: ${existingUser.role}`);
      console.log(`Status: ${existingUser.isActive ? 'Active' : 'Inactive'}`);
      console.log('\n💡 You can use the existing credentials to login.');
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(receptionistUser.password, 12);

    // Create the receptionist user account
    const user = await prisma.user.create({
      data: {
        email: receptionistUser.email,
        passwordHash: passwordHash,
        firstName: receptionistUser.firstName,
        lastName: receptionistUser.lastName,
        role: receptionistUser.role,
        permissions: receptionistUser.permissions,
        isActive: true,
        phone: receptionistUser.phone,
        address: receptionistUser.address
      }
    });

    console.log('✅ Receptionist user account created successfully!');

    // Create the corresponding Staff record and link them
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: 'Receptionist',
        email: user.email,
        phone: user.phone,
        schedule: 'Monday-Friday, 9:00 AM - 5:00 PM',
        salary: '5000 EGP',
        hireDate: new Date(),
        status: 'Active'
      }
    });

    console.log('✅ Staff record created and linked to user account!\n');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('================================');
    console.log(`Email: ${receptionistUser.email}`);
    console.log(`Password: ${receptionistUser.password}`);
    console.log(`Role: ${receptionistUser.role.toUpperCase()}`);
    console.log(`Name: ${receptionistUser.firstName} ${receptionistUser.lastName}`);
    console.log('\n🔑 Account Details:');
    console.log('================================');
    console.log(`User ID: ${user.id}`);
    console.log(`Staff ID: ${staff.id}`);
    console.log(`Phone: ${user.phone}`);
    console.log(`Status: Active`);
    console.log(`Hire Date: ${new Date().toLocaleDateString()}`);
    console.log(`Schedule: ${staff.schedule}`);
    console.log(`Salary: ${staff.salary}`);
    console.log('\n📝 Receptionist Permissions:');
    console.log('================================');
    receptionistUser.permissions.forEach((perm, index) => {
      console.log(`${index + 1}. ${perm}`);
    });
    console.log('\n🌐 Login Instructions:');
    console.log('================================');
    console.log('1. Go to http://localhost:9002/login');
    console.log('2. Enter the email and password above');
    console.log('3. You will have access to:');
    console.log('   - Appointments Management');
    console.log('   - Patient Records');
    console.log('   - Billing & Invoicing');
    console.log('   - Front Desk Operations');

  } catch (error) {
    console.error('\n❌ Error creating receptionist user:', error);
    if (error.code === 'P2002') {
      console.log('\n💡 This email is already registered in the system.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createReceptionistUser();
