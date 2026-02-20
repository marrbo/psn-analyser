// app/api/playstation/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Rota principal da API PlayStation
export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'PlayStation API Service',
    version: '1.0.0',
    endpoints: {
      search: {
        path: '/api/playstation/search',
        method: 'POST',
        description: 'Search for PlayStation games',
        parameters: {
          searchTerm: 'string (required)',
          pageSize: 'number (optional, default: 20)',
          locale: 'string (optional, default: pt-BR)'
        }
      },
      auth: {
        path: '/api/auth/psn',
        method: 'POST',
        description: 'Obtain PSN authentication token',
        parameters: {
          username: 'string (required)',
          password: 'string (required)',
          clientId: 'string (required)',
          clientSecret: 'string (required)'
        }
      }
    }
  });
}