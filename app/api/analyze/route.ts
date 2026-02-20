// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveAnalysis, canCreateNewAnalysis, formatTimeRemaining } from '@/lib/mongodb';
import { UserService } from '@/lib/psn/user-service';
import { TrophyService } from '@/lib/psn/trophy-service';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username é obrigatório e deve ser uma string' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 16) {
      return NextResponse.json(
        { error: 'Username deve ter entre 3 e 16 caracteres' },
        { status: 400 }
      );
    }

    const accountId = await UserService.convertPsnIdToAccountId(username);

    if (!accountId) {
      return NextResponse.json(
        { error: 'Usuário não encontrado na PSN. Verifique se o username está correto.' },
        { status: 404 }
      );
    }

    // Verificar se pode criar nova análise (cache de 60 minutos)
    const analysisCheck = await canCreateNewAnalysis(accountId);

    if (!analysisCheck.canCreate && analysisCheck.existingAnalysis) {
      const timeRemaining = formatTimeRemaining(analysisCheck.timeRemaining || 0);

      const analysisId = analysisCheck.existingAnalysis._id?.toString();

      if (analysisId) {
        TrophyService.updateUser(analysisId, accountId);  
      }
      

      return NextResponse.json({
        analysisId: analysisCheck.existingAnalysis._id?.toString(),
        ...analysisCheck.existingAnalysis,
        cached: true,
        timeRemaining,
        message: `Uma análise recente já existe. Nova análise disponível em: ${timeRemaining}`
      });
    }

    const analysisData = await TrophyService.getCompleteProfile(accountId);
    
    // Salvar no MongoDB
    const analysisId = await saveAnalysis(accountId, username, analysisData);
    
    TrophyService.updateUser(analysisId, accountId);  

    return NextResponse.json({
      analysisId,
      username,
      accountId,
      cached: false,
      message: 'Nova análise criada com sucesso'
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
