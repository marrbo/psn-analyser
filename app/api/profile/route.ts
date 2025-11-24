// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PSNTrophyService } from 'lib/psn/trophy-service';
import { AnalysisService } from 'lib/analysis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const psnId = searchParams.get('psnId') || 'me'; // Mantém 'me' como padrão

  console.log('=== 🚀 INICIANDO ANÁLISE OTIMIZADA ===');
  console.log(`PSN ID: ${psnId}`);

  try {
    const trophyService = new PSNTrophyService();
    const fullProfile = await trophyService.getCompleteProfile(psnId);
    
    console.log(`📦 Dados coletados: ${fullProfile.games.length} jogos, ${fullProfile.trophySummary.totalTrophies} troféus`);
    
    const analyzedProfile = AnalysisService.analyzeProfile(
      fullProfile.games, 
      fullProfile.accountId, 
      fullProfile.trophySummary
    );
    
    console.log('✅ Análise concluída com sucesso!');

    return NextResponse.json({ 
      success: true,
      profile: analyzedProfile 
    });
  } catch (error) {
    console.error('💥 ERRO NA ANÁLISE:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Falha ao analisar perfil',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}