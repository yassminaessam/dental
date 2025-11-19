// Test downloading the specific image that's failing
const { Client } = require('basic-ftp');

async function testSpecificImage() {
  console.log('\n🧪 Testing Download of Specific Image\n');
  console.log('='.repeat(60));
  
  const config = {
    host: 'ftps5.us.freehostia.com',
    user: 'dental_dental.adsolutions-eg.com',
    password: 'Smsm@2103',
    secure: true,
    basePath: '', // Empty - use FTP home directory directly
  };
  
  // The exact path that's failing in the proxy
  const imagePath = 'clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77/622eb126-cd7f-48f1-9b53-5183e8d23a77_x-ray_1763546205737_t15.jpeg';
  
  console.log('📋 Configuration:');
  console.log('  FTP_HOST:', config.host);
  console.log('  FTP_USER:', config.user);
  console.log('  FTP_BASE_PATH:', config.basePath || '(empty)');
  console.log('  Image Path:', imagePath);
  console.log('='.repeat(60) + '\n');
  
  const client = new Client();
  client.ftp.verbose = true;
  
  try {
    // Connect to FTP
    console.log('🔹 Connecting to FTP server...');
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      secure: config.secure,
      secureOptions: {
        rejectUnauthorized: false,
      },
    });
    console.log('✅ Connected!\n');
    
    // Check current working directory (FTP home)
    const cwd = await client.pwd();
    console.log('📂 Current FTP Directory:', cwd);
    
    // Ensure we're at FTP home
    await client.cd('/');
    const homeCwd = await client.pwd();
    console.log('📂 After cd(\'/\'):', homeCwd);
    console.log('');
    
    // Build remote path (same as FTP proxy does)
    const remotePath = config.basePath 
      ? `${config.basePath}/${imagePath}`
      : imagePath;
    
    console.log('📋 Download Details:');
    console.log('  Remote path:', remotePath);
    console.log('  Expected server location: /www/dental.adsolutions-eg.com/assets/' + imagePath);
    console.log('');
    
    // List the directory to verify file exists
    const dir = remotePath.substring(0, remotePath.lastIndexOf('/'));
    const fileName = remotePath.substring(remotePath.lastIndexOf('/') + 1);
    
    console.log('🔹 Listing directory:', dir);
    try {
      await client.cd(dir);
      const files = await client.list();
      console.log('✅ Directory contents:');
      files.forEach(f => {
        const marker = f.name === fileName ? '👉' : '  ';
        console.log(`  ${marker} ${f.name} (${f.size} bytes)`);
      });
      console.log('');
      
      const fileExists = files.some(f => f.name === fileName);
      if (!fileExists) {
        console.error('❌ File NOT found in directory!');
        console.error('   Looking for:', fileName);
        return;
      }
      console.log('✅ File found in directory!\n');
      
      // Go back to home directory for download
      await client.cd('/');
    } catch (error) {
      console.error('❌ Failed to list directory:', error.message);
      return;
    }
    
    // Download file
    console.log('🔹 Attempting to download from:', remotePath);
    
    const chunks = [];
    const { Writable } = require('stream');
    const downloadStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });
    
    await client.downloadTo(downloadStream, remotePath);
    await new Promise((resolve) => downloadStream.end(resolve));
    
    const buffer = Buffer.concat(chunks);
    console.log('✅ File downloaded successfully!');
    console.log('  Downloaded size:', buffer.length, 'bytes');
    console.log('  File type: JPEG image');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅✅ DOWNLOAD TEST PASSED!');
    console.log('='.repeat(60));
    console.log('\n💡 The file exists and can be downloaded.');
    console.log('   The FTP proxy should work with this path.\n');
    
  } catch (error) {
    console.error('\n❌ Download test failed:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.constructor.name);
      console.error('Error message:', error.message);
      if (error.message.includes('No such file')) {
        console.error('\n💡 File not found. Possible reasons:');
        console.error('   1. File was not uploaded successfully');
        console.error('   2. File path is different than expected');
        console.error('   3. FTP home directory is not /www/dental.adsolutions-eg.com/assets/');
      }
    }
    process.exit(1);
  } finally {
    client.close();
  }
}

testSpecificImage();
