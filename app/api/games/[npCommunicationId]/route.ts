// app/api/games/[npCommunicationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TrophyService } from '@/lib/psn/trophy-service';
import { AnalysisData } from '@/lib/mongodb';
import { userRepository } from '@/types/repository/user-repository';
import { TrophyGroup } from '@/types/trophies';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ npCommunicationId: string }> }
) {
  try {
    const { npCommunicationId } = await context.params;
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId é obrigatório' },
        { status: 400 }
      );
    }

    const psnUser = await userRepository.findByAccountId(accountId);

    if (!psnUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const analysisData: AnalysisData | undefined = await TrophyService.getLastAnalysis(psnUser.lastAnalysisId!);

    if (!analysisData) {
      return NextResponse.json(
        { error: 'Análise não encontrada' },
        { status: 404 }
      );
    }

    analysisData.psnUser = psnUser;
    analysisData.games = analysisData.games.filter(g => g.trophyTitle.npCommunicationId === npCommunicationId);

    // trophy groups
    analysisData.games[0].trophyGroups = await TrophyService.getGameTrophyGroups(npCommunicationId, analysisData.games[0].npServiceName);

    // pegar troféus do usuário para esse jogo
    await Promise.all(analysisData.games[0].trophyGroups.map(async (group: TrophyGroup) => {
      const userTrophies = await TrophyService.getUserGroupTrophiesForGame(accountId, npCommunicationId,  group.trophyGroupId, analysisData.games[0].trophyTitle.npServiceName);
      
      await Promise.all(group.trophies.map(t => {
        const trophy = userTrophies.find(ut => ut.trophyId === t.trophyId);
        t.earned = trophy?.earned || false;
        if (t.earned) {
          t.earnedDateTime = trophy?.earnedDateTime || null;
          t.progress = trophy?.progress || 0;
          t.progressRate = trophy?.progressRate || 0;
          t.progressedDateTime = trophy?.progressedDateTime || null;
          t.trophyProgressTargetValue = trophy?.trophyProgressTargetValue;
        }
        t.trophyEarnedRate = trophy?.trophyEarnedRate || 0;
        t.trophyRare = trophy?.trophyRare || 0;
      }));

      group.progress = TrophyService.calculateGroupProgress(group.trophies);

      group.earnedTrophies = {
        bronze: group.trophies.filter(t => t.trophyType === 'bronze' && t.earned).length,
        silver: group.trophies.filter(t => t.trophyType === 'silver' && t.earned).length,
        gold: group.trophies.filter(t => t.trophyType === 'gold' && t.earned).length,
        platinum: group.trophies.filter(t => t.trophyType === 'platinum' && t.earned).length
      };
    }));

    analysisData.games[0].earnedTrophies = {
      bronze: analysisData.games[0].trophyGroups.reduce((acc, group) => acc + group.earnedTrophies.bronze, 0),
      silver: analysisData.games[0].trophyGroups.reduce((acc, group) => acc + group.earnedTrophies.silver, 0),
      gold: analysisData.games[0].trophyGroups.reduce((acc, group) => acc + group.earnedTrophies.gold, 0),
      platinum: analysisData.games[0].trophyGroups.reduce((acc, group) => acc + group.earnedTrophies.platinum, 0)
    };

    analysisData.games[0].trophyTitle.earnedTrophies = analysisData.games[0].earnedTrophies;

    analysisData.games[0].completionPercentage = analysisData.games[0].trophyGroups.reduce((acc, group) => acc + TrophyService.calculateGroupProgress(group.trophies), 0);

    return NextResponse.json(analysisData);
  } catch (error) {
    
    console.error('💥 Erro ao buscar detalhes do jogo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        error: 'Erro ao buscar detalhes do jogo',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log(request.json());
  return NextResponse.json({ message: 'POST working' });
}