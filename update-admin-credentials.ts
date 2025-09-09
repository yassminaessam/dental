import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateAdminCredentials() {
  try {
    console.log('🔐 Updating admin credentials...');

    // Hash the admin password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Update or create the admin user with your credentials
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@cairodental.com' },
      update: {
        hashedPassword: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '+20123456789',
        isActive: true,
      },
      create: {
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

    console.log('✅ Updated admin user:', adminUser.email);
    console.log('📋 Admin Login: admin@cairodental.com / Admin123!');

    console.log('🎉 Admin credentials updated successfully!');

  } catch (error) {
    console.error('❌ Error updating credentials:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminCredentials();