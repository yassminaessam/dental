// Fix broken FTP image paths that have /www/ in them
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBrokenPaths() {
  console.log('\n🔍 Finding broken image paths...\n');
  
  try {
    // Find all clinical images
    const images = await prisma.clinicalImage.findMany();
    
    console.log(`📊 Total images found: ${images.length}\n`);
    
    const brokenImages = images.filter(img => 
      img.image_url && img.image_url.includes('/www/clinical-images/')
    );
    
    if (brokenImages.length === 0) {
      console.log('✅ No broken images found! All paths look good.\n');
      return;
    }
    
    console.log(`❌ Found ${brokenImages.length} broken images:\n`);
    
    for (const img of brokenImages) {
      console.log('─'.repeat(60));
      console.log('ID:', img.id);
      console.log('Patient:', img.patient);
      console.log('Type:', img.type);
      console.log('Date:', img.date);
      console.log('❌ BROKEN URL:', img.image_url);
      console.log('✅ SHOULD BE:', img.image_url.replace('/www/clinical-images/', '/clinical-images/'));
      console.log('');
    }
    
    console.log('─'.repeat(60));
    console.log('\n⚠️  These images need to be deleted and re-uploaded with correct paths.\n');
    console.log('Options:');
    console.log('  1. Delete from database (recommended - then re-upload):');
    console.log('     Use Medical Records page → Delete button');
    console.log('  2. Delete from FTP server:');
    console.log('     Connect via FTP and delete files in /www/clinical-images/');
    console.log('  3. Move files on FTP server (advanced):');
    console.log('     Move from /www/clinical-images/ to /clinical-images/\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixBrokenPaths();
