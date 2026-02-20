// app/api/games/[npCommunicationId]/route.ts
import { PSNAuthTrophyDetailService } from '@/lib/psn/trophy-detail-service';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ npCommunicationId: string, accountId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { npCommunicationId, accountId } = await context.params;
    // const { searchParams } = new URL(request.url);
    // const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId é obrigatório' },
        { status: 400 }
      );
    }

    const trophyDetailService = new PSNAuthTrophyDetailService();
    const gameData = await trophyDetailService.getUserTrophiesForGame(accountId, npCommunicationId);

    return NextResponse.json(gameData);

  } catch (error) {
    console.error('💥 Erro ao buscar detalhes do jogo:', error);
    
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
    
  }
}