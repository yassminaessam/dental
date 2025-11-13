/**
 * Sync Users to Staff Table
 * 
 * This script creates Staff records for Users with roles: admin, doctor, receptionist
 * who don't already have Staff records.
 * 
 * Usage: node scripts/sync-users-to-staff.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Role mapping: User role → Staff role
const ROLE_MAPPING = {
  'admin': 'Manager',
  'doctor': 'Dentist',
  'receptionist': 'Receptionist',
};

async function syncUsersToStaff() {
  try {
    console.log('\n🔄 Starting User → Staff sync...\n');

    // Get users who should have staff records
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'doctor', 'receptionist']
        },
        isActive: true,
      },
      include: {
        staff: true, // Include linked staff if exists
      }
    });

    console.log(`Found ${users.length} users (admin/doctor/receptionist)`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      // Skip if already has staff record
      if (user.staff) {
        console.log(`⏭️  Skipped: ${user.firstName} ${user.lastName} - Already has staff record`);
        skipped++;
        continue;
      }

      try {
        // Create staff record
        const staffRole = ROLE_MAPPING[user.role] || 'Assistant';
        const fullName = `${user.firstName} ${user.lastName}`.trim();
        
        const staff = await prisma.staff.create({
          data: {
            userId: user.id,
            name: fullName,
            role: staffRole,
            email: user.email,
            phone: user.phone || 'N/A',
            schedule: 'Mon-Fri, 9-5', // Default schedule
            salary: 'TBD', // To be determined
            hireDate: user.createdAt || new Date(),
            status: user.isActive ? 'Active' : 'Inactive',
            notes: `Auto-created from User account. Department: ${user.department || 'N/A'}`,
          },
        });

        console.log(`✅ Created: ${fullName} (${staffRole}) - ID: ${staff.id}`);
        created++;

      } catch (error) {
        console.error(`❌ Error creating staff for ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`✅ Created: ${created}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total: ${users.length}`);

    // Show final staff count
    const finalStaffCount = await prisma.staff.count();
    console.log(`\n📈 Total staff records in database: ${finalStaffCount}`);

  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncUsersToStaff();
