import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/services/database';

export async function GET() {
  try {
    const isHealthy = await checkDatabaseHealth();
    
    if (isHealthy) {
      return NextResponse.json({ 
        status: 'healthy', 
        database: 'neon-postgresql',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        status: 'unhealthy', 
        database: 'neon-postgresql',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}