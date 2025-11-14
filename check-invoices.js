import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInvoices() {
  try {
    console.log('🔍 Checking Invoices in Neon Database...\n');
    
    // Count invoices
    const invoiceCount = await prisma.invoice.count();
    console.log(`💰 Total Invoices: ${invoiceCount}\n`);
    
    if (invoiceCount === 0) {
      console.log('⚠️  No invoices found in database.');
      console.log('ℹ️  You can create test invoices through the admin billing page.\n');
      
      // Show available patients for reference
      const patients = await prisma.patient.findMany({
        select: { id: true, name: true, lastName: true, email: true },
        take: 5
      });
      
      if (patients.length > 0) {
        console.log('📋 Available Patients (use these IDs to create invoices):');
        patients.forEach(patient => {
          console.log(`  - ${patient.name} ${patient.lastName} (${patient.email})`);
          console.log(`    ID: ${patient.id}`);
        });
      }
    } else {
      // Show detailed invoice information
      console.log('📄 Invoice Details:\n');
      const invoices = await prisma.invoice.findMany({
        include: {
          items: true,
          patient: {
            select: { id: true, name: true, lastName: true, email: true }
          }
        },
        orderBy: { date: 'desc' }
      });
      
      for (const invoice of invoices) {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Invoice: ${invoice.number}`);
        console.log(`ID: ${invoice.id}`);
        console.log(`Status: ${invoice.status}`);
        console.log(`Amount: ${invoice.amount} EGP`);
        console.log(`Date: ${invoice.date.toLocaleDateString()}`);
        if (invoice.dueDate) {
          console.log(`Due Date: ${invoice.dueDate.toLocaleDateString()}`);
        }
        
        if (invoice.patient) {
          console.log(`Patient: ${invoice.patient.name} ${invoice.patient.lastName}`);
          console.log(`Patient ID: ${invoice.patient.id}`);
          console.log(`Patient Email: ${invoice.patient.email}`);
        } else {
          console.log(`Patient: Not linked (ID: ${invoice.patientId || 'None'})`);
        }
        
        if (invoice.items && invoice.items.length > 0) {
          console.log(`\nItems:`);
          invoice.items.forEach((item, idx) => {
            console.log(`  ${idx + 1}. ${item.description}`);
            console.log(`     Qty: ${item.quantity} × ${item.unitPrice} EGP = ${item.total} EGP`);
          });
        }
        
        if (invoice.notes) {
          console.log(`Notes: ${invoice.notes}`);
        }
        console.log('');
      }
      
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      
      // Test the patient invoices API endpoint for each patient with invoices
      const patientsWithInvoices = [...new Set(invoices.filter(inv => inv.patientId).map(inv => inv.patientId))];
      
      if (patientsWithInvoices.length > 0) {
        console.log('✅ Testing Patient Invoice API:');
        console.log('   The following patient IDs have invoices:');
        patientsWithInvoices.forEach(patientId => {
          const patientInvoices = invoices.filter(inv => inv.patientId === patientId);
          const patient = patientInvoices[0]?.patient;
          console.log(`   - Patient ID: ${patientId}`);
          if (patient) {
            console.log(`     Name: ${patient.name} ${patient.lastName}`);
            console.log(`     Email: ${patient.email}`);
          }
          console.log(`     Invoices: ${patientInvoices.length}`);
        });
        console.log('\n   To test the patient invoice display:');
        console.log('   1. Login as a patient user with one of the above emails');
        console.log('   2. Navigate to the Billing page in patient portal');
        console.log('   3. The invoices should display automatically\n');
      }
    }
    
    console.log('✅ Invoice check complete!');
    
  } catch (error) {
    console.error('❌ Error checking invoices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInvoices();
