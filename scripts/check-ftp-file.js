// Check if a specific file exists on FTP server
const { Client } = require('basic-ftp');

async function checkFile() {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    console.log('🔹 Connecting to FTP server...');
    await client.access({
      host: process.env.FTP_HOST || 'ftps5.us.freehostia.com',
      user: process.env.FTP_USER || 'mobar_37677514',
      password: process.env.FTP_PASSWORD,
      secure: false,
    });

    console.log('✅ Connected to FTP server');

    // Navigate to the directory
    const basePath = '/www/dental.adsolutions-eg.com/assets/clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77';
    console.log(`\n🔹 Navigating to: ${basePath}`);
    
    try {
      await client.cd(basePath);
      console.log('✅ Directory exists');
      
      // List files in directory
      const list = await client.list();
      console.log(`\n📁 Files in directory (${list.length}):`);
      list.forEach(item => {
        console.log(`  - ${item.name} (${item.size} bytes, ${item.type === 1 ? 'file' : 'directory'})`);
      });

      // Try to get specific file info
      const targetFile = '622eb126-cd7f-48f1-9b53-5183e8d23a77_x-ray_1763480317830_t1-X-Ray.jpeg';
      const fileExists = list.some(item => item.name === targetFile);
      
      if (fileExists) {
        console.log(`\n✅ Target file found: ${targetFile}`);
        const file = list.find(item => item.name === targetFile);
        console.log(`   Size: ${file.size} bytes`);
        console.log(`   Public URL: https://dental.adsolutions-eg.com/assets/clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77/${targetFile}`);
      } else {
        console.log(`\n❌ Target file NOT found: ${targetFile}`);
        console.log('   Expected URL: https://dental.adsolutions-eg.com/assets/clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77/' + targetFile);
      }

    } catch (error) {
      console.error('❌ Directory does not exist or cannot be accessed');
      console.error('Error:', error.message);
    }

  } catch (error) {
    console.error('❌ FTP Error:', error);
  } finally {
    client.close();
  }
}

checkFile();
