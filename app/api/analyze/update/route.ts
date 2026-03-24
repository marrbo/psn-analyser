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

    let returnJson;
    if (npCommunicationId) {
      returnJson =  await updateGame(accountId, npCommunicationId);
    } else {
      returnJson = await updateAll(accountId);
    }

    return returnJson;

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

async function updateAll(accountId: string) {
  try {
    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json(
        { error: 'Username é obrigatório e deve ser uma string' },
        { status: 400 }
      );
    }
  
    const analysisData = await TrophyService.getCompleteProfile(accountId);
    
    // Salvar no MongoDB
    const analysisId = await saveAnalysis(accountId, '', analysisData);
    
    await TrophyService.updateUser(analysisId, accountId);  

    return NextResponse.json({
        analysisId,
        accountId,
        cached: false,
        message: 'Nova análise criada com sucesso'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('💥 Erro na análise:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        error: JSON.parse(errorMessage)?.message || 'Ops! Ocorreu um erro inesperado',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

async function updateGame(accountId: string, npCommunicationId: string) {
  try {
    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json(
        { error: 'accountId é obrigatório e deve ser uma string' },
        { status: 400 }
      );
    }
  
    const analysisData = await TrophyService.getPartialProfile(accountId, npCommunicationId);
    
    const analysisId = await saveAnalysis(accountId, '', analysisData);
    
    await TrophyService.updateUser(analysisId, accountId);

    analysisData.games = analysisData.games.filter(game => game.trophyTitle?.npCommunicationId === npCommunicationId);

    return NextResponse.json({
        analysisId,
        ...analysisData,
        cached: false,
        message: 'Nova análise criada com sucesso',
      },
      { status: 200 }
    );

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
