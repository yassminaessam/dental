// Batch update script to link multiple images to teeth
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function batchUpdate() {
  try {
    console.log('🔧 Batch Update Tool for Clinical Images\n');
    console.log('=' .repeat(60));
    
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
      console.log('\nUsage:');
      console.log('  node scripts/batch-update-images.js <operation> [options]\n');
      console.log('Operations:');
      console.log('  list              - List all images without tooth numbers');
      console.log('  update-patient    - Update all images for a patient');
      console.log('  update-by-caption - Update images based on caption pattern\n');
      console.log('Examples:');
      console.log('  node scripts/batch-update-images.js list');
      console.log('  node scripts/batch-update-images.js update-patient Ahmed 15');
      console.log('  node scripts/batch-update-images.js update-by-caption "tooth #15" 15');
      return;
    }

    const operation = args[0];

    if (operation === 'list') {
      const images = await prisma.clinicalImage.findMany({
        where: { toothNumber: null },
        orderBy: { date: 'desc' },
      });

      console.log(`\n📋 Images without tooth number: ${images.length}\n`);
      images.forEach((img, i) => {
        console.log(`${i + 1}. ${img.patient} - ${img.type}`);
        console.log(`   ID: ${img.id}`);
        console.log(`   Caption: ${img.caption || 'None'}`);
        console.log(`   Date: ${img.date.toLocaleDateString()}`);
        console.log('');
      });
      
    } else if (operation === 'update-patient') {
      const [, patientName, toothNumberStr] = args;
      if (!patientName || !toothNumberStr) {
        console.error('❌ Usage: update-patient <patientName> <toothNumber>');
        return;
      }

      const toothNumber = parseInt(toothNumberStr);
      const result = await prisma.clinicalImage.updateMany({
        where: {
          patient: patientName,
          toothNumber: null,
        },
        data: { toothNumber },
      });

      console.log(`✅ Updated ${result.count} images for patient "${patientName}" to tooth #${toothNumber}`);
      
    } else if (operation === 'update-by-caption') {
      const [, pattern, toothNumberStr] = args;
      if (!pattern || !toothNumberStr) {
        console.error('❌ Usage: update-by-caption <pattern> <toothNumber>');
        return;
      }

      const toothNumber = parseInt(toothNumberStr);
      
      // Find images matching the pattern
      const images = await prisma.clinicalImage.findMany({
        where: {
          caption: { contains: pattern, mode: 'insensitive' },
          toothNumber: null,
        },
      });

      console.log(`\n📋 Found ${images.length} images matching pattern "${pattern}":\n`);
      images.forEach((img, i) => {
        console.log(`${i + 1}. ${img.patient} - ${img.type} - "${img.caption}"`);
      });

      if (images.length > 0) {
        console.log(`\n🔄 Updating ${images.length} images to tooth #${toothNumber}...`);
        
        const result = await prisma.clinicalImage.updateMany({
          where: {
            id: { in: images.map(img => img.id) },
          },
          data: { toothNumber },
        });

        console.log(`✅ Updated ${result.count} images`);
      }
      
    } else {
      console.error(`❌ Unknown operation: ${operation}`);
      console.log('Run with --help for usage information');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

batchUpdate();
