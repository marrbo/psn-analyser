// app/games/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Game {
  npCommunicationId: string;
  title: string;
  platform: string;
  progress: number;
  earnedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  definedTrophies: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  trophyTitleIconUrl: string;
  lastUpdatedDateTime: string;
}

function GamesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    const analysisId = searchParams.get('analysisId');
    const accId = searchParams.get('accountId');

    if (!analysisId || !accId) {
      router.push('/');
      return;
    }

    setAccountId(accId);
    fetchGames(analysisId);
  }, [searchParams, router]);

  const fetchGames = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/analyses/${analysisId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar análise');
      }

      const data = await response.json();
      setGames(data.games || []);
      
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionColor = (progress: number) => {
    if (progress >= 100) return 'text-green-400';
    if (progress >= 75) return 'text-yellow-400';
    if (progress >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTrophyCount = (game: Game) => {
    // Adicionar verificações para propriedades undefined
    const earned = game.earnedTrophies 
        ? Object.values(game.earnedTrophies).reduce((a, b) => a + b, 0)
        : 0;
    
    const total = game.definedTrophies 
        ? Object.values(game.definedTrophies).reduce((a, b) => a + b, 0)
        : 0;

    return { earned, total };
 };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white">Carregando lista de jogos...</h2>
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
               Biblioteca de Jogos
            </h1>
            <p className="text-gray-400 mt-2">
              {games.length} jogos na biblioteca
            </p>
          </div>
          <Link 
            href="/"
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg font-bold text-white hover:scale-105 transition-transform"
          >
            Voltar ao Dashboard
          </Link>
        </div>

        {/* Lista de Jogos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => {
            const { earned, total } = getTrophyCount(game);
            
            return (
              <Link
                key={game.npCommunicationId}
                href={`/games/${game.npCommunicationId}?accountId=${accountId}`}
                className="glass-effect rounded-2xl p-4 border border-blue-500/20 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                {/* Capa do Jogo */}
                <div className="relative mb-4">
                  <img
                    src={game.trophyTitleIconUrl}
                    alt={game.title}
                    className="w-full h-40 object-cover-custom rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 text-xs text-white">
                    {game.platform}
                  </div>
                </div>

                {/* Informações do Jogo */}
                <h3 className="text-white font-medium text-sm text-center mb-2 line-clamp-2 ">
                  {game.title}
                </h3>

                {/* Progresso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Progresso</span>
                    <span className={getCompletionColor(game.progress)}>
                      {game.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${game.progress}%` }}
                    />
                  </div>
                </div>

                {/* Troféus */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="text-center">
                    <div className="text-yellow-600 font-bold">{game.earnedTrophies.bronze}</div>
                    <div className="text-gray-400 text-xs">🥉</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-300 font-bold">{game.earnedTrophies.silver}</div>
                    <div className="text-gray-400 text-xs">🥈</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-bold">{game.earnedTrophies.gold}</div>
                    <div className="text-gray-400 text-xs">🥇</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 font-bold">{game.earnedTrophies.platinum}</div>
                    <div className="text-gray-400 text-xs">🏆</div>
                  </div>
                </div>

                {/* Contagem Total */}
                <div className="text-center text-gray-400 text-xs mt-2">
                  {earned}/{total} troféus
                </div>
              </Link>
            );
          })}
        </div>

        {games.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl text-white mb-2">Nenhum jogo encontrado</h3>
            <p className="text-gray-400">Faça uma análise do seu perfil PSN primeiro</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white">Carregando...</h2>
        </div>
      </div>
    }>
      <GamesPageContent />
    </Suspense>
  );
}