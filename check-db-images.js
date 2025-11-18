const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkDatabaseImages() {
  try {
    console.log('🔍 Checking clinical images in database...\n');
    
    const images = await prisma.clinicalImage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${images.length} images in database:\n`);
    
    images.forEach((img, index) => {
      console.log(`${index + 1}. Image ID: ${img.id}`);
      console.log(`   Patient: ${img.patient}`);
      console.log(`   Type: ${img.type}`);
      console.log(`   URL: ${img.imageUrl}`);
      console.log(`   Tooth: ${img.toothNumber || 'N/A'}`);
      console.log(`   Date: ${img.date}`);
      
      // Check URL type
      if (img.imageUrl.startsWith('https://dental.adsolutions-eg.com/assets/')) {
        console.log(`   ✅ FTP URL\n`);
      } else if (img.imageUrl.startsWith('/clinical-images/') || img.imageUrl.startsWith('clinical-images/')) {
        console.log(`   ⚠️ LOCAL PATH - should be FTP URL\n`);
      } else {
        console.log(`   ❓ UNKNOWN URL TYPE\n`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseImages();
