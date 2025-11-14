import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestInvoice() {
  try {
    console.log('🔍 Creating Test Invoice...\n');
    
    // Get the patient
    const patient = await prisma.patient.findFirst({
      where: { email: 'patient@cairodental.com' }
    });
    
    if (!patient) {
      console.log('❌ Patient not found with email: patient@cairodental.com');
      console.log('   Please make sure the patient exists first.');
      return;
    }
    
    console.log(`✅ Found patient: ${patient.name} ${patient.lastName} (${patient.email})`);
    console.log(`   Patient ID: ${patient.id}\n`);
    
    // Create a test invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        patientId: patient.id,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        amount: 2500.00,
        status: 'Sent',
        notes: 'Test invoice for dental cleaning and examination',
        items: {
          create: [
            {
              description: 'Dental Cleaning',
              quantity: 1,
              unitPrice: 1500.00,
              total: 1500.00
            },
            {
              description: 'Oral Examination',
              quantity: 1,
              unitPrice: 500.00,
              total: 500.00
            },
            {
              description: 'X-Ray Imaging',
              quantity: 2,
              unitPrice: 250.00,
              total: 500.00
            }
          ]
        }
      },
      include: {
        items: true,
        patient: true
      }
    });
    
    console.log('✅ Test Invoice Created Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Invoice Number: ${invoice.number}`);
    console.log(`Invoice ID: ${invoice.id}`);
    console.log(`Patient: ${invoice.patient.name} ${invoice.patient.lastName}`);
    console.log(`Patient Email: ${invoice.patient.email}`);
    console.log(`Status: ${invoice.status}`);
    console.log(`Amount: ${invoice.amount} EGP`);
    console.log(`Date: ${invoice.date.toLocaleDateString()}`);
    console.log(`Due Date: ${invoice.dueDate?.toLocaleDateString()}`);
    console.log('\nItems:');
    invoice.items.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.description}`);
      console.log(`     Qty: ${item.quantity} × ${item.unitPrice} EGP = ${item.total} EGP`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Create another paid invoice for testing payment history
    const paidInvoice = await prisma.invoice.create({
      data: {
        number: `INV-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        patientId: patient.id,
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        amount: 800.00,
        status: 'Paid',
        notes: 'Consultation and prescription',
        items: {
          create: [
            {
              description: 'General Consultation',
              quantity: 1,
              unitPrice: 500.00,
              total: 500.00
            },
            {
              description: 'Prescription Fee',
              quantity: 1,
              unitPrice: 300.00,
              total: 300.00
            }
          ]
        }
      },
      include: {
        items: true
      }
    });
    
    console.log('✅ Second Test Invoice (Paid) Created Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Invoice Number: ${paidInvoice.number}`);
    console.log(`Status: ${paidInvoice.status}`);
    console.log(`Amount: ${paidInvoice.amount} EGP`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎉 Test Data Created Successfully!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Login to the patient portal with: patient@cairodental.com');
    console.log('   2. Navigate to the Billing page');
    console.log('   3. You should see 2 invoices:');
    console.log('      - 1 Pending invoice (2500 EGP)');
    console.log('      - 1 Paid invoice (800 EGP)');
    console.log('   4. Test the Pay Now and Download buttons\n');
    
  } catch (error) {
    console.error('❌ Error creating test invoice:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestInvoice();
