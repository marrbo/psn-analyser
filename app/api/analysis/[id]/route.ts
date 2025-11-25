// app/api/analysis/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PSNTrophyService } from 'lib/psn/trophy-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Em produção, você buscaria a análise salva no banco de dados
    // Por enquanto, vamos refazer a análise (não é ideal, mas para demonstração)
    const trophyService = new PSNTrophyService();
    const analysis = await trophyService.getCompleteProfile(id);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro ao buscar análise:', error);
    return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 });
  }
}