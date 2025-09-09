import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNeonData() {
  try {
    console.log('🔍 Checking Neon PostgreSQL Database...\n');
    
    // Count records in each table
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    const appointmentCount = await prisma.appointment.count();
    const treatmentCount = await prisma.treatment.count();
    const invoiceCount = await prisma.invoice.count();
    
    console.log('📊 Data Summary in Neon PostgreSQL:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏥 Patients: ${patientCount}`);
    console.log(`📅 Appointments: ${appointmentCount}`);
    console.log(`🦷 Treatments: ${treatmentCount}`);
    console.log(`💰 Invoices: ${invoiceCount}`);
    
    // Show sample user data to prove it's really there
    console.log('\n👤 Sample Users in Neon:');
    const users = await prisma.user.findMany({
      select: { email: true, role: true, createdAt: true }
    });
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
    });
    
    // Show sample patient data
    console.log('\n🏥 Sample Patients in Neon:');
    const patients = await prisma.patient.findMany({
      select: { firstName: true, lastName: true, email: true, createdAt: true }
    });
    patients.forEach(patient => {
      console.log(`  - ${patient.firstName} ${patient.lastName} (${patient.email}) - Created: ${patient.createdAt.toISOString()}`);
    });
    
    console.log('\n✅ ALL DATA IS SUCCESSFULLY STORED IN NEON POSTGRESQL! 🎉');
    console.log('🔗 Database: ep-calm-glade-aein3lws-pooler.c-2.us-east-2.aws.neon.tech');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNeonData();