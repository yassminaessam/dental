/**
 * Backfill Script: Add patientEmail and patientPhone to existing appointments
 * 
 * This script updates existing appointments that have patientId but missing patientEmail/patientPhone
 * by fetching the data from the patients table.
 * 
 * Usage: node scripts/backfill-appointment-emails.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function backfillAppointmentEmails() {
  console.log('🔍 Starting backfill process...\n');

  try {
    // Get all appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { patientEmail: null },
          { patientEmail: '' }
        ]
      },
      select: {
        id: true,
        patient: true,
        patientId: true,
        patientEmail: true,
        patientPhone: true,
        dateTime: true,
      }
    });

    console.log(`📊 Found ${appointments.length} appointments missing patientEmail\n`);

    if (appointments.length === 0) {
      console.log('✅ All appointments already have patientEmail set!');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const appointment of appointments) {
      try {
        if (!appointment.patientId) {
          console.log(`⏭️  Skipping ${appointment.id} - No patientId found`);
          skippedCount++;
          continue;
        }

        // Fetch patient data
        const patient = await prisma.patient.findUnique({
          where: { id: appointment.patientId },
          select: {
            email: true,
            phone: true,
          }
        });

        if (!patient) {
          console.log(`⚠️  Warning: Patient not found for appointment ${appointment.id} (patientId: ${appointment.patientId})`);
          failCount++;
          continue;
        }

        // Update appointment with patient email and phone
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            patientEmail: patient.email || null,
            patientPhone: patient.phone || null,
          }
        });

        console.log(`✅ Updated appointment ${appointment.id} for ${appointment.patient}`);
        console.log(`   Email: ${patient.email}, Phone: ${patient.phone}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error updating appointment ${appointment.id}:`, error.message);
        failCount++;
      }
    }

    console.log('\n📈 Backfill Summary:');
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📊 Total processed: ${appointments.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Backfill completed successfully!');
      console.log('Patients should now be able to see their appointments.');
    }

  } catch (error) {
    console.error('❌ Fatal error during backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillAppointmentEmails()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
