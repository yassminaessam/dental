const { Client } = require('basic-ftp');
require('dotenv').config();

async function checkFTPImage() {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    console.log('🔹 Checking if image exists on FTP server...\n');

    // The image path from database
    const imagePath = '/www/dental.adsolutions-eg.com/assets/clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77/622eb126-cd7f-48f1-9b53-5183e8d23a77_x-ray_1763480317830_t1-X-Ray.jpeg';
    
    console.log('Image path:', imagePath);
    console.log('\n🔹 Connecting to FTP...');

    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true',
      secureOptions: {
        rejectUnauthorized: false,
      },
    });

    console.log('✅ Connected\n');

    // Navigate to the patient's image directory
    const imageDir = '/www/dental.adsolutions-eg.com/assets/clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77';
    console.log('🔹 Navigating to:', imageDir);
    
    await client.cd(imageDir);
    console.log('✅ Directory exists\n');

    // List files in this directory
    console.log('🔹 Listing files in directory:');
    const list = await client.list();
    
    if (list.length > 0) {
      console.log(`\nFound ${list.length} files:`);
      list.forEach(item => {
        if (item.type === 1) { // File
          console.log(`  ✅ ${item.name}`);
          console.log(`     Size: ${item.size} bytes`);
          console.log(`     Modified: ${item.modifiedAt}`);
        }
      });
      
      // Check if our specific file exists
      const targetFileName = '622eb126-cd7f-48f1-9b53-5183e8d23a77_x-ray_1763480317830_t1-X-Ray.jpeg';
      const fileExists = list.some(item => item.name === targetFileName && item.type === 1);
      
      if (fileExists) {
        console.log(`\n✅ Image file EXISTS on FTP server!`);
        console.log(`   Public URL: https://dental.adsolutions-eg.com/assets/clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77/${targetFileName}`);
      } else {
        console.log(`\n❌ Image file NOT FOUND on FTP server`);
        console.log(`   Expected filename: ${targetFileName}`);
      }
    } else {
      console.log('❌ Directory is empty');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    client.close();
  }
}

checkFTPImage();
