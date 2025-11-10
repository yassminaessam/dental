const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testSignIn() {
  try {
    const email = 'admin@cairodental.com';
    const password = 'Admin123!';
    
    console.log(`\n🔐 Testing sign-in for: ${email}\n`);
    
    // Simulate what the API does
    const normalized = email.trim().toLowerCase();
    console.log(`Normalized email: ${normalized}`);
    
    // Use findFirst with case-insensitive match (as updated in the service)
    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: normalized,
          mode: 'insensitive'
        }
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`Has passwordHash: ${!!user.passwordHash}`);
    
    if (!user.passwordHash) {
      console.log('❌ No password hash');
      return;
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log(`\nPassword valid: ${isValid}`);
    
    if (!user.isActive) {
      console.log('❌ Account is deactivated');
      return;
    }
    
    console.log('\n✅ Sign-in would succeed!');
    console.log(`User would be logged in with ID: ${user.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSignIn();
