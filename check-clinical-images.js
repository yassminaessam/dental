/**
 * Check Clinical Images in Database
 * Verifies if there are any clinical images stored in Neon database
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkClinicalImages() {
  console.log('🔍 Checking Clinical Images in Database');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Count total images
    const imageCount = await prisma.clinicalImage.count();
    console.log('📊 Total Clinical Images:', imageCount);

    if (imageCount === 0) {
      console.log('\n⚠️  No clinical images found in database!');
      console.log('This is why images are not appearing on the medical records page.');
      console.log('\nTo add test images:');
      console.log('1. Go to Medical Records page (صور سريرية)');
      console.log('2. Click "Upload Image" button');
      console.log('3. Select a patient and upload an image');
      console.log('4. The image will be uploaded to FTP and saved to database');
      return;
    }

    // Fetch all images
    console.log('\n📋 Clinical Images:\n');
    const images = await prisma.clinicalImage.findMany({
      orderBy: {
        date: 'desc',
      },
      take: 10, // Show last 10 images
    });

    images.forEach((image, index) => {
      console.log(`${index + 1}. ${image.patient} - ${image.type}`);
      console.log(`   ID: ${image.id}`);
      console.log(`   Patient ID: ${image.patientId || 'N/A'}`);
      console.log(`   URL: ${image.imageUrl}`);
      console.log(`   Caption: ${image.caption || 'N/A'}`);
      console.log(`   Date: ${image.date}`);
      console.log('');
    });

    console.log('\n✅ Images are stored in database');
    console.log('\nIf images are not appearing:');
    console.log('1. Check browser console for errors');
    console.log('2. Verify API endpoint /api/clinical-images is working');
    console.log('3. Check if image URLs are accessible');
    console.log('4. Verify Next.js dev server is running');

    // Check image URL formats
    console.log('\n🔗 Image URL Formats:');
    const urlTypes = images.reduce((acc, img) => {
      if (img.imageUrl.startsWith('http://') || img.imageUrl.startsWith('https://')) {
        acc.ftp++;
      } else {
        acc.local++;
      }
      return acc;
    }, { ftp: 0, local: 0 });

    console.log(`FTP URLs (https://...): ${urlTypes.ftp}`);
    console.log(`Local URLs (/clinical-images/...): ${urlTypes.local}`);

  } catch (error) {
    console.error('\n❌ Error checking clinical images:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClinicalImages();
