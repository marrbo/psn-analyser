// app/api/trophies/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { TrophyService } from '@/lib/trophies';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Aqui você pode buscar dados do usuário no FusionAuth
    // e integrar com o serviço de troféus PSN
    
    const stats = {
      totalTrophies: 1250,
      platinums: 15,
      gold: 45,
      silver: 120,
      bronze: 1070,
      completionRate: 68.5,
      efficiency: 72.3,
      psnpScore: 2450
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}