// Script to update existing clinical image with tooth number
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateImageToothNumber() {
  try {
    console.log('🔍 Fetching clinical images without tooth number...\n');
    
    // Get all images that don't have a tooth number
    const imagesWithoutTooth = await prisma.clinicalImage.findMany({
      where: {
        toothNumber: null,
      },
      orderBy: {
        date: 'desc',
      },
    });

    console.log(`Found ${imagesWithoutTooth.length} images without tooth number:\n`);
    
    if (imagesWithoutTooth.length === 0) {
      console.log('✅ All images already have tooth numbers assigned!');
      return;
    }

    imagesWithoutTooth.forEach((img, i) => {
      console.log(`${i + 1}. ID: ${img.id}`);
      console.log(`   Patient: ${img.patient}`);
      console.log(`   Type: ${img.type}`);
      console.log(`   Caption: ${img.caption || 'None'}`);
      console.log(`   Date: ${img.date}`);
      console.log('');
    });

    // Ask which image to update
    console.log('To update an image, you have two options:\n');
    console.log('Option 1: Update by image index');
    console.log('  node scripts/update-image-tooth.js <index> <toothNumber>');
    console.log('  Example: node scripts/update-image-tooth.js 1 15\n');
    
    console.log('Option 2: Update by image ID');
    console.log('  node scripts/update-image-tooth.js <imageId> <toothNumber>');
    console.log(`  Example: node scripts/update-image-tooth.js ${imagesWithoutTooth[0]?.id} 15\n`);

    // Check if arguments provided
    const args = process.argv.slice(2);
    if (args.length !== 2) {
      console.log('⚠️ No arguments provided. Run with image index/ID and tooth number to update.');
      return;
    }

    const [firstArg, toothNumberStr] = args;
    const toothNumber = parseInt(toothNumberStr);

    if (isNaN(toothNumber) || toothNumber < 1 || toothNumber > 48) {
      console.error('❌ Invalid tooth number. Must be between 1 and 48.');
      return;
    }

    let imageId: string;
    
    // Check if first argument is an index (number <= images length) or an ID (UUID)
    const index = parseInt(firstArg);
    if (!isNaN(index) && index > 0 && index <= imagesWithoutTooth.length) {
      // It's an index
      imageId = imagesWithoutTooth[index - 1].id;
      console.log(`\n📝 Updating image #${index} (ID: ${imageId})...`);
    } else {
      // Assume it's an ID
      imageId = firstArg;
      console.log(`\n📝 Updating image ID: ${imageId}...`);
    }

    // Update the image
    const updated = await prisma.clinicalImage.update({
      where: { id: imageId },
      data: { toothNumber },
    });

    console.log('✅ Successfully updated image!');
    console.log(`   Image ID: ${updated.id}`);
    console.log(`   Patient: ${updated.patient}`);
    console.log(`   Type: ${updated.type}`);
    console.log(`   Tooth Number: ${updated.toothNumber}`);
    console.log(`   Caption: ${updated.caption || 'None'}`);
    console.log(`   Date: ${updated.date}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImageToothNumber();
