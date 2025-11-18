// Script to delete broken image records from the database AND FTP server
// Run with: node scripts/delete-broken-images.js

const { PrismaClient } = require('@prisma/client');
const { Client } = require('basic-ftp');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function deleteFromFTP(imageUrl) {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    console.log('  🔹 Connecting to FTP server...');
    
    // Connect to FTP server
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true',
      secureOptions: {
        rejectUnauthorized: false,
      },
    });

    console.log('  ✅ FTP connected');

    // Extract relative path from URL
    const url = new URL(imageUrl);
    const relativePath = url.pathname.replace(/^\/assets\//, '');
    const remotePath = path.posix.join(process.env.FTP_BASE_PATH, relativePath);

    console.log('  🔹 Deleting file from FTP:', remotePath);
    
    try {
      await client.remove(remotePath);
      console.log('  ✅ File deleted from FTP server');
    } catch (error) {
      console.log('  ⚠️  File not found on FTP (may have already been deleted)');
    }

  } catch (error) {
    console.error('  ❌ FTP error:', error.message);
  } finally {
    client.close();
  }
}

async function deleteBrokenImages() {
  try {
    console.log('🔍 Finding broken image records...');
    
    // Find all images with the broken FTP URL pattern
    const brokenImages = await prisma.clinicalImage.findMany({
      where: {
        imageUrl: {
          contains: 'dental.adsolutions-eg.com'
        }
      }
    });

    console.log(`Found ${brokenImages.length} broken image(s)`);

    if (brokenImages.length === 0) {
      console.log('✅ No broken images found!');
      return;
    }

    // Display and delete each broken image
    for (let i = 0; i < brokenImages.length; i++) {
      const img = brokenImages[i];
      console.log(`\n${i + 1}. Image ID: ${img.id}`);
      console.log(`   Patient: ${img.patient}`);
      console.log(`   Type: ${img.type}`);
      console.log(`   URL: ${img.imageUrl}`);
      
      // Delete from FTP server
      await deleteFromFTP(img.imageUrl);
    }

    console.log('\n🗑️  Deleting database records...');
    
    // Delete all broken images from database
    const result = await prisma.clinicalImage.deleteMany({
      where: {
        imageUrl: {
          contains: 'dental.adsolutions-eg.com'
        }
      }
    });

    console.log(`✅ Successfully deleted ${result.count} database record(s)!`);
    console.log('\n💡 You can now upload fresh images that will be properly stored on the FTP server.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteBrokenImages();
