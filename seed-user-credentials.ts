import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function seedWithUserCredentials() {
  try {
    console.log('🌱 Starting database seeding with user credentials...');

    // Clear existing users
    await prisma.user.deleteMany({});
    console.log('🧹 Cleared existing users');

    // Hash the admin password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Create the admin user with your credentials
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@cairodental.com',
        hashedPassword: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        permissions: [
          'users:read', 'users:write', 'users:delete',
          'patients:read', 'patients:write', 'patients:delete',
          'appointments:read', 'appointments:write', 'appointments:delete',
          'treatments:read', 'treatments:write', 'treatments:delete',
          'billing:read', 'billing:write', 'billing:delete',
          'reports:read', 'reports:write',
          'settings:read', 'settings:write',
          'inventory:read', 'inventory:write', 'inventory:delete'
        ],
        phone: '+20123456789',
        isActive: true,
      },
    });

    console.log('✅ Created admin user:', adminUser.email);

    // Create additional sample users for testing
    const doctorPassword = await bcrypt.hash('doctor123', 12);
    const doctorUser = await prisma.user.create({
      data: {
        email: 'dr.ahmed@cairodental.com',
        hashedPassword: doctorPassword,
        firstName: 'Dr. Ahmed',
        lastName: 'Hassan',
        role: 'doctor',
        permissions: [
          'patients:read', 'patients:write',
          'appointments:read', 'appointments:write',
          'treatments:read', 'treatments:write',
          'prescriptions:read', 'prescriptions:write',
          'reports:read'
        ],
        specialization: 'General Dentistry',
        licenseNumber: 'DEN-2024-001',
        phone: '+20123456790',
        isActive: true,
      },
    });

    const receptionistPassword = await bcrypt.hash('receptionist123', 12);
    const receptionistUser = await prisma.user.create({
      data: {
        email: 'reception@cairodental.com',
        hashedPassword: receptionistPassword,
        firstName: 'Sarah',
        lastName: 'Mohamed',
        role: 'receptionist',
        permissions: [
          'patients:read', 'patients:write',
          'appointments:read', 'appointments:write',
          'billing:read', 'billing:write'
        ],
        phone: '+20123456791',
        isActive: true,
      },
    });

    console.log('✅ Created doctor user:', doctorUser.email);
    console.log('✅ Created receptionist user:', receptionistUser.email);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@cairodental.com / Admin123!');
    console.log('Doctor: dr.ahmed@cairodental.com / doctor123');
    console.log('Receptionist: reception@cairodental.com / receptionist123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedWithUserCredentials();