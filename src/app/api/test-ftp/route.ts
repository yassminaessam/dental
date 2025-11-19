import { NextResponse } from 'next/server';
import { Client } from 'basic-ftp';

export const runtime = 'nodejs';

// Test FTP connection from Vercel
export async function GET() {
  console.log('\n🧪 Testing FTP Connection from Vercel...\n');
  
  const config = {
    host: process.env.FTP_HOST || '',
    user: process.env.FTP_USER || '',
    password: process.env.FTP_PASSWORD || '',
    secure: process.env.FTP_SECURE === 'true',
  };
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    config: {
      host: config.host ? '✅ Set' : '❌ Missing',
      user: config.user ? '✅ Set' : '❌ Missing',
      password: config.password ? '✅ Set' : '❌ Missing',
      secure: config.secure,
      basePath: process.env.FTP_BASE_PATH || '(empty)',
      publicUrl: process.env.FTP_PUBLIC_URL || '❌ Missing',
    },
    connection: {
      success: false,
      error: null as string | null,
      homeDirectory: null as string | null,
      canListFiles: false,
      fileCount: 0,
    }
  };
  
  // Check if credentials are configured
  if (!config.host || !config.user || !config.password) {
    results.connection.error = 'FTP credentials not configured';
    return NextResponse.json(results, { status: 500 });
  }
  
  const client = new Client();
  client.ftp.verbose = true;
  
  try {
    console.log('Connecting to FTP...');
    
    // Try to connect
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      secure: config.secure,
      secureOptions: {
        rejectUnauthorized: false,
      },
    });
    
    console.log('Connected successfully!');
    results.connection.success = true;
    
    // Get home directory
    const cwd = await client.pwd();
    results.connection.homeDirectory = cwd;
    console.log('Home directory:', cwd);
    
    // Try to list files
    try {
      const files = await client.list();
      results.connection.canListFiles = true;
      results.connection.fileCount = files.length;
      console.log('Can list files:', files.length);
    } catch (error) {
      console.error('Cannot list files:', error);
      results.connection.canListFiles = false;
    }
    
    console.log('✅ FTP test completed successfully');
    
    return NextResponse.json(results, { status: 200 });
    
  } catch (error) {
    console.error('❌ FTP test failed:', error);
    results.connection.error = error instanceof Error ? error.message : 'Unknown error';
    results.connection.success = false;
    
    return NextResponse.json(results, { status: 500 });
  } finally {
    client.close();
  }
}
