const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin users in database...\n');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        passwordHash: true,
        isActive: true,
      }
    });
    
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.isActive}`);
      console.log(`Has passwordHash: ${!!user.passwordHash}`);
      console.log(`passwordHash length: ${user.passwordHash?.length || 0}`);
      console.log('---');
    });
    
    // Try to find admin by email
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@cairodental.com' }
    });
    
    if (admin) {
      console.log('\n✅ Found admin user by email');
      console.log(`Password hash exists: ${!!admin.passwordHash}`);
      
      if (admin.passwordHash) {
        // Test password
        const testPassword = 'Admin123!';
        const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
        console.log(`\nPassword "${testPassword}" is valid: ${isValid}`);
        
        if (!isValid) {
          console.log('\n⚠️  Password mismatch - updating now...');
          const newHash = await bcrypt.hash(testPassword, 12);
          await prisma.user.update({
            where: { id: admin.id },
            data: { passwordHash: newHash }
          });
          console.log('✅ Password updated successfully');
        }
      } else {
        console.log('❌ No password hash found - setting now...');
        const newHash = await bcrypt.hash('Admin123!', 12);
        await prisma.user.update({
          where: { id: admin.id },
          data: { passwordHash: newHash }
        });
        console.log('✅ Password hash set');
      }
    } else {
      console.log('\n❌ No admin user found - creating now...');
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      
      await prisma.user.create({
        data: {
          email: 'admin@cairodental.com',
          passwordHash: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          permissions: [
            'view_patients', 'edit_patients', 'delete_patients',
            'view_appointments', 'edit_appointments', 'delete_appointments',
            'view_treatments', 'edit_treatments', 'delete_treatments',
            'view_billing', 'edit_billing', 'delete_billing',
            'view_reports', 'edit_reports',
            'view_staff', 'edit_staff', 'delete_staff',
            'view_inventory', 'edit_inventory',
            'view_settings', 'edit_settings'
          ],
          phone: '+20123456789',
          isActive: true,
        }
      });
      
      console.log('✅ Admin user created');
    }
    
    console.log('\n✅ Done! You can now login with:');
    console.log('   Email: admin@cairodental.com');
    console.log('   Password: Admin123!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
