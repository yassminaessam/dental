// Quick script to update the specific existing image with tooth number
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickUpdate() {
  try {
    console.log('🔍 Looking for the existing X-Ray image...\n');
    
    // Find the specific image we know exists
    const image = await prisma.clinicalImage.findFirst({
      where: {
        patient: 'Ahmed',
        type: 'X-Ray',
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (!image) {
      console.log('❌ Image not found!');
      return;
    }

    console.log('📷 Found image:');
    console.log(`   ID: ${image.id}`);
    console.log(`   Patient: ${image.patient}`);
    console.log(`   Type: ${image.type}`);
    console.log(`   Caption: ${image.caption || 'None'}`);
    console.log(`   Current Tooth Number: ${image.toothNumber || 'None'}`);
    console.log(`   Date: ${image.date}`);
    console.log('');

    // Ask for tooth number
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.log('Usage: node scripts/quick-update-tooth.js <toothNumber>');
      console.log('Example: node scripts/quick-update-tooth.js 15');
      console.log('\nThis will update the X-Ray image for patient Ahmed.');
      return;
    }

    const toothNumber = parseInt(args[0]);
    if (isNaN(toothNumber) || toothNumber < 1 || toothNumber > 48) {
      console.error('❌ Invalid tooth number. Must be between 1 and 48.');
      return;
    }

    // Update the image
    const updated = await prisma.clinicalImage.update({
      where: { id: image.id },
      data: { toothNumber },
    });

    console.log('✅ Successfully updated!');
    console.log(`   Tooth Number is now: #${updated.toothNumber}`);
    console.log('\nThe image should now appear in the dental chart when you select tooth #' + toothNumber);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickUpdate();
