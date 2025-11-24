import { NextRequest, NextResponse } from 'next/server';
import { PSNAuth } from '@/psn/auth';
import { TrophyService } from 'lib/trophies';

export async function POST(request: NextRequest) {
  try {
    const { npsso } = await request.json();
    
    if (!npsso) {
      return NextResponse.json({ error: 'NPSSO é obrigatório' }, { status: 400 });
    }

    console.log('Iniciando autenticação com PSN...');
    const auth = await PSNAuth.authenticate(npsso);
    
    console.log('Buscando dados do perfil PSN...');
    const trophyService = new TrophyService(auth);
    const profile = await trophyService.getCompleteProfile();

    if (profile.games.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum jogo com troféus encontrado. Verifique se possui troféus em sua conta PSN.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
      stats: {
        totalGames: profile.games.length,
        totalTrophies: profile.totalStats.totalTrophies,
        platinums: profile.totalStats.platinums
      }
    });
  } catch (error: any) {
    console.error('Erro na API de troféus:', error);
    
    if (error.message?.includes('Authentication')) {
      return NextResponse.json(
        { error: 'Falha na autenticação. Verifique se seu NPSSO está correto e não expirado.' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Limite de requisições excedido. A PSN limita o número de consultas. Tente novamente em alguns minutos.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Erro ao conectar com a PSN: ${error.message}` },
      { status: 500 }
    );
  }
}