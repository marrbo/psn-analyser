// app/api/games/[npCommunicationId]/route.ts
import { TrophyService } from '@/lib/psn/trophy-service';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ npCommunicationId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return NextResponse.json({ message: 'GET working' });
}

export async function POST(request: NextRequest) {
  const { id } = await request.json();
  TrophyService.getLastAnalysis(id);
  return NextResponse.json({ message: 'POST working' });
}