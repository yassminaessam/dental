const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteReceptionist() {
  try {
    await prisma.user.delete({
      where: { email: 'receptionist@cairodental.com' }
    });
    console.log('✅ Deleted existing receptionist user');
  } catch (e) {
    console.log('User not found or already deleted');
  } finally {
    await prisma.$disconnect();
  }
}

deleteReceptionist();
