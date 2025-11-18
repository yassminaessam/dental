/**
 * Direct FTP Upload Test
 * Tests FTP storage driver directly without needing the dev server
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Create a simple test image (1x1 pixel PNG - red dot)
const testImageBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64'
);

console.log('🧪 FTP Upload Test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check environment variables
console.log('📋 Configuration:');
console.log('USE_FTP_STORAGE:', process.env.USE_FTP_STORAGE);
console.log('FTP_HOST:', process.env.FTP_HOST);
console.log('FTP_USER:', process.env.FTP_USER);
console.log('FTP_PASSWORD:', process.env.FTP_PASSWORD ? '***' : 'NOT SET');
console.log('FTP_SECURE:', process.env.FTP_SECURE);
console.log('FTP_BASE_PATH:', process.env.FTP_BASE_PATH);
console.log('FTP_PUBLIC_URL:', process.env.FTP_PUBLIC_URL);
console.log();

if (process.env.USE_FTP_STORAGE !== 'true') {
  console.log('⚠️  FTP storage is disabled (USE_FTP_STORAGE !== true)');
  console.log('Set USE_FTP_STORAGE=true in .env to enable FTP');
  process.exit(1);
}

if (!process.env.FTP_HOST || !process.env.FTP_USER || !process.env.FTP_PASSWORD) {
  console.log('❌ FTP credentials not configured in .env');
  console.log('Required: FTP_HOST, FTP_USER, FTP_PASSWORD');
  process.exit(1);
}

// Import FTP driver
async function testFTPUpload() {
  try {
    console.log('📦 Loading FTP driver...');
    const { createFTPDriver } = require('./src/lib/storage/ftp-driver');
    
    const ftpConfig = {
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true',
      basePath: process.env.FTP_BASE_PATH || '/www',
      publicUrl: process.env.FTP_PUBLIC_URL || '',
    };
    
    console.log('✅ FTP driver loaded\n');
    
    const driver = createFTPDriver(ftpConfig);
    
    if (!driver.isConfigured()) {
      console.log('❌ FTP driver not properly configured');
      process.exit(1);
    }
    
    console.log('✅ FTP driver configured\n');
    
    console.log('📤 Uploading test image...');
    console.log('Patient ID: test-patient-ftp-001');
    console.log('Image Type: x-ray');
    console.log('File Size:', testImageBuffer.length, 'bytes');
    console.log();
    
    const timestamp = Date.now();
    const fileName = `test-patient-ftp-001_x-ray_${timestamp}_test-image.png`;
    
    const result = await driver.upload({
      buffer: testImageBuffer,
      originalName: 'test-image.png',
      contentType: 'image/png',
      category: 'clinical-images',
      subPath: 'test-patient-ftp-001',
      fileName: fileName
    });
    
    console.log('✅ Upload successful!\n');
    console.log('📊 Upload Result:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Driver:', result.driver);
    console.log('Path:', result.path);
    console.log('URL:', result.url);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔍 Testing public URL accessibility...');
    
    // Test if URL is accessible
    const https = require('https');
    const http = require('http');
    const urlObj = new URL(result.url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    protocol.get(result.url, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Image is accessible via public URL!');
        console.log('Status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Content-Length:', res.headers['content-length']);
        console.log('\n✅ FTP UPLOAD TEST PASSED!');
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        console.log('↪️  Redirect detected:', res.statusCode);
        console.log('Location:', res.headers.location);
        console.log('✅ FTP upload successful (redirect is normal)');
      } else {
        console.log('⚠️  Unexpected status:', res.statusCode);
        console.log('Note: Image may still be uploaded, check FTP server manually');
      }
    }).on('error', (err) => {
      console.log('⚠️  Could not verify URL:', err.message);
      console.log('Note: Image is uploaded to FTP, but URL may need DNS/domain configuration');
      console.log('✅ FTP upload completed successfully');
    });
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testFTPUpload();
