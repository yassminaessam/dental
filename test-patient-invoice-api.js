import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPatientInvoiceAPI() {
  try {
    console.log('🧪 Testing Patient Invoice API Endpoint...\n');
    
    // Get the patient
    const patient = await prisma.patient.findFirst({
      where: { email: 'patient@cairodental.com' }
    });
    
    if (!patient) {
      console.log('❌ Patient not found');
      return;
    }
    
    console.log(`✅ Found patient: ${patient.name} ${patient.lastName}`);
    console.log(`   Patient ID: ${patient.id}\n`);
    
    // Simulate what the API does
    console.log('🔄 Simulating API call: GET /api/patient/invoices?patientId=' + patient.id + '\n');
    
    // Get all invoices and filter by patient ID (same as API)
    const allInvoices = await prisma.invoice.findMany({
      include: { items: true },
      orderBy: { date: 'desc' }
    });
    
    const patientInvoices = allInvoices.filter(inv => inv.patientId === patient.id);
    
    console.log(`📊 API would return ${patientInvoices.length} invoices:\n`);
    
    // Serialize dates (same as API)
    const serialized = patientInvoices.map(inv => ({
      id: inv.id,
      number: inv.number,
      patientId: inv.patientId,
      date: inv.date.toISOString(),
      dueDate: inv.dueDate?.toISOString(),
      amount: Number(inv.amount),
      status: inv.status,
      notes: inv.notes,
      items: inv.items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      })),
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
    }));
    
    // Display the results
    serialized.forEach((inv, idx) => {
      console.log(`${idx + 1}. Invoice ${inv.number}`);
      console.log(`   Status: ${inv.status}`);
      console.log(`   Amount: ${inv.amount} EGP`);
      console.log(`   Date: ${new Date(inv.date).toLocaleDateString()}`);
      console.log(`   Items: ${inv.items.length}`);
      inv.items.forEach((item, itemIdx) => {
        console.log(`      ${itemIdx + 1}. ${item.description} - ${item.quantity} × ${item.unitPrice} EGP`);
      });
      console.log('');
    });
    
    // Show what the patient billing page would display
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Patient Billing Page Display:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Calculate totals (same as patient billing page)
    const totalPending = serialized
      .filter(inv => inv.status !== 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    const totalPaid = serialized
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    console.log('💳 Summary Cards:');
    console.log(`   Outstanding Balance: ${totalPending.toFixed(2)} EGP`);
    console.log(`   Total Paid: ${totalPaid.toFixed(2)} EGP`);
    console.log(`   Payments Made: ${serialized.filter(inv => inv.status === 'Paid').length}\n`);
    
    console.log('📄 Invoices Section:');
    serialized.forEach(inv => {
      const displayStatus = inv.status === 'Paid' ? 'Paid' : 'Pending';
      const badge = displayStatus === 'Paid' ? '🟢' : '🔴';
      console.log(`   ${badge} ${inv.number} - ${displayStatus}`);
      console.log(`      Amount: ${inv.amount} EGP`);
      console.log(`      Date: ${new Date(inv.date).toLocaleDateString()}`);
      if (inv.dueDate && displayStatus === 'Pending') {
        console.log(`      Due: ${new Date(inv.dueDate).toLocaleDateString()}`);
      }
    });
    console.log('');
    
    const paidInvoices = serialized.filter(inv => inv.status === 'Paid');
    if (paidInvoices.length > 0) {
      console.log('💰 Payment History Section:');
      paidInvoices.forEach(inv => {
        console.log(`   ✓ ${inv.number} - ${inv.amount} EGP`);
        console.log(`      Paid on: ${new Date(inv.updatedAt).toLocaleDateString()}`);
      });
      console.log('');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ API Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Login with: patient@cairodental.com');
    console.log('   3. Navigate to: /patient-billing');
    console.log('   4. Verify the invoices display correctly\n');
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPatientInvoiceAPI();
