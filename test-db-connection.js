const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    const userCount = await prisma.user.count();
    console.log('✅ User count:', userCount);
    
    const patientCount = await prisma.patient.count();
    console.log('✅ Patient count:', patientCount);
    
    // Check if there are patients with matching users
    const patients = await prisma.patient.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        createdAt: true
      }
    });
    console.log('\n📋 Sample patients:', patients);
    
    // Check if there are users with patient role
    const patientUsers = await prisma.user.findMany({
      where: { role: 'patient' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        patientId: true
      }
    });
    console.log('\n👤 Patient role users:', patientUsers);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
