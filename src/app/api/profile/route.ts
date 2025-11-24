// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PSNTrophyService } from '@/lib/psn/trophy-service';
import { AnalysisService } from '@/lib/analysis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const psnId = searchParams.get('psnId');

  console.log('=== 🚀 INICIANDO ANÁLISE DE PERFIL PSN ===');
  console.log(`PSN ID: ${psnId}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  if (!psnId) {
    console.log('❌ PSN ID não fornecido');
    return NextResponse.json({ error: 'PSN ID é obrigatório' }, { status: 400 });
  }

  // Validar formato do PSN ID
  if (!/^[a-zA-Z0-9_-]{3,16}$/.test(psnId)) {
    console.log('❌ PSN ID em formato inválido');
    return NextResponse.json({ error: 'PSN ID em formato inválido' }, { status: 400 });
  }

  try {
    console.log('🔧 Inicializando serviços...');
    const trophyService = new PSNTrophyService();
    
    console.log('📡 Buscando dados do perfil...');
    const fullProfile = await trophyService.getCompleteProfile(psnId);
    
    console.log(`✅ Perfil recuperado: ${fullProfile.games.length} jogos`);
    
    console.log('📊 Analisando dados...');
    const analyzedProfile = AnalysisService.analyzeProfile(fullProfile.games, fullProfile.accountId);
    
    console.log('🎉 Análise concluída com sucesso!');
    console.log('=== ✅ FIM DA ANÁLISE ===');

    return NextResponse.json({ 
      success: true,
      profile: analyzedProfile 
    });
  } catch (error) {
    console.error('💥 ERRO CRÍTICO:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Falha ao analisar perfil',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}