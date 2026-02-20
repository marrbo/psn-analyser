// app/api/playstation/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PlayStationSearch } from '@/lib/playstation-search';
import { PSNAuth } from '@/lib/psn/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { searchTerm, pageSize = 20, locale = 'pt-BR' } = body;
    
    if (!searchTerm) {
      return NextResponse.json(
        { error: 'Search term is required' },
        { status: 400 }
      );
    }

    // Obter token de autenticação
    const auth = new PSNAuth();
    let authorizationToken: string | null;
    
    try {
      authorizationToken = await auth.getAccessToken();
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Authentication with PlayStation Network failed' },
        { status: 401 }
      );
    }

    // Realizar busca
    const searchService = new PlayStationSearch();
    
    const games = await searchService.search({
      searchTerm,
      authorizationToken: `Bearer ${authorizationToken}`,
      pageSize,
      locale
    });

    // Cache headers para otimização
    const cacheHeaders = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
    };

    return NextResponse.json({
      success: true,
      data: games,
      count: games.length,
      timestamp: new Date().toISOString()
    }, { headers: cacheHeaders });

  } catch (error: any) {
    console.error('PlayStation search API error:', error);
    
    // Tratamento específico de erros
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timeout. Please try again.' },
        { status: 408 }
      );
    }
    
    if (error.message?.includes('Invalid response')) {
      return NextResponse.json(
        { error: 'Invalid response from PlayStation API' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST with search parameters.',
      example: {
        method: 'POST',
        body: {
          searchTerm: 'Rogue Company',
          pageSize: 20,
          locale: 'pt-BR'
        }
      }
    },
    { status: 405 }
  );
}