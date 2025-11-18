/**
 * Test FTP Upload - Clinical Image
 * Tests the FTP storage driver by uploading a test image
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Create a simple test image (1x1 pixel PNG)
const testImageBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Save test image temporarily
const testImagePath = path.join(__dirname, 'test-clinical-image.png');
fs.writeFileSync(testImagePath, testImageBuffer);
console.log('✅ Created test image:', testImagePath);

// Prepare form data
const form = new FormData();
form.append('file', fs.createReadStream(testImagePath), {
  filename: 'test-clinical-image.png',
  contentType: 'image/png',
});
form.append('category', 'clinical-images');
form.append('patientId', 'test-patient-001');
form.append('imageType', 'x-ray');

console.log('\n📤 Uploading test image to FTP...');
console.log('Patient ID: test-patient-001');
console.log('Image Type: x-ray');
console.log('Storage: FTP (Freehostia)');

// Upload to API
const uploadUrl = 'http://localhost:3000/api/uploads';

form.submit(uploadUrl, (err, res) => {
  if (err) {
    console.error('❌ Upload failed:', err.message);
    cleanup();
    process.exit(1);
  }

  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\n📥 Response received:');
    
    try {
      const result = JSON.parse(responseData);
      
      if (res.statusCode === 200) {
        console.log('✅ Upload successful!');
        console.log('\nUpload Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Driver:', result.driver);
        console.log('URL:', result.url);
        console.log('Path:', result.path);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (result.driver === 'ftp') {
          console.log('\n✅ FTP Storage Working!');
          console.log('\nYou can verify the image at:');
          console.log(result.url);
          
          // Try to verify the URL is accessible
          console.log('\n🔍 Verifying image accessibility...');
          verifyImageUrl(result.url);
        } else {
          console.log('\n⚠️  Fallback to local storage (FTP not configured)');
        }
      } else {
        console.log('❌ Upload failed with status:', res.statusCode);
        console.log('Response:', result);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response:', responseData);
    }
    
    cleanup();
  });
});

function verifyImageUrl(url) {
  const urlObj = new URL(url);
  const protocol = urlObj.protocol === 'https:' ? https : require('http');
  
  protocol.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Image is accessible via public URL!');
      console.log('Status:', res.statusCode);
      console.log('Content-Type:', res.headers['content-type']);
    } else {
      console.log('⚠️  Image URL returned status:', res.statusCode);
      console.log('Note: This might be normal if the domain is not fully configured yet.');
    }
  }).on('error', (err) => {
    console.log('⚠️  Could not verify URL (this is expected for test domains):', err.message);
  });
}

function cleanup() {
  // Clean up test image
  try {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('\n🧹 Cleaned up test file');
    }
  } catch (err) {
    console.error('Warning: Could not clean up test file:', err.message);
  }
}

process.on('SIGINT', () => {
  console.log('\n\nInterrupted by user');
  cleanup();
  process.exit(0);
});
