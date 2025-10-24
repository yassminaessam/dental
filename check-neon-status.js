const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showNeonStatus() {
  try {
    console.log('🔍 NEON DATABASE CONNECTION STATUS:');
    console.log('================================================');
    
    // Get connection info
    const result = await prisma.$queryRaw`SELECT current_database(), current_user`;
    console.log('📍 Database:', result[0].current_database);
    console.log('👤 User:', result[0].current_user);
    console.log('🌐 Host: ep-calm-glade-aein3lws-pooler.c-2.us-east-2.aws.neon.tech');
    console.log('🔌 Database: neondb');
    
    console.log('\n📊 TABLE COUNTS:');
    console.log('================');
    
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    const appointmentCount = await prisma.appointment.count();
    const treatmentCount = await prisma.treatment.count();
    const invoiceCount = await prisma.invoice.count();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏥 Patients: ${patientCount}`);
    console.log(`📅 Appointments: ${appointmentCount}`);
    console.log(`🦷 Treatments: ${treatmentCount}`);
    console.log(`💰 Invoices: ${invoiceCount}`);
    
    console.log('\n✅ STATUS: 100% CONNECTED TO NEON POSTGRESQL!');
    console.log('🔗 Your Neon Project: neon-lime-dog');
    console.log('📊 View Database: http://localhost:5555 (Prisma Studio)');
    console.log('🌐 Neon Console: https://console.neon.tech/');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showNeonStatus();