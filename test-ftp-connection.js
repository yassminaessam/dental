const { Client } = require('basic-ftp');
require('dotenv').config();

async function testFTPConnection() {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    console.log('🔹 Testing FTP connection...\n');
    console.log('Configuration:');
    console.log('  Host:', process.env.FTP_HOST);
    console.log('  User:', process.env.FTP_USER);
    console.log('  Secure:', process.env.FTP_SECURE === 'true');
    console.log('  Base Path:', process.env.FTP_BASE_PATH);
    console.log('  Public URL:', process.env.FTP_PUBLIC_URL);
    console.log('\n🔹 Connecting...');

    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true',
      secureOptions: {
        rejectUnauthorized: false,
      },
    });

    console.log('✅ Connected successfully!\n');

    // Check if base path exists
    console.log('🔹 Checking base path:', process.env.FTP_BASE_PATH);
    try {
      await client.cd(process.env.FTP_BASE_PATH);
      console.log('✅ Base path exists\n');
    } catch (error) {
      console.log('❌ Base path does not exist:', error.message);
      console.log('🔹 Attempting to create base path...');
      await client.ensureDir(process.env.FTP_BASE_PATH);
      console.log('✅ Base path created\n');
    }

    // Check clinical-images directory
    const clinicalImagesPath = `${process.env.FTP_BASE_PATH}/clinical-images`;
    console.log('🔹 Checking clinical-images directory:', clinicalImagesPath);
    try {
      await client.cd(clinicalImagesPath);
      console.log('✅ clinical-images directory exists\n');
      
      // List files in clinical-images
      console.log('🔹 Listing files in clinical-images...');
      const list = await client.list();
      if (list.length > 0) {
        console.log(`Found ${list.length} items:`);
        list.forEach(item => {
          console.log(`  - ${item.name} (${item.type === 1 ? 'file' : 'directory'}, ${item.size} bytes)`);
        });
      } else {
        console.log('  Directory is empty');
      }
    } catch (error) {
      console.log('⚠️ clinical-images directory does not exist yet');
      console.log('  It will be created automatically on first upload');
    }

    console.log('\n✅ FTP connection test completed successfully!');
  } catch (error) {
    console.error('\n❌ FTP connection failed:');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Code:', error.code);
    }
  } finally {
    client.close();
  }
}

testFTPConnection();
