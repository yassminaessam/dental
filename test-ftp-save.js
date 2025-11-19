// Test FTP save (upload) operation
require('dotenv').config({ path: '.env.local' });
const { Client } = require('basic-ftp');
const path = require('path');

async function testFtpSave() {
  console.log('\n🧪 Testing FTP Save (Upload) Operation\n');
  console.log('='.repeat(60));
  
  // Show configuration
  console.log('📋 Configuration:');
  console.log('  FTP_HOST:', process.env.FTP_HOST);
  console.log('  FTP_USER:', process.env.FTP_USER);
  console.log('  FTP_PASSWORD:', process.env.FTP_PASSWORD ? '***' + process.env.FTP_PASSWORD.slice(-4) : '(not set)');
  console.log('  FTP_BASE_PATH:', process.env.FTP_BASE_PATH);
  console.log('  FTP_PUBLIC_URL:', process.env.FTP_PUBLIC_URL);
  console.log('='.repeat(60) + '\n');
  
  if (!process.env.FTP_HOST || !process.env.FTP_USER || !process.env.FTP_PASSWORD) {
    console.error('❌ FTP credentials not configured in .env.local');
    process.exit(1);
  }
  
  const client = new Client();
  client.ftp.verbose = true;
  
  try {
    // Connect to FTP
    console.log('🔹 Connecting to FTP server...');
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true',
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
    const remotePath = path.posix.join(process.env.FTP_BASE_PATH, relativePath);
    const publicUrl = `${process.env.FTP_PUBLIC_URL}/${relativePath}`;
    
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
