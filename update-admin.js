const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAdmin() {
  try {
    console.log('🔐 Updating admin credentials...');
    
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    // Use raw SQL to update the user
    await prisma.$executeRaw`
      UPDATE users 
      SET 
        email = 'admin@cairodental.com',
        "hashedPassword" = ${hashedPassword},
        "firstName" = 'Admin',
        "lastName" = 'User',
        role = 'admin'::"UserRole",
        phone = '+20123456789',
        "isActive" = true,
        "updatedAt" = NOW()
      WHERE role = 'admin'
    `;
    
    console.log('✅ Updated admin credentials successfully!');
    console.log('📋 Login: admin@cairodental.com / Admin123!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdmin();