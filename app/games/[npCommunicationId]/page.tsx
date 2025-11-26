// app/games/[npCommunicationId]/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Trophy {
  trophyId: number;
  trophyName: string;
  trophyDetail: string;
  trophyIconUrl: string;
  trophyType: 'bronze' | 'silver' | 'gold' | 'platinum';
  trophyRare: number;
  trophyEarnedRate: number;
  earned: boolean;
  earnedDateTime?: string;
  trophyGroup: string;
  trophyGroupName: string;
}

interface GameStats {
  common: { count: number; trophies: Trophy[] };
  uncommon: { count: number; trophies: Trophy[] };
  rare: { count: number; trophies: Trophy[] };
  epic: { count: number; trophies: Trophy[] };
  legendary: { count: number; trophies: Trophy[] };
  totalEarned: number;
  totalTrophies: number;
  completionPercentage: number;
}

function GameDetailPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const npCommunicationId = params.npCommunicationId as string;
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      router.push('/');
      return;
    }

    fetchGameDetails(npCommunicationId, accountId);
  }, [params.npCommunicationId, searchParams, router]);

  const fetchGameDetails = async (npCommunicationId: string, accountId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/games/${npCommunicationId}?accountId=${accountId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar detalhes do jogo');
      }

      const data = await response.json();
      setGameStats(data);
      
    } catch (error) {
      console.error('Erro ao carregar detalhes do jogo:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'from-gray-400 to-gray-300',
      uncommon: 'from-green-400 to-green-300',
      rare: 'from-blue-400 to-blue-300',
      epic: 'from-purple-400 to-purple-300',
      legendary: 'from-orange-400 to-orange-300'
    };
    return colors[rarity as keyof typeof colors] || 'from-gray-400 to-gray-300';
  };

  const getRarityLabel = (rarity: string) => {
    const labels = {
      common: 'Comum',
      uncommon: 'Incomum',
      rare: 'Raro',
      epic: 'Épico',
      legendary: 'Lendário'
    };
    return labels[rarity as keyof typeof labels] || 'Desconhecido';
  };

  const getTrophyColor = (type: string) => {
    const colors = {
      bronze: 'text-yellow-600',
      silver: 'text-gray-300',
      gold: 'text-yellow-400',
      platinum: 'text-cyan-400'
    };
    return colors[type as keyof typeof colors] || 'text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white">Carregando detalhes do jogo...</h2>
        </div>
      </div>
    );
  }

  if (error || !gameStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Erro ao carregar jogo</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link 
            href="/games"
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white"
          >
            Voltar para Lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/games"
              className="text-blue-400 hover:text-blue-300 mb-4 inline-block"
            >
              ← Voltar para Lista
            </Link>
            <h1 className="text-3xl font-bold text-white">Detalhes do Jogo</h1>
          </div>
          
          {/* Estatísticas Gerais */}
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {gameStats.completionPercentage.toFixed(1)}%
            </div>
            <div className="text-gray-400">
              {gameStats.totalEarned}/{gameStats.totalTrophies} troféus
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="glass-effect rounded-2xl p-6 mb-8 border border-blue-500/20">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progresso Geral</span>
            <span className="text-blue-400">{gameStats.completionPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${gameStats.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Distribuição de Raridade */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as const).map((rarity) => (
            <div key={rarity} className="text-center glass-effect rounded-2xl p-4 border border-blue-500/20">
              <div className={`text-2xl font-bold bg-gradient-to-r ${getRarityColor(rarity)} bg-clip-text text-transparent`}>
                {gameStats[rarity].count}
              </div>
              <div className="text-gray-400 text-sm">{getRarityLabel(rarity)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {((gameStats[rarity].count / gameStats.totalEarned) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        {/* Lista de Troféus por Raridade */}
        <div className="space-y-8">
          {(['legendary', 'epic', 'rare', 'uncommon', 'common'] as const).map((rarity) => (
            gameStats[rarity].trophies.length > 0 && (
              <div key={rarity} className="glass-effect rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getRarityColor(rarity)}`}></div>
                  <h2 className="text-xl font-bold text-white">
                    {getRarityLabel(rarity)} ({gameStats[rarity].count})
                  </h2>
                  <div className="text-gray-400 text-sm">
                    {((gameStats[rarity].count / gameStats.totalEarned) * 100).toFixed(0)}% dos troféus conquistados
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gameStats[rarity].trophies.map((trophy) => (
                    <div
                      key={trophy.trophyId}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        trophy.earned 
                          ? 'border-green-500/50 bg-green-500/10' 
                          : 'border-gray-600/50 bg-gray-800/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Ícone do Troféu */}
                        <div className="relative">
                          <img
                            src={trophy.trophyIconUrl}
                            alt={trophy.trophyName}
                            className={`w-12 h-12 ${!trophy.earned ? 'grayscale' : ''}`}
                          />
                          {trophy.earned && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                          )}
                        </div>

                        {/* Informações do Troféu */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className={`font-semibold text-sm ${
                              trophy.earned ? 'text-white' : 'text-gray-400'
                            }`}>
                              {trophy.trophyName}
                            </h3>
                            <span className={`text-xs font-bold ${getTrophyColor(trophy.trophyType)}`}>
                              {trophy.trophyType.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {trophy.trophyDetail}
                          </p>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-gray-500 text-xs">
                              {trophy.trophyEarnedRate.toFixed(1)}% conquistaram
                            </span>
                            {trophy.earnedDateTime && (
                              <span className="text-green-400 text-xs">
                                {new Date(trophy.earnedDateTime).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GameDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white">Carregando...</h2>
        </div>
      </div>
    }>
      <GameDetailPageContent />
    </Suspense>
  );
}