// Test FTP save (upload) operation with direct credentials
const { Client } = require('basic-ftp');
const path = require('path');

async function testFtpSave() {
  console.log('\n🧪 Testing FTP Save (Upload) Operation with Direct Credentials\n');
  console.log('='.repeat(60));
  
  const config = {
    host: 'ftps5.us.freehostia.com',
    user: 'dental_dental.adsolutions-eg.com',
    password: 'Smsm@2103',
    secure: true,
    basePath: '/www/dental.adsolutions-eg.com/assets',
    publicUrl: 'https://dental.adsolutions-eg.com/assets'
  };
  
  console.log('📋 Configuration:');
  console.log('  FTP_HOST:', config.host);
  console.log('  FTP_USER:', config.user);
  console.log('  FTP_PASSWORD:', '***' + config.password.slice(-4));
  console.log('  FTP_SECURE:', config.secure);
  console.log('  FTP_BASE_PATH:', config.basePath);
  console.log('  FTP_PUBLIC_URL:', config.publicUrl);
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
    
    // Check current working directory
    const cwd = await client.pwd();
    console.log('📂 Current working directory:', cwd);
    
    // Change to root
    await client.cd('/');
    console.log('📂 Changed to root directory: /\n');
    
    // Create test file content
    const testContent = Buffer.from(`Test file created at ${new Date().toISOString()}`);
    const testFileName = `test-upload-${Date.now()}.txt`;
    const testCategory = 'clinical-images';
    const testPatientId = 'test-patient-123';
    
    // Build paths
    const relativePath = `${testCategory}/${testPatientId}/${testFileName}`;
    const remotePath = path.posix.join(config.basePath, relativePath);
    const publicUrl = `${config.publicUrl}/${relativePath}`;
    
    console.log('📋 Upload Details:');
    console.log('  Relative path:', relativePath);
    console.log('  Remote FTP path:', remotePath);
    console.log('  Public URL:', publicUrl);
    console.log('  File size:', testContent.length, 'bytes\n');
    
    // Create directory structure
    const remoteDir = path.posix.dirname(remotePath);
    console.log('🔹 Creating directory:', remoteDir);
    await client.ensureDir(remoteDir);
    console.log('✅ Directory ready\n');
    
    // Upload file
    console.log('🔹 Uploading file to:', remotePath);
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(testContent);
    
    await client.uploadFrom(bufferStream, remotePath);
    console.log('✅ File uploaded successfully!\n');
    
    // Verify upload by listing directory
    console.log('🔹 Verifying upload...');
    await client.cd(remoteDir);
    const files = await client.list();
    const uploadedFile = files.find(f => f.name === testFileName);
    
    if (uploadedFile) {
      console.log('✅ File verified in directory!');
      console.log('  Name:', uploadedFile.name);
      console.log('  Size:', uploadedFile.size, 'bytes');
      console.log('  Type:', uploadedFile.type === 1 ? 'File' : 'Directory');
    } else {
      console.error('❌ File not found in directory listing!');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅✅ UPLOAD TEST PASSED!');
    console.log('='.repeat(60));
    console.log('\n📋 Expected file location:');
    console.log('  FTP Path:', remotePath);
    console.log('  Public URL:', publicUrl);
    console.log('\n💡 You can test accessing this file at:');
    console.log('  ', publicUrl);
    
  } catch (error) {
    console.error('\n❌ Upload test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  } finally {
    client.close();
  }
}

testFtpSave();
