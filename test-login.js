// Test login with the seeded admin user
const testLogin = async () => {
  try {
    console.log('🧪 Testing JWT Login API...');
    
    const response = await fetch('http://localhost:9002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@cairodental.com',
        password: 'Admin123!'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Login failed:', error);
      return;
    }

    const data = await response.json();
    console.log('✅ Login successful!');
    console.log('👤 User:', data.user.firstName, data.user.lastName);
    console.log('🔑 Role:', data.user.role);
    console.log('🎫 Token (first 50 chars):', data.token.substring(0, 50) + '...');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testLogin();