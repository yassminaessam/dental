const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function linkStaffToUsers() {
  console.log('Linking staff members to their user accounts...');
  
  try {
    // Get all staff members
    const staff = await prisma.staff.findMany();
    console.log(`Found ${staff.length} staff members`);
    
    let linkedCount = 0;
    let alreadyLinkedCount = 0;
    let notFoundCount = 0;
    
    for (const member of staff) {
      if (member.userId) {
        console.log(`Staff ${member.name} already has userId: ${member.userId}`);
        alreadyLinkedCount++;
        continue;
      }
      
      // Find user by phone
      const user = await prisma.user.findFirst({
        where: { phone: member.phone }
      });
      
      if (user) {
        // Update staff with userId
        await prisma.staff.update({
          where: { id: member.id },
          data: { userId: user.id }
        });
        console.log(`✓ Linked staff ${member.name} (${member.phone}) to user ${user.firstName} ${user.lastName} (ID: ${user.id})`);
        linkedCount++;
      } else {
        console.log(`✗ No user account found for staff ${member.name} (${member.phone})`);
        notFoundCount++;
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total staff: ${staff.length}`);
    console.log(`Already linked: ${alreadyLinkedCount}`);
    console.log(`Newly linked: ${linkedCount}`);
    console.log(`No user account found: ${notFoundCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkStaffToUsers();
