// app/components/Dashboard.tsx
'use client';

import { useState } from 'react';
import StatCard from './ui/StatCard';
import GenreChart from './charts/GenreChart';
import ProgressRing from './ui/ProgressRing';
import TrophyMeter from './ui/TrophyMeter';

interface DashboardProps {
  data: any;
}

export default function Dashboard({ data }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
          PSN ANALYSER
        </h1>
        <div className="flex justify-center items-center gap-4 mb-6">
          <span className="text-xl text-gray-300">Perfil:</span>
          <span className="text-2xl text-white font-bold">{data.profile}</span>
          <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg font-bold text-white hover:scale-105 transition-transform shadow-lg">
            Nova Análise
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-effect rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Total de Jogos</h3>
          <div className="text-5xl font-bold text-center text-purple-400">
            {data.totalGames}
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 border border-green-500/20">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Platinas</h3>
          <div className="text-5xl font-bold text-center text-green-400">
            {data.platinas}
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 border border-blue-500/20">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Taxa de Completude</h3>
          <div className="flex justify-center">
            <ProgressRing progress={data.completionRate} size={120} />
          </div>
        </div>
      </div>

      {/* Migue Score Section */}
      <div className="glass-effect rounded-2xl p-8 mb-8 border border-cyan-500/20">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Pontuações da Classificação Mi Mi Mi
        </h2>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-cyan-400 mb-2">
              {data.migueScore}
              <span className="text-2xl text-gray-400">/100</span>
            </div>
            <div className="text-gray-400">total de pontos</div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
            <StatCard value={data.stats.platinasCount} label="Platina" icon="🏆" />
            <StatCard value={data.stats.completeness} label="Completude" icon="✅" />
            <StatCard value={data.stats.rarePlatinas} label="Raras" icon="💎" />
            <StatCard value={data.stats.goty} label="GOTY" icon="🎮" />
            <StatCard value={data.stats.highDifficulty} label="Difícil" icon="⚡" />
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">Level</div>
              <div className="text-3xl font-bold text-white">{data.level}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass-effect rounded-2xl p-6 border border-cyan-500/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Análise por Gênero
          </h3>
          <GenreChart data={data.genres} />
        </div>

        <div className="glass-effect rounded-2xl p-6 border border-yellow-500/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Progresso de Troféus
          </h3>
          <TrophyMeter data={data} />
        </div>
      </div>

      {/* Particle Effects Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
}