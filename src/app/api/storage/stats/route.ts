import { NextRequest, NextResponse } from 'next/server';
import { LocalStorageService } from '@/services/local-storage';

/**
 * Storage statistics API endpoint
 * Returns information about local storage usage
 */

export async function GET(request: NextRequest) {
  try {
    const stats = await LocalStorageService.getStorageStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return NextResponse.json(
      { error: 'Failed to get storage statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}