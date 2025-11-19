// Test FTP save (upload) with empty base path - uploads directly to FTP home directory
const { Client } = require('basic-ftp');
const path = require('path');

async function testFtpSave() {
  console.log('\n🧪 Testing FTP Save with Empty Base Path (Direct to FTP Home)\n');
  console.log('='.repeat(60));
  
  const config = {
    host: 'ftps5.us.freehostia.com',
    user: 'dental_dental.adsolutions-eg.com',
    password: 'Smsm@2103',
    secure: true,
    basePath: '', // Empty - use FTP home directory directly
    publicUrl: 'https://dental.adsolutions-eg.com/assets'
  };
  
  console.log('📋 Configuration:');
  console.log('  FTP_HOST:', config.host);
  console.log('  FTP_USER:', config.user);
  console.log('  FTP_PASSWORD:', '***' + config.password.slice(-4));
  console.log('  FTP_SECURE:', config.secure);
  console.log('  FTP_BASE_PATH:', config.basePath || '(empty - FTP home directory)');
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
    
    // Check current working directory (should be FTP home)
    const cwd = await client.pwd();
    console.log('📂 FTP Home Directory:', cwd);
    console.log('   This is where files will be uploaded\n');
    
    // Create test file content
    const testContent = Buffer.from(`Test file with no base path - created at ${new Date().toISOString()}`);
    const testFileName = `test-no-base-path-${Date.now()}.txt`;
    const testCategory = 'clinical-images';
    const testPatientId = 'test-patient-456';
    
    // Build paths - relative to FTP home directory
    const relativePath = `${testCategory}/${testPatientId}/${testFileName}`;
    const remotePath = config.basePath 
      ? path.posix.join(config.basePath, relativePath)
      : relativePath;
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
    console.log('✅ Directory ready');
    
    // Change back to FTP home directory for upload
    await client.cd('/');
    console.log('✅ Changed back to FTP home directory\n');
    
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
    const uploadedCwd = await client.pwd();
    console.log('  Current directory:', uploadedCwd);
    
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
    console.log('\n📋 File location on FTP server:');
    console.log('  Absolute path:', uploadedCwd + '/' + testFileName);
    console.log('  Public URL:', publicUrl);
    console.log('\n💡 Expected server path (if FTP home is /www/dental.adsolutions-eg.com/assets/):');
    console.log('  /www/dental.adsolutions-eg.com/assets/' + relativePath);
    
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
