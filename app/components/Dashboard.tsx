// app/components/Dashboard.tsx
'use client';

import { calculateMigueScore, calculateGenreStats, formatTimeRemaining } from '../utils/scoring';
import StatCard from './ui/StatCard';
import GenreChart from './charts/GenreChart';
import ProgressRing from './ui/ProgressRing';
import TrophyMeter from './ui/TrophyMeter';

interface DashboardProps {
  data: any;
  onNewAnalysis: () => void;
}

export default function Dashboard({ data, onNewAnalysis }: DashboardProps) {
  console.log('📊 Dados recebidos no Dashboard:', data);

  // Verificações de segurança para dados com fallbacks robustos
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Dados de análise não encontrados</h1>
          <button 
            onClick={onNewAnalysis}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white"
          >
            Nova Análise
          </button>
        </div>
      </div>
    );
  }

  // EXTRAÇÃO DE DADOS COM ESTRUTURA CORRIGIDA
  // analysis agora está no nível raiz e contém migueScore, platinumGames, etc
  const analysisData = data.analysis || {};
  const trophySummary = data.trophySummary || {
    earnedTrophies: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
    totalTrophies: 0,
    trophyLevel: 0,
    progress: 0,
    tier: 1
  };
  
  const games = Array.isArray(data.games) ? data.games : [];
  const gotyStats = data.gotyStats || { totalGotyGames: 0, gotyGames: [], completionRate: 0 };

  console.log('🎮 Dados extraídos:', {
    analysisData,
    trophySummary,
    gamesCount: games.length,
    gotyStats
  });

  console.log('🎮 Games data:', games.length);
  console.log('🏆 Trophy summary:', trophySummary);
  console.log('📈 Analysis data:', analysisData);
  console.log('🎯 GOTY stats:', gotyStats);

  // Calcular pontuação Mi Mi Mi com valores padrão
  const scoreBreakdown = calculateMigueScore({
    platinumCount: analysisData.platinumGames || 0,
    totalGames: analysisData.totalGames || games.length || 0,
    completionRate: analysisData.completionRate || 0,
    rarePlatinas: analysisData.rareGames || 0,
    gotyGames: gotyStats.totalGotyGames || 0,
    highDifficultyGames: analysisData.highDifficultyGames || 0
  });

  // Calcular estatísticas de gênero
  const genreStats = calculateGenreStats(games);

  // Dados para o TrophyMeter com valores padrão
  const trophyMeterData = {
    earnedTrophies: trophySummary.earnedTrophies || {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0
    },
    totalTrophies: trophySummary.totalTrophies || 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            PSN ANALYSER
          </h1>
          <div className="flex justify-center items-center gap-4 mb-6 flex-wrap">
            <span className="text-xl text-gray-300">Perfil:</span>
            <span className="text-2xl text-white font-bold">{data.username || data.accountId || 'Usuário'}</span>
            
            {data.createdAt && (
              <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                📅 Análise de {new Date(data.createdAt).toLocaleDateString('pt-BR')}
              </div>
            )}
            
            {data.expiresAt && (
              <div className="text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                ⏰ Válida por mais {formatTimeRemaining(new Date(data.expiresAt).getTime() - Date.now())}
              </div>
            )}
            
            <button 
              onClick={onNewAnalysis}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg font-bold text-white hover:scale-105 transition-transform shadow-lg"
            >
              Nova Análise
            </button>
          </div>
        </div>

        {/* Classificação Mi Mi Mi */}
        <div className="glass-effect rounded-2xl p-8 mb-8 border border-cyan-500/20">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              Classificação Mi Mi Mi
            </h2>
            <div className="flex items-center justify-center gap-4">
              <span className="text-6xl">{scoreBreakdown.emoji}</span>
              <div className="text-left">
                <div className="text-4xl font-bold text-cyan-400">
                  {scoreBreakdown.total}/100
                </div>
                <div className="text-xl text-gray-300">{scoreBreakdown.classification}</div>
                <div className="text-sm text-gray-400">{scoreBreakdown.description}</div>
              </div>
            </div>
          </div>

          {/* Breakdown da Pontuação */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="text-center p-3 bg-cyan-500/10 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">{scoreBreakdown.platinas}</div>
              <div className="text-xs text-gray-300">Platinas</div>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{scoreBreakdown.completude}</div>
              <div className="text-xs text-gray-300">Completude</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{scoreBreakdown.rarePlatinas}</div>
              <div className="text-xs text-gray-300">Raras</div>
            </div>
            <div className="text-center p-3 bg-purple-500/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{scoreBreakdown.goty}</div>
              <div className="text-xs text-gray-300">GOTY</div>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{scoreBreakdown.highDifficulty}</div>
              <div className="text-xs text-gray-300">Difícil</div>
            </div>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-effect rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Total de Jogos</h3>
            <div className="text-5xl font-bold text-center text-purple-400">
              {analysisData.totalGames || games.length || 0}
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-green-500/20">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Platinas</h3>
            <div className="text-5xl font-bold text-center text-green-400">
              {analysisData.platinumGames || 0}
            </div>
            <div className="text-center text-gray-400 mt-2">
              {trophySummary.earnedTrophies?.platinum || 0} 🏆 conquistadas
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-blue-500/20">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Taxa de Completude</h3>
            <div className="flex justify-center h-20">
              <ProgressRing progress={analysisData.completionRate.toPrecision(2) || 0} size={80} />
            </div>
            <div className="text-center text-gray-400 mt-2">
              {analysisData.completedGames || 0} jogos 100%
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="glass-effect rounded-2xl p-6 border border-cyan-500/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Análise por Gênero
            </h3>
            {genreStats.length > 0 ? (
              <GenreChart data={genreStats} />
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Nenhum dado de gênero disponível</p>
                </div>
              </div>
            )}
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-yellow-500/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Progresso de Troféus
            </h3>
            <TrophyMeter data={trophyMeterData} />
          </div>
        </div>

        {/* Estatísticas Detalhadas */}
        <div className="mt-8 glass-effect rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Estatísticas Detalhadas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              value={analysisData.rareGames || 0} 
              label="Jogos Raros" 
              icon="💎" 
            />
            <StatCard 
              value={gotyStats.totalGotyGames || 0} 
              label="Jogos GOTY" 
              icon="🏆" 
            />
            <StatCard 
              value={analysisData.highDifficultyGames || 0} 
              label="Alta Dificuldade" 
              icon="⚡" 
            />
            <StatCard 
              value={trophySummary.trophyLevel || 0} 
              label="Level PSN" 
              icon="⭐" 
            />
          </div>
        </div>

        {/* Jogos GOTY */}
        {gotyStats.gotyGames && gotyStats.gotyGames.length > 0 && (
          <div className="mt-8 glass-effect rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              🏆 Jogos Game of The Year
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gotyStats.gotyGames.slice(0, 6).map((gotyGame: any, index: number) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <h4 className="font-bold text-white">{gotyGame.titulo}</h4>
                      <p className="text-sm text-gray-400">
                        {gotyGame.ano_premiacao} • {gotyGame.desenvolvedora}
                      </p>
                      <p className="text-sm text-cyan-400">
                        Completude: {gotyGame.userGame?.completionPercentage || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {gotyStats.gotyGames.length > 6 && (
              <div className="text-center mt-4">
                <p className="text-gray-400">
                  +{gotyStats.gotyGames.length - 6} outros jogos GOTY
                </p>
              </div>
            )}
          </div>
        )}

        {/* Informações de Debug (apenas desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 glass-effect rounded-2xl p-6 border border-gray-500/20">
            <h3 className="text-xl font-bold text-white mb-4">🔧 Informações de Debug</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Total de jogos:</strong> {games.length}</p>
                <p><strong>Platinas:</strong> {analysisData.platinumGames || 0}</p>
                <p><strong>Jogos raros:</strong> {analysisData.rareGames || 0}</p>
                <p><strong>Jogos GOTY:</strong> {gotyStats.totalGotyGames || 0}</p>
              </div>
              <div>
                <p><strong>Level PSN:</strong> {trophySummary.trophyLevel || 0}</p>
                <p><strong>Trofeus totais:</strong> {trophySummary.totalTrophies || 0}</p>
                <p><strong>Account ID:</strong> {data.accountId}</p>
                <p><strong>Username:</strong> {data.username}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}