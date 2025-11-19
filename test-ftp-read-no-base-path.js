// Test FTP read (download) with empty base path
const { Client } = require('basic-ftp');

async function testFtpRead() {
  console.log('\n🧪 Testing FTP Read with Empty Base Path\n');
  console.log('='.repeat(60));
  
  const config = {
    host: 'ftps5.us.freehostia.com',
    user: 'dental_dental.adsolutions-eg.com',
    password: 'Smsm@2103',
    secure: true,
    basePath: '', // Empty - use FTP home directory directly
    publicUrl: 'https://dental.adsolutions-eg.com/assets'
  };
  
  // Test with the file we uploaded in the previous test
  const testFilePath = 'clinical-images/test-patient-456/test-no-base-path-1763543203406.txt';
  
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
    console.log('📂 FTP Home Directory:', cwd);
    
    // Ensure we're at FTP home
    await client.cd('/');
    console.log('📂 Set to FTP home directory\n');
    
    // Build remote path
    const remotePath = config.basePath 
      ? `${config.basePath}/${testFilePath}`
      : testFilePath;
    
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
    console.log('  FTP path:', remotePath);
    console.log('  Absolute server path: /www/dental.adsolutions-eg.com/assets/' + testFilePath);
    
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
