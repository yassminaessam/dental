// Test the /api/auth/register endpoint
const fetch = require('node-fetch');

async function testRegister() {
  console.log('Testing /api/auth/register endpoint...\n');
  
  const testData = {
    email: `teststaff${Date.now()}@example.com`, // Unique email
    password: 'TestPass123',
    firstName: 'Test',
    lastName: 'Staff',
    role: 'doctor',
    phone: '1234567890',
    specialization: 'General Dentistry',
    department: 'Dental'
  };
  
  console.log('Sending payload:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n');
  
  try {
    const response = await fetch('http://localhost:9002/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers));
    console.log('\n');
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    console.log('\n');
    
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      console.log('Response JSON:');
      console.log(JSON.stringify(json, null, 2));
      
      if (response.ok) {
        console.log('\n✅ SUCCESS! User created successfully.');
      } else {
        console.log('\n❌ FAILED! Error:', json.error || json);
      }
    } else {
      const text = await response.text();
      console.log('Response Text:', text);
      console.log('\n❌ FAILED! Non-JSON response');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Check if node-fetch is available
try {
  require.resolve('node-fetch');
  testRegister();
} catch (e) {
  console.log('Installing node-fetch...');
  require('child_process').execSync('npm install node-fetch@2', { stdio: 'inherit' });
  console.log('\nNow run: node test-register-api.js');
}
