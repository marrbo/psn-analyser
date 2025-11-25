// app/api/analyses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAnalysis } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    console.log('🔍 Buscando análise com ID:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'ID da análise é obrigatório' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID da análise inválido' },
        { status: 400 }
      );
    }

    const analysis = await getAnalysis(id);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análise não encontrada ou expirada' },
        { status: 404 }
      );
    }

    // Log da estrutura dos dados para debugging
    console.log('📊 Estrutura dos dados recuperados:', {
      accountId: !!analysis.accountId,
      username: !!analysis.username,
      trophySummary: !!analysis.trophySummary,
      games: !!analysis.games,
      gotyStats: !!analysis.analysis.gotyStats,
      analysis: !!analysis.analysis,
      gamesCount: analysis.games?.length || 0
    });

    // Criar resposta com estrutura plana
    const responseData = {
      // Metadados
      accountId: analysis.accountId,
      username: analysis.username,
      createdAt: analysis.createdAt,
      expiresAt: analysis.expiresAt,
      analysisId: analysis._id?.toString(),
      
      // Dados principais (nível raiz)
      trophySummary: analysis.trophySummary,
      games: analysis.games,
      gotyStats: analysis.analysis.gotyStats,
      analysis: analysis.analysis // Este contém migueScore, platinumGames, etc
    };

    console.log('✅ Análise preparada para:', analysis.username);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 Erro ao buscar análise:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}