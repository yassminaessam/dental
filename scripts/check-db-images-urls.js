// Check what image URLs are in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImages() {
  try {
    console.log('🔍 Fetching clinical images from database...\n');
    
    const images = await prisma.clinicalImage.findMany({
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        patientId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${images.length} images:\n`);
    
    images.forEach((img, i) => {
      console.log(`${i + 1}. ID: ${img.id}`);
      console.log(`   Patient ID: ${img.patientId}`);
      console.log(`   Caption: ${img.caption || 'None'}`);
      console.log(`   URL: ${img.imageUrl}`);
      console.log(`   Created: ${img.createdAt}`);
      console.log(`   Domain: ${new URL(img.imageUrl).hostname}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
