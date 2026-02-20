// app/api/analyze/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveAnalysis } from '@/lib/mongodb';
import { TrophyService } from '@/lib/psn/trophy-service';

export async function POST(request: NextRequest) {
  try {
    const { accountId, npCommunicationId } = await request.json();

    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json(
        { error: 'Username é obrigatório e deve ser uma string' },
        { status: 400 }
      );
    }
  
    const analysisData = await TrophyService.getPartialProfile(accountId, npCommunicationId);
    
    // Salvar no MongoDB
    const analysisId = await saveAnalysis(accountId, '', analysisData);
    
    TrophyService.updateUser(analysisId, accountId);  

    return NextResponse.json({
      analysisId,
      cached: false,
      ...analysisData,
      message: `Jogo: [${npCommunicationId}] atualizado na análise com sucesso`
    });

  } catch (error) {
    console.error('💥 Erro na análise:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
