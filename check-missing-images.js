const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkMissingImages() {
  try {
    console.log('🔍 Checking for missing clinical image files...\n');
    
    const images = await prisma.clinicalImage.findMany();
    
    console.log(`Found ${images.length} clinical image records in database\n`);
    
    let missingCount = 0;
    let existingCount = 0;
    
    for (const image of images) {
      // Convert URL to file path
      let relativePath = image.imageUrl;
      if (relativePath.startsWith('/')) {
        relativePath = relativePath.slice(1);
      }
      
      const fullPath = path.join(process.cwd(), 'public', relativePath);
      const exists = fs.existsSync(fullPath);
      
      if (exists) {
        console.log(`✅ EXISTS: ${image.patient} - ${image.type}`);
        console.log(`   Path: ${relativePath}\n`);
        existingCount++;
      } else {
        console.log(`❌ MISSING: ${image.patient} - ${image.type}`);
        console.log(`   Expected path: ${relativePath}`);
        console.log(`   Database ID: ${image.id}`);
        console.log(`   Date: ${image.date}\n`);
        missingCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ ${existingCount} images exist locally`);
    console.log(`   ❌ ${missingCount} images are missing`);
    
    if (missingCount > 0) {
      console.log(`\n⚠️  Missing images need to be re-uploaded through the application.`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingImages();
