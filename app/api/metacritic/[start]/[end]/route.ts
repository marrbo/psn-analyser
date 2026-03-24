import { metacriticScraper } from '@/lib/metacritc-scraper';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ start: string, end: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { start, end } = await context.params;
    const metacritchService = await metacriticScraper.scrapeMultiplePagesParallel(Number(start), Number(end), 50);
  
    return NextResponse.json({ 
      status: 'success',
      message: 'Metacritic data updated!',
      timestamp: new Date().toISOString(),
      metacritchService
    }, { status: 200 });

} catch (error) {
    console.error('Error in /api/metacritic/pages route:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'An error occurred while processing your request.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}