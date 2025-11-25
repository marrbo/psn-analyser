// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '../../../lib/db-health';

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    
    if (!health.healthy) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Database is not available',
          error: health.error
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json({
      status: 'ok',
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
      database: health.details
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}