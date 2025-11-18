const https = require('https');

const imageUrl = 'https://dental.adsolutions-eg.com/assets/clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77/622eb126-cd7f-48f1-9b53-5183e8d23a77_x-ray_1763480317830_t1-X-Ray.jpeg';

console.log('🔍 Testing if image URL is publicly accessible...\n');
console.log('URL:', imageUrl, '\n');

https.get(imageUrl, (res) => {
  console.log('✅ Status Code:', res.statusCode);
  console.log('✅ Status Message:', res.statusMessage);
  console.log('\n📋 Response Headers:');
  Object.keys(res.headers).forEach(key => {
    console.log(`  ${key}: ${res.headers[key]}`);
  });
  
  let size = 0;
  res.on('data', (chunk) => {
    size += chunk.length;
  });
  
  res.on('end', () => {
    console.log('\n✅ Image Size:', size, 'bytes');
    console.log('\n✅ Image is publicly accessible!');
  });
}).on('error', (err) => {
  console.error('\n❌ Error accessing image:', err.message);
  console.error('\nThe image URL is NOT publicly accessible.');
});
