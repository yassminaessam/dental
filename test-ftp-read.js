// Test FTP read (download) operation
require('dotenv').config({ path: '.env.local' });
const { Client } = require('basic-ftp');
const path = require('path');

async function testFtpRead() {
  console.log('\n🧪 Testing FTP Read (Download) Operation\n');
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
  
  // Test with the problematic image from the error
  const testImagePath = 'clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77/622eb126-cd7f-48f1-9b53-5183e8d23a77_x-ray_1763480317830_t1-X-Ray.jpeg';
  
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
    
    // Build remote path
    const remotePath = `${process.env.FTP_BASE_PATH}/${testImagePath}`;
    
    console.log('📋 Download Details:');
    console.log('  Relative path:', testImagePath);
    console.log('  Remote FTP path:', remotePath);
    console.log('  Public URL:', `${process.env.FTP_PUBLIC_URL}/${testImagePath}\n`);
    
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
    console.log('  File type: Image (JPEG)');
    
    // Check if it's a valid image by looking at file signature
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
    
    if (isJpeg) {
      console.log('  ✅ Valid JPEG file signature detected');
    } else if (isPng) {
      console.log('  ✅ Valid PNG file signature detected');
    } else {
      console.log('  ⚠️ Unknown file signature');
    }
    
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
    
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Check if the file exists at the specified path');
    console.log('  2. Verify FTP credentials are correct');
    console.log('  3. Ensure you have read permissions');
    console.log('  4. Try listing the directory contents to see available files');
    
    process.exit(1);
  } finally {
    client.close();
  }
}

testFtpRead();
