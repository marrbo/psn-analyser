// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PSNTrophyService } from '../../../lib/psn/trophy-service';
import { saveAnalysis, canCreateNewAnalysis, formatTimeRemaining } from '../../../lib/mongodb';
import { convertUsernameToAccountId } from '../../../lib/psn/username-converter';

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

    console.log(`🔍 Iniciando análise para: ${username}`);

    // Converter username para accountId
    console.log(`🔄 Convertendo psnId: ${username}`);
    const accountId = await convertUsernameToAccountId(username);
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Usuário não encontrado na PSN. Verifique se o username está correto.' },
        { status: 404 }
      );
    }

    console.log(`✅ AccountId encontrado: ${accountId}`);

    // Verificar se pode criar nova análise (cache de 60 minutos)
    const analysisCheck = await canCreateNewAnalysis(accountId);
    
    if (!analysisCheck.canCreate && analysisCheck.existingAnalysis) {
      const timeRemaining = formatTimeRemaining(analysisCheck.timeRemaining || 0);
      
      console.log(`⏰ Análise recente encontrada. Tempo restante: ${timeRemaining}`);
      
      return NextResponse.json({
        analysisId: analysisCheck.existingAnalysis._id?.toString(),
        username: analysisCheck.existingAnalysis.username,
        accountId: analysisCheck.existingAnalysis.accountId,
        cached: true,
        timeRemaining,
        message: `Uma análise recente já existe. Nova análise disponível em: ${timeRemaining}`
      });
    }

    // Buscar dados do PSN (nova análise)
    const trophyService = new PSNTrophyService();
    console.log(`🎮 Buscando dados da PSN...`);
    
    const analysisData = await trophyService.getCompleteProfile(accountId);
    console.log(`✅ Dados do PSN coletados com sucesso`);

    // Salvar no MongoDB
    console.log(`💾 Salvando análise no banco de dados...`);
    const analysisId = await saveAnalysis(accountId, username, analysisData);
    console.log(`✅ Análise salva com ID: ${analysisId}`);

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