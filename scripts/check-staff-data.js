const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStaffAndUsers() {
  try {
    // Check Staff table
    const staff = await prisma.staff.findMany();
    console.log('\n=== Staff Table ===');
    console.log('Count:', staff.length);
    if (staff.length > 0) {
      console.log('Staff members:', JSON.stringify(staff, null, 2));
    } else {
      console.log('❌ No staff records found in Neon database!');
    }

    // Check Users table (non-patients)
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['doctor', 'receptionist', 'admin']
        }
      }
    });
    console.log('\n=== Users Table (Non-patients) ===');
    console.log('Count:', users.length);
    if (users.length > 0) {
      console.log('Users:', JSON.stringify(users.map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        specialization: u.specialization,
        department: u.department
      })), null, 2));
    }

    // Check if any Staff linked to Users
    const linkedStaff = await prisma.staff.findMany({
      where: {
        userId: {
          not: null
        }
      },
      include: {
        user: true
      }
    });
    console.log('\n=== Linked Staff-User Records ===');
    console.log('Count:', linkedStaff.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStaffAndUsers();
