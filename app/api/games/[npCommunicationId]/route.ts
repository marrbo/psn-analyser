// app/api/games/[npCommunicationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TrophyService } from '@/lib/psn/trophy-service';
import { AnalysisData } from '@/lib/mongodb';
import { userRepository } from '@/types/repository/user-repository';

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

    const psnUser = await userRepository.findByAccountId(accountId);

    if (!psnUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    const analysisData: AnalysisData | null = await TrophyService.getLastAnalysis(psnUser.lastAnalysisId!);

    if (!analysisData) {
      return NextResponse.json(
        { error: 'Análise não encontrada' },
        { status: 404 }
      );
    }

    analysisData.psnUser = psnUser;
    analysisData.games = analysisData.games.filter(g => g.npCommunicationId === npCommunicationId)!;
    
    return NextResponse.json(analysisData);

  } catch (error) {
    console.error('💥 Erro ao buscar detalhes do jogo:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
    {
        error: 'Erro ao buscar detalhes do jogo',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    },
    { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log(request.json());
  return NextResponse.json({ message: 'POST working' });
}