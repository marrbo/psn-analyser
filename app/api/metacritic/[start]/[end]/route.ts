import { metacriticScraper } from '@/lib/metacritc-scraper';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ start: number, end: number }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { start, end } = await context.params;
    const metacritchService = await metacriticScraper.scrapeMultiplePagesParallel(Number(start), Number(end), 50);
  
    if (metacritchService && metacritchService.length > 0) {
      return NextResponse.json(metacritchService, { status: 200 });
    }
  
    return NextResponse.json({ 
      status: 'success',
      message: 'API is working!',
      timestamp: new Date().toISOString()
  });
} catch (error) {
    console.error('Error in /api/metacritic/pages route:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'An error occurred while processing your request.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}