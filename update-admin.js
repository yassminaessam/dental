const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAdmin() {
  try {
    console.log('🔐 Updating admin credentials...');
    
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    // Update all admin users to have the correct passwordHash (schema column)
    await prisma.$executeRawUnsafe(
      `UPDATE "User" 
       SET "email" = 'admin@cairodental.com',
           "passwordHash" = $1,
           "firstName" = 'Admin',
           "lastName" = 'User',
           "role" = 'admin',
           "phone" = '+20123456789',
           "isActive" = true,
           "updatedAt" = NOW()
       WHERE "role" = 'admin'`,
      hashedPassword
    );
    
    console.log('✅ Updated admin credentials successfully!');
    console.log('📋 Login: admin@cairodental.com / Admin123!');
    console.log('   (Ensure you sign in via /api/auth/sign-in)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();