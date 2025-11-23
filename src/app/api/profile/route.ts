// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TrophyService } from '@/lib/trophies';
import { AnalysisService } from '@/lib/analysis';
import { PSNAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const psnId = searchParams.get('psnId');

  if (!psnId) {
    return NextResponse.json({ error: 'PSN ID is required' }, { status: 400 });
  }

  try {
    // Inicializar autenticação com PSN
    const auth = new PSNAuth();
    const trophyService = new TrophyService(auth);
    
    // Buscar dados completos do perfil
    const fullProfile = await trophyService.getCompleteProfile(psnId);
    
    // Analisar o perfil
    const returnData = AnalysisService.analyzeProfile(fullProfile.games, fullProfile.accountId);

    return NextResponse.json({ profile: returnData });
  } catch (error) {
    console.error('Error analyzing profile:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}