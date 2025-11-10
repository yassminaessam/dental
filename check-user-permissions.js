const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPermissions() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@cairodental.com' }
    });

    if (user) {
      console.log('User found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      });
      
      console.log('\nHas view_dental_chart permission:', 
        user.permissions.includes('view_dental_chart'));
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();
