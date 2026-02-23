// app/api/analysis/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAnalysis } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const analysis = await getAnalysis(id);

    if (!analysis) {
      return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro ao buscar análise:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}