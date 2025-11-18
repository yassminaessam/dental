/**
 * Test Clinical Images API
 * Verifies the API endpoint is returning images correctly
 */

async function testClinicalImagesAPI() {
  console.log('🧪 Testing Clinical Images API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const apiUrl = 'http://localhost:3000/api/clinical-images';

  try {
    console.log('📤 Fetching from:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    console.log('📥 Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.log('❌ API returned error status:', response.status);
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ API Response Successful');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('Total Images:', data.images?.length || 0);
    
    if (data.images && data.images.length > 0) {
      console.log('\n📋 Images Data:\n');
      data.images.forEach((img, index) => {
        console.log(`${index + 1}. ${img.patient} - ${img.type}`);
        console.log(`   ID: ${img.id}`);
        console.log(`   URL: ${img.imageUrl}`);
        console.log(`   Caption: ${img.caption || 'N/A'}`);
        console.log(`   Date: ${img.date}`);
        console.log('');
      });
      
      console.log('✅ API is returning image data correctly\n');
      
      // Test first image URL
      const firstImage = data.images[0];
      console.log('🔍 Testing first image URL accessibility...');
      console.log('URL:', firstImage.imageUrl);
      
      try {
        const imageResponse = await fetch(firstImage.imageUrl);
        console.log('Image Status:', imageResponse.status, imageResponse.statusText);
        console.log('Content-Type:', imageResponse.headers.get('content-type'));
        
        if (imageResponse.status === 404) {
          console.log('\n⚠️  Image URL returns 404 - Image not found on FTP server');
          console.log('\nPossible issues:');
          console.log('1. Domain dental.adsolutions-eg.com is not configured');
          console.log('2. File was not actually uploaded to FTP server');
          console.log('3. FTP directory structure is incorrect');
          console.log('4. Web server is not serving files from the expected path');
          console.log('\nTo fix:');
          console.log('1. Verify domain DNS and web server configuration');
          console.log('2. Check FTP server has the file at the expected path');
          console.log('3. Try uploading a new image to test the current setup');
        } else if (imageResponse.ok) {
          console.log('✅ Image is accessible!');
        }
      } catch (err) {
        console.log('⚠️  Could not fetch image:', err.message);
        console.log('This is expected if domain is not configured yet');
      }
      
    } else {
      console.log('\n⚠️  API returned no images');
      console.log('The database has images but API is not returning them');
    }

  } catch (error) {
    console.error('\n❌ Error testing API:', error.message);
    console.error('\nMake sure:');
    console.error('1. Next.js dev server is running (npm run dev)');
    console.error('2. Server is accessible at http://localhost:3000');
    console.error('3. Database connection is working');
  }
}

testClinicalImagesAPI();
