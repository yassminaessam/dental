const http = require('http');

const imagePath = 'clinical-images/622eb126-cd7f-48f1-9b53-5183e8d23a77/622eb126-cd7f-48f1-9b53-5183e8d23a77_x-ray_1763480317830_t1-X-Ray.jpeg';
const apiUrl = `http://localhost:9002/api/ftp-proxy?path=${encodeURIComponent(imagePath)}`;

console.log('🔍 Testing FTP Proxy API...\n');
console.log('URL:', apiUrl, '\n');

http.get(apiUrl, (res) => {
  console.log('✅ Response Status:', res.statusCode);
  console.log('✅ Content-Type:', res.headers['content-type']);
  
  if (res.statusCode === 200) {
    let size = 0;
    res.on('data', (chunk) => {
      size += chunk.length;
    });
    
    res.on('end', () => {
      console.log('✅ Image Size:', size, 'bytes');
      console.log('\n✅ FTP Proxy is working! Image downloaded successfully.');
    });
  } else {
    let errorData = '';
    res.on('data', (chunk) => {
      errorData += chunk.toString();
    });
    
    res.on('end', () => {
      console.log('❌ Error Response:', errorData);
    });
  }
}).on('error', (err) => {
  console.error('\n❌ Request Error:', err.message);
  console.error('\nMake sure your dev server is running on http://localhost:9002');
});
