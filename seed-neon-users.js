const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ROLE_PERMISSIONS = {
  'admin': ['read', 'write', 'delete', 'manage_users', 'view_reports', 'manage_settings'],
  'doctor': ['read', 'write', 'view_medical_records', 'prescribe', 'view_reports'],
  'receptionist': ['read', 'write', 'schedule_appointments', 'manage_billing'],
  'patient': ['read', 'view_own_records', 'book_appointments']
};

const demoUsers = [
  {
    email: 'admin@cairodental.com',
    password: 'Admin123!',
    role: 'admin',
    firstName: 'Dr. Sarah',
    lastName: 'Ahmed',
    phone: '+201234567890'
  },
  {
    email: 'doctor@cairodental.com',
    password: 'Doctor123!',
    role: 'doctor',
    firstName: 'Dr. Mohamed',
    lastName: 'Hassan',
    phone: '+201234567891'
  },
  {
    email: 'receptionist@cairodental.com',
    password: 'Receptionist123!',
    role: 'receptionist',
    firstName: 'Fatima',
    lastName: 'Ali',
    phone: '+201234567892'
  },
  {
    email: 'patient@cairodental.com',
    password: 'Patient123!',
    role: 'patient',
    firstName: 'Ahmed',
    lastName: 'Mahmoud',
    phone: '+201234567893'
  }
];

async function seedUsers() {
  console.log('Starting to seed demo users to Neon database...');
  
  for (const user of demoUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (existingUser) {
        console.log(`User ${user.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 12);

      // Create new user
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          hashedPassword: hashedPassword,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          permissions: ROLE_PERMISSIONS[user.role] || [],
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: null
        }
      });

      console.log(`Created user: ${user.email} (ID: ${createdUser.id})`);

    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }

  await prisma.$disconnect();
  
  console.log('\nDemo users seeding completed!');
  console.log('\nDemo Login Credentials:');
  console.log('=======================');
  demoUsers.forEach(user => {
    console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });
}

seedUsers().catch((error) => {
  console.error('Error seeding users:', error);
  prisma.$disconnect();
});