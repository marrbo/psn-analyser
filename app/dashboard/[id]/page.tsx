'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardContent from '../../components/Dashboard';
import { AnalysisData } from '@/lib/mongodb';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

function DashboardPageContent() {
  const params = useParams();
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (id: string) => {
    try {
      if (!id) {
        throw new Error('ID da análise não fornecido');
      }

      const response = await fetch(`/api/analyses/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status} ao carregar análise`);
      }

      const data = await response.json();
      
      // Ajustar estrutura de dados se necessário
      if (!data.analysis && data.trophySummary) {
        setAnalysisData({...data});
      } else {
        setAnalysisData(data);
      }
      
    } catch (error) {
      console.error('💥 Erro primário ao buscar análise:', error);
      
      // Tentar endpoint alternativo
      try {
        const altResponse = await fetch(`/api/user/analysis/${id}`);
        if (altResponse.ok) {
          const altData = await altResponse.json();
          setAnalysisData(altData);
          return;
        }
      } catch (altError) {
        console.error('💥 Erro no endpoint alternativo:', altError);
      }
      
      // Se ambos falharem, mostrar erro
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Mensagens amigáveis
      if (errorMessage.includes('não encontrada') || errorMessage.includes('expirada')) {
        setError('Esta análise não foi encontrada ou expirou. Por favor, faça uma nova análise.');
      } else if (errorMessage.includes('indisponível')) {
        setError('Serviço temporariamente indisponível. Tente novamente em alguns minutos.');
      } else if (errorMessage.includes('inválido')) {
        setError('ID de análise inválido. Por favor, faça uma nova análise.');
      } else {
        setError(errorMessage);
      }
    }
  }, []);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      setIsLoading(true);
      setError(null);
      fetchAnalysis(id).finally(() => {
        setIsLoading(false);
      });
    } else {
      setError('ID da análise não fornecido');
      setIsLoading(false);
    }
  }, [params.id, fetchAnalysis]);

  const handleNewAnalysis = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleRetry = useCallback(() => {
    const id = params.id as string;
    if (id) {
      setIsLoading(true);
      setError(null);
      fetchAnalysis(id).finally(() => {
        setIsLoading(false);
      });
    }
  }, [params.id, fetchAnalysis]);

  // Loading State
  if (isLoading) {
    return (
      <LoadingSpinner
          title="Dashboard"
          subtitle="Carregando análise..."
        />
    );
  }

  // Error State
  if (error || !analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-effect rounded-2xl p-8 max-w-md w-full border border-red-500/20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-4">Erro ao carregar análise</h1>
          <p className="text-gray-300 mb-6">{error || 'Dados não encontrados'}</p>
          
          <div className="flex flex-col gap-3 p-3">
            <button 
              onClick={handleRetry}
              className="w-full py-3 px-4 bg-linear-to-r from-cyan-500 to-blue-500 rounded-lg font-bold text-white hover:scale-105 transition-transform"
            >
              🔄 Tentar Novamente
            </button>
            
            <button 
              onClick={handleNewAnalysis}
              className="w-full py-3 px-4 bg-linear-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-white hover:scale-105 transition-transform"
            >
              🎮 Nova Análise
            </button>
          </div>

          <div className="mt-6 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm font-bold text-cyan-400 mb-2">💡 Precisa de ajuda?</h4>
            <p className="text-xs text-gray-400">
              Se o problema persistir, verifique sua conexão com a internet ou tente novamente mais tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  return <DashboardContent data={analysisData} onNewAnalysis={handleNewAnalysis} />;
}

// Wrapper com Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
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