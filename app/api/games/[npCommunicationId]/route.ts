// app/api/games/[npCommunicationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TrophyRarityService } from '../../../../lib/psn/trophy-detail-service';

interface RouteContext {
  params: Promise<{ npCommunicationId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { npCommunicationId } = await context.params;
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🎮 Buscando detalhes do jogo: ${npCommunicationId}`);

    const rarityService = new TrophyRarityService();
    const gameData = await rarityService.analyzeGameRarity(
      accountId, 
      npCommunicationId,
      'Loading...' // O título será buscado pelo serviço
    );

    return NextResponse.json(gameData);

  } catch (error) {
    console.error('💥 Erro ao buscar detalhes do jogo:', error);
    
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
    {
        error: 'Erro ao buscar detalhes do jogo',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    },
    { status: 500 }
    );
  }
}