const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPermission() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@cairodental.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('Current permissions:', user.permissions);
    
    if (user.permissions.includes('view_dental_chart')) {
      console.log('✅ User already has view_dental_chart permission');
    } else {
      const updated = await prisma.user.update({
        where: { email: 'admin@cairodental.com' },
        data: {
          permissions: [...user.permissions, 'view_dental_chart', 'edit_dental_chart']
        }
      });
      console.log('✅ Added dental chart permissions');
      console.log('Updated permissions:', updated.permissions);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPermission();
