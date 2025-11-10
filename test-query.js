const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});

async function testQuery() {
  try {
    console.log('\n🧪 Testing different query methods...\n');
    
    const testEmail = 'admin@cairodental.com';
    
    // Method 1: Simple findFirst
    console.log('1️⃣ Simple findFirst:');
    const user1 = await prisma.user.findFirst({
      where: { email: testEmail }
    });
    console.log('   Found:', !!user1);
    
    // Method 2: findFirst with equals (lowercase)
    console.log('\n2️⃣ findFirst with lowercase:');
    const user2 = await prisma.user.findFirst({
      where: { email: testEmail.toLowerCase() }
    });
    console.log('   Found:', !!user2);
    
    // Method 3: findFirst with case-insensitive
    console.log('\n3️⃣ findFirst with mode insensitive:');
    const user3 = await prisma.user.findFirst({
      where: { 
        email: { 
          equals: testEmail,
          mode: 'insensitive'
        }
      }
    });
    console.log('   Found:', !!user3);
    if (user3) {
      console.log('   Email in DB:', user3.email);
      console.log('   Has passwordHash:', !!user3.passwordHash);
      console.log('   Hash length:', user3.passwordHash?.length);
    }
    
    // Method 4: Find ALL users
    console.log('\n4️⃣ All users:');
    const allUsers = await prisma.user.findMany();
    console.log('   Total users:', allUsers.length);
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
