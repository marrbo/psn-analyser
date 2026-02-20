// app/api/analyses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AnalysisData } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { TrophyService } from '@/lib/psn/trophy-service';
import { PSNUser } from '@/types/psn';
import { userRepository } from '@/types/repository/user-repository';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID da análise é obrigatório' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID da análise inválido' },
        { status: 400 }
      );
    }

    const resultAnalysis: AnalysisData | undefined = await TrophyService.getLastAnalysis(id);

    const psnUser: PSNUser | null = await userRepository.findByAccountId(resultAnalysis?.accountId || '');

    if (!resultAnalysis) {
      return NextResponse.json(
        { error: 'Análise não encontrada ou expirada' },
        { status: 404 }
      );
    }

    if (psnUser) {
      resultAnalysis.psnUser = psnUser;
    }

    return NextResponse.json(resultAnalysis);

  } catch (error) {
    console.error('💥 Erro ao buscar análise:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}