// Test FTP read (download) operation with direct credentials
const { Client } = require('basic-ftp');

async function testFtpRead() {
  console.log('\n🧪 Testing FTP Read (Download) Operation\n');
  console.log('='.repeat(60));
  
  const config = {
    host: 'ftps5.us.freehostia.com',
    user: 'dental_dental.adsolutions-eg.com',
    password: 'Smsm@2103',
    secure: true,
    basePath: '/www/dental.adsolutions-eg.com/assets',
    publicUrl: 'https://dental.adsolutions-eg.com/assets'
  };
  
  // Test with the file we just uploaded
  const testFilePath = 'clinical-images/test-patient-123/test-upload-1763542518908.txt';
  
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
    
    // Check current working directory
    const cwd = await client.pwd();
    console.log('📂 Current working directory:', cwd);
    
    // Change to root
    await client.cd('/');
    console.log('📂 Changed to root directory: /\n');
    
    // Build remote path
    const remotePath = `${config.basePath}/${testFilePath}`;
    
    console.log('📋 Download Details:');
    console.log('  Relative path:', testFilePath);
    console.log('  Remote FTP path:', remotePath);
    console.log('  Public URL:', `${config.publicUrl}/${testFilePath}\n`);
    
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
    console.log('  Content:', buffer.toString('utf-8'));
    
    console.log('\n' + '='.repeat(60));
    console.log('✅✅ DOWNLOAD TEST PASSED!');
    console.log('='.repeat(60));
    console.log('\n📋 File successfully downloaded from:');
    console.log('  ', remotePath);
    
  } catch (error) {
    console.error('\n❌ Download test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  } finally {
    client.close();
  }
}

testFtpRead();
