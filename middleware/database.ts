// Middleware para conexão (opcional)
// middleware/database.ts

import { MongoDBConnection } from '@/lib/mongodb-connection';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function databaseMiddleware(request: NextRequest) {
  try {
    const connection = MongoDBConnection.getInstance();
    await connection.getConnection();
    
    return NextResponse.next();
  } finally {
    // Clean up resources here if needed
  }
}