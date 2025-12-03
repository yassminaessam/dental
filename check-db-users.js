const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, patientId: true }
    });
    console.log('\n=== USERS ===');
    console.log('Total:', users.length);
    users.forEach(u => {
      console.log(`- ${u.firstName} ${u.lastName} (${u.email}) - Role: ${u.role}${u.patientId ? ` - PatientId: ${u.patientId}` : ''}`);
    });

    const patients = await prisma.patient.findMany({
      select: { id: true, email: true, name: true, lastName: true }
    });
    console.log('\n=== PATIENTS ===');
    console.log('Total:', patients.length);
    patients.forEach(p => {
      console.log(`- ${p.name} ${p.lastName} (${p.email}) - ID: ${p.id}`);
    });

    const patientUsers = users.filter(u => u.role === 'patient');
    console.log('\n=== PATIENT ROLE USERS ===');
    console.log('Total:', patientUsers.length);
    patientUsers.forEach(u => {
      console.log(`- ${u.firstName} ${u.lastName} (${u.email}) - PatientId: ${u.patientId || 'NOT LINKED'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
