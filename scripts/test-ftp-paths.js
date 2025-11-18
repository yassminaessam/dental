// Test FTP upload with detailed logging
const { Client } = require('basic-ftp');
const fs = require('fs');

async function testUpload() {
  const client = new Client();
  client.ftp.verbose = true;

  // Try different possible credential combinations
  const configs = [
    {
      name: 'Config 1: Standard',
      host: 'ftps5.us.freehostia.com',
      user: 'mobar_37677514',
      password: process.env.FTP_PASSWORD || 'your_password_here',
      basePath: '/www/dental.adsolutions-eg.com/assets',
    },
    {
      name: 'Config 2: Without www',
      host: 'ftps5.us.freehostia.com',
      user: 'mobar_37677514',
      password: process.env.FTP_PASSWORD || 'your_password_here',
      basePath: '/dental.adsolutions-eg.com/assets',
    },
    {
      name: 'Config 3: Root assets',
      host: 'ftps5.us.freehostia.com',
      user: 'mobar_37677514',
      password: process.env.FTP_PASSWORD || 'your_password_here',
      basePath: '/assets',
    },
  ];

  for (const config of configs) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${config.name}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      console.log('🔹 Connecting...');
      await client.access({
        host: config.host,
        user: config.user,
        password: config.password,
        secure: false,
      });
      
      console.log('✅ Connected! Listing root directory...');
      const rootList = await client.list();
      console.log('\n📁 Root directory contents:');
      rootList.forEach(item => {
        const type = item.type === 1 ? '📄' : '📁';
        console.log(`  ${type} ${item.name}`);
      });

      // Try to navigate to the base path
      console.log(`\n🔹 Attempting to navigate to: ${config.basePath}`);
      try {
        await client.cd(config.basePath);
        console.log(`✅ Successfully navigated to ${config.basePath}`);
        
        const list = await client.list();
        console.log('\n📁 Directory contents:');
        list.forEach(item => {
          const type = item.type === 1 ? '📄' : '📁';
          console.log(`  ${type} ${item.name}`);
        });
        
        console.log(`\n✅✅ THIS CONFIG WORKS! Use:`);
        console.log(`   FTP_HOST=${config.host}`);
        console.log(`   FTP_USER=${config.user}`);
        console.log(`   FTP_BASE_PATH=${config.basePath}`);
        console.log(`   FTP_PUBLIC_URL=https://dental.adsolutions-eg.com/assets`);
        
      } catch (navError) {
        console.log(`❌ Cannot navigate to ${config.basePath}`);
        console.log(`   Error: ${navError.message}`);
      }

      client.close();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before next attempt
      
    } catch (error) {
      console.error(`❌ Connection failed: ${error.message}`);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('Test complete');
  console.log(`${'='.repeat(60)}`);
}

testUpload();
