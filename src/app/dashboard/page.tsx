'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, User, BarChart3, Clock, Award, Home } from 'lucide-react';

interface DashboardData {
  success: boolean;
  data: any;
  stats: {
    totalGames: number;
    totalTrophies: number;
    platinums: number;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const profileData = localStorage.getItem('psnProfile');
    if (!profileData) {
      router.push('/');
      return;
    }

    try {
      const parsedData = JSON.parse(profileData);
      setData(parsedData);
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando seu perfil PSN...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
              Meu Dashboard PSN
            </h1>
            <p className="text-gray-400">Análise completa do seu perfil de troféus</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Voltar
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Trophy className="h-8 w-8 text-yellow-400" />}
            title="Total de Jogos"
            value={data.stats.totalGames.toString()}
            subtitle="com troféus"
          />
          <StatCard
            icon={<Award className="h-8 w-8 text-gray-300" />}
            title="Platinas"
            value={data.stats.platinums.toString()}
            subtitle="jogos completos"
          />
          <StatCard
            icon={<BarChart3 className="h-8 w-8 text-green-400" />}
            title="Total de Troféus"
            value={data.stats.totalTrophies.toString()}
            subtitle="conquistados"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-2xl font-bold mb-6">Análises Disponíveis</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Análise de Platinas"
              description="Detalhes sobre suas conquistas mais raras"
              status="disponível"
            />
            <ActionCard
              title="Perfil do Jogador"
              description="Descubra seu arquétipo gamer"
              status="em breve"
            />
            <ActionCard
              title="Comparações"
              description="Compare com outros jogadores"
              status="em breve"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }: { 
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2 text-white">{value}</p>
          <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

function ActionCard({ title, description, status }: {
  title: string;
  description: string;
  status: 'disponível' | 'em breve';
}) {
  const isAvailable = status === 'disponível';
  
  return (
    <div className={`p-4 rounded-xl border ${
      isAvailable 
        ? 'border-green-500/20 bg-green-500/10 hover:border-green-500/40' 
        : 'border-gray-600/20 bg-gray-700/20'
    } transition-colors`}>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <span className={`text-xs px-2 py-1 rounded-full ${
        isAvailable 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-gray-600/20 text-gray-400'
      }`}>
        {status}
      </span>
    </div>
  );
}