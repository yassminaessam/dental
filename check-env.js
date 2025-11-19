// Check what environment variables are actually loaded
require('dotenv').config({ path: '.env.local' });

console.log('Environment variables from .env.local:');
console.log('FTP_HOST:', process.env.FTP_HOST);
console.log('FTP_USER:', process.env.FTP_USER);
console.log('FTP_PASSWORD:', process.env.FTP_PASSWORD);
console.log('FTP_SECURE:', process.env.FTP_SECURE);
console.log('FTP_BASE_PATH:', process.env.FTP_BASE_PATH);
console.log('FTP_PUBLIC_URL:', process.env.FTP_PUBLIC_URL);
