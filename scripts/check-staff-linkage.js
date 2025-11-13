const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStaffLinkage() {
  console.log('Checking staff-user linkage...\n');
  
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('Staff Members:');
    console.log('═══════════════════════════════════════════════════════');
    for (const member of staff) {
      const hasUserId = member.userId ? '✓' : '✗';
      console.log(`${hasUserId} ${member.name} (${member.email})`);
      if (member.userId) {
        console.log(`  └─ userId: ${member.userId}`);
        
        // Also get the user details
        const user = await prisma.user.findUnique({
          where: { id: member.userId }
        });
        if (user) {
          console.log(`  └─ User: ${user.firstName} ${user.lastName} [${user.role}]`);
        }
      }
      console.log('');
    }
    
    const withUserId = staff.filter(s => s.userId).length;
    const withoutUserId = staff.filter(s => !s.userId).length;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total: ${staff.length} | Linked: ${withUserId} | Not linked: ${withoutUserId}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStaffLinkage();
