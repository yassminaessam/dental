const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStaffRoles() {
  try {
    // Check Staff table
    const staff = await prisma.staff.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
      }
    });
    
    console.log('\n📋 Staff Table:');
    console.log('Total staff:', staff.length);
    staff.forEach(s => {
      console.log(`  - ${s.name} | Role: "${s.role}" | Email: ${s.email}`);
    });

    // Count by role
    console.log('\n📊 Staff by Role:');
    const roleCounts = {};
    staff.forEach(s => {
      roleCounts[s.role] = (roleCounts[s.role] || 0) + 1;
    });
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  - ${role}: ${count}`);
    });

    // Also check Users table for comparison
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    
    console.log('\n👥 User Table:');
    console.log('Total users:', users.length);
    users.forEach(u => {
      console.log(`  - ${u.name || u.email} | Role: "${u.role}"`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStaffRoles();
