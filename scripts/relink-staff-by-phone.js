const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function relinkStaffByPhone() {
  console.log('Re-linking staff members to user accounts by phone...\n');
  
  try {
    // First, clear all userId links
    const staff = await prisma.staff.findMany();
    console.log(`Found ${staff.length} staff members`);
    
    // Clear existing userId links
    console.log('Clearing existing userId links...');
    await prisma.staff.updateMany({
      data: { userId: null }
    });
    console.log('✓ Cleared all userId links\n');
    
    // Now re-link by phone
    let linkedCount = 0;
    let notFoundCount = 0;
    
    for (const member of staff) {
      if (!member.phone) {
        console.log(`✗ Staff ${member.name} has no phone number`);
        notFoundCount++;
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
        console.log(`✗ No user account found for staff ${member.name} (phone: ${member.phone})`);
        notFoundCount++;
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total staff: ${staff.length}`);
    console.log(`Newly linked by phone: ${linkedCount}`);
    console.log(`No user account found: ${notFoundCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

relinkStaffByPhone();
