// app/dashboard/[id]/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardContent from '../../components/Dashboard';

function DashboardPageContent() {
  const params = useParams();
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // No Next.js 14, params é um objeto com chaves dinâmicas
        const id = params.id as string;
        
        console.log('🔄 Buscando análise com ID:', id);

        if (!id) {
          throw new Error('ID da análise não fornecido');
        }

        const response = await fetch(`/api/analyses/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status} ao carregar análise`);
        }

        const data = await response.json();
        console.log('✅ Análise carregada com sucesso:', data);
        
        // Verificar se a estrutura de dados está correta
        if (!data.analysis && data.trophySummary) {
          // Se os dados estão no nível raiz em vez de dentro de "analysis"
          console.log('🔄 Ajustando estrutura de dados...');
          setAnalysisData({
            ...data,
            analysis: {
              migueScore: data.analysis?.migueScore || 0,
              completedGames: data.analysis?.completedGames || 0,
              platinumGames: data.analysis?.platinumGames || 0,
              rareGames: data.analysis?.rareGames || 0,
              highDifficultyGames: data.analysis?.highDifficultyGames || 0,
              totalGames: data.analysis?.totalGames || (data.games ? data.games.length : 0),
              completionRate: data.analysis?.completionRate || 0
            }
          });
        } else {
          setAnalysisData(data);
        }
        
      } catch (error) {
        console.error('💥 Erro ao buscar análise:', error);
        
        let errorMessage = 'Erro desconhecido';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        // Mensagens mais amigáveis para o usuário
        if (errorMessage.includes('não encontrada') || errorMessage.includes('expirada')) {
          setError('Esta análise não foi encontrada ou expirou. Por favor, faça uma nova análise.');
        } else if (errorMessage.includes('indisponível')) {
          setError('Serviço temporariamente indisponível. Tente novamente em alguns minutos.');
        } else if (errorMessage.includes('inválido')) {
          setError('ID de análise inválido. Por favor, faça uma nova análise.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [params.id]);

  const handleNewAnalysis = () => {
    router.push('/');
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // Recarregar a página para tentar novamente
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-gray-900 via-yellow-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white mb-2">Carregando análise...</h2>
          <p className="text-gray-400">Buscando dados do servidor</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div className="glass-effect rounded-2xl p-8 max-w-md w-full border border-red-500/20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-4">Erro ao carregar análise</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button 
              onClick={handleRetry}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold text-white hover:scale-105 transition-transform"
            >
              🔄 Tentar Novamente
            </button>
            
            <button 
              onClick={handleNewAnalysis}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-white hover:scale-105 transition-transform"
            >
              🎮 Nova Análise
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-sm font-bold text-cyan-400 mb-2">💡 Precisa de ajuda?</h4>
            <p className="text-xs text-gray-400">
              Se o problema persistir, verifique sua conexão com a internet ou tente novamente mais tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <DashboardContent data={analysisData} onNewAnalysis={handleNewAnalysis} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white">Carregando...</h2>
        </div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}