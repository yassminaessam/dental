const { Client } = require('basic-ftp');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testFtpUploadAndRead() {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    console.log('🧪 TEST: Upload and Read Image via FTP\n');
    console.log('=' .repeat(60));

    // Step 1: Create a test image file
    console.log('\n📝 Step 1: Creating test image...');
    const testImagePath = path.join(__dirname, 'test-image-upload.txt');
    const testContent = 'This is a test image file for FTP upload/read test - ' + new Date().toISOString();
    fs.writeFileSync(testImagePath, testContent);
    console.log('✅ Test file created:', testImagePath);

    // Step 2: Connect to FTP
    console.log('\n🔌 Step 2: Connecting to FTP...');
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true',
      secureOptions: {
        rejectUnauthorized: false,
      },
    });
    console.log('✅ Connected to FTP server');

    // Step 3: Create directory and upload test image
    console.log('\n📤 Step 3: Creating directory and uploading test file...');
    const remoteDir = `${process.env.FTP_BASE_PATH}/clinical-images/test-patient`;
    const remotePath = `${remoteDir}/test-upload-${Date.now()}.txt`;
    
    console.log('   Creating directory:', remoteDir);
    await client.ensureDir(remoteDir);
    console.log('✅ Directory ready');
    
    console.log('   Uploading to:', remotePath);
    await client.uploadFrom(testImagePath, remotePath);
    console.log('✅ File uploaded successfully');

    // Step 4: Read it back
    console.log('\n📥 Step 4: Reading file back from FTP...');
    const downloadPath = path.join(__dirname, 'test-image-download.txt');
    await client.downloadTo(downloadPath, remotePath);
    console.log('✅ File downloaded successfully');

    // Step 5: Verify content
    console.log('\n🔍 Step 5: Verifying content...');
    const downloadedContent = fs.readFileSync(downloadPath, 'utf8');
    
    if (downloadedContent === testContent) {
      console.log('✅ Content matches! Upload and read successful!');
      console.log('   Original:', testContent);
      console.log('   Downloaded:', downloadedContent);
    } else {
      console.log('❌ Content mismatch!');
      console.log('   Original:', testContent);
      console.log('   Downloaded:', downloadedContent);
    }

    // Step 6: Calculate relative path for proxy
    console.log('\n🔗 Step 6: FTP Proxy Information');
    const relativePath = remotePath.replace(process.env.FTP_BASE_PATH + '/', '');
    console.log('   Full FTP Path:', remotePath);
    console.log('   Relative Path:', relativePath);
    console.log('   Proxy URL:', `/api/ftp-proxy?path=${encodeURIComponent(relativePath)}`);
    console.log('   Public URL:', `${process.env.FTP_PUBLIC_URL}/${relativePath}`);

    // Clean up
    console.log('\n🧹 Cleaning up test files...');
    fs.unlinkSync(testImagePath);
    fs.unlinkSync(downloadPath);
    console.log('✅ Test files cleaned up');

    // Delete from FTP
    console.log('🧹 Deleting test file from FTP...');
    await client.remove(remotePath);
    console.log('✅ Test file removed from FTP');

    console.log('\n' + '='.repeat(60));
    console.log('✅ ✅ ✅  ALL TESTS PASSED  ✅ ✅ ✅');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Error details:', error);
  } finally {
    client.close();
  }
}

testFtpUploadAndRead();
