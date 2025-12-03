const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.staff.findMany();
  console.log('Staff from DB:');
  console.log(JSON.stringify(staff, null, 2));
  
  // Check each staff role
  console.log('\nRole check:');
  staff.forEach(s => {
    console.log(`  Name: ${s.name}, Role: "${s.role}", Type: ${typeof s.role}`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);
