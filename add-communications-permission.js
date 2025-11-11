const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const email = 'admin@cairodental.com';
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    console.log('Current role:', user.role);
    console.log('Current permissions count:', user.permissions.length);
    const needed = ['view_communications','send_communications'];
    const missing = needed.filter(p => !user.permissions.includes(p));
    if (missing.length === 0) {
      console.log('All communications permissions already present.');
    } else {
      const updated = await prisma.user.update({
        where: { email },
        data: { permissions: [...user.permissions, ...missing] }
      });
      console.log('Added permissions:', missing);
      console.log('New permissions count:', updated.permissions.length);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
