// app/api/analysis/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAnalysis  } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Busca a análise salva no banco
    const analysis = await getAnalysis(id);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro ao buscar análise:', error);
    return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 });
  }
}