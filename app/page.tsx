// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AnalysisForm from './components/AnalysisForm';
import LoadingState from './components/ui/LoadingState';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const updateProgress = (step: number, totalSteps: number = 6) => {
    setProgress(Math.min((step / totalSteps) * 100, 100));
  };

  const handleAnalysisStart = async (username: string) => {
    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      // Passo 1: Conectando ao servidor
      setCurrentStep('Conectando ao servidor...');
      updateProgress(1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Passo 2: Convertendo username
      setCurrentStep('Convertendo username para AccountID...');
      updateProgress(2);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Verificar se é erro de análise recente
        if (data.cached && data.timeRemaining) {
          throw new Error(`ANALISE_RECENTE:${data.timeRemaining}:${data.analysisId}`);
        }
        throw new Error(data.error || 'Erro na análise');
      }

      // Se é análise em cache, redirecionar imediatamente
      if (data.cached && data.analysisId) {
        console.log('📦 Usando análise em cache:', data.analysisId);
        router.push(`/dashboard/${data.analysisId}`);
        return;
      }

      // Passo 3: Buscando dados PSN (apenas para nova análise)
      setCurrentStep('Buscando dados do PSN...');
      updateProgress(3);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Passo 4: Processando dados
      setCurrentStep('Processando troféus...');
      updateProgress(4);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Passo 5: Calculando estatísticas
      setCurrentStep('Calculando estatísticas...');
      updateProgress(5);
      await new Promise(resolve => setTimeout(resolve, 600));

      // Passo 6: Gerando relatório
      setCurrentStep('Gerando relatório...');
      updateProgress(6);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Redirecionar para dashboard
      router.push(`/dashboard/${data.analysisId}`);
      
    } catch (error) {
      console.error('Erro:', error);
      
      // Mostrar erro de forma amigável
      if (error instanceof Error) {
        if (error.message.startsWith('ANALISE_RECENTE:')) {
          const [, timeRemaining, analysisId] = error.message.split(':');
          const message = `⏰ Uma análise recente já existe!\n\nVocê pode visualizar a análise atual ou aguardar ${timeRemaining} para uma nova análise.`;
          
          if (confirm(`${message}\n\nDeseja visualizar a análise atual?`)) {
            router.push(`/dashboard/${analysisId}`);
            return;
          }
        } else if (error.message.includes('Database service is temporarily unavailable')) {
          alert('😓 Serviço de banco de dados indisponível\n\nPor favor, tente novamente em alguns minutos.');
        } else if (error.message.includes('PSN service is temporarily unavailable')) {
          alert('🎮 Serviço da PSN indisponível\n\nA PSN pode estar em manutenção. Tente novamente mais tarde.');
        } else if (error.message.includes('not found')) {
          alert('🔍 Usuário não encontrado\n\nVerifique se o username está correto e se o perfil é público.');
        } else {
          alert(`❌ Erro inesperado\n\n${error.message}`);
        }
      } else {
        alert('❌ Erro desconhecido\n\nPor favor, tente novamente.');
      }
    } finally {
      setIsAnalyzing(false);
      setCurrentStep('');
      setProgress(0);
    }
  };

  if (isAnalyzing) {
    return (
      <LoadingState
        title="Analisando Perfil PSN"
        subtitle="Estamos coletando e processando seus dados..."
        currentStep={currentStep}
        progress={progress}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            PSN ANALYSER
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Descubra sua classificação Mi Mi Mi baseada em platinas, raridade e conquistas épicas
          </p>
        </div>

        {/* Aviso de 60 minutos */}
        <div className="glass-effect rounded-2xl p-6 max-w-4xl mx-auto border border-yellow-500/20 mb-8">
          <div className="flex items-start">
            <div className="text-3xl mr-4">⏰</div>
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Atenção: Sistema de Cache</h3>
              <p className="text-gray-300">
                Para otimizar o desempenho e evitar sobrecarga, cada perfil só pode ser analisado uma vez a cada <strong>60 minutos</strong>.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Se você já analisou este perfil recentemente, poderá visualizar a análise existente ou aguardar o tempo restante para uma nova análise.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Análise */}
        <div className="glass-effect rounded-2xl p-8 max-w-md mx-auto border border-cyan-500/20 mb-12">
          <AnalysisForm 
            onAnalysisStart={handleAnalysisStart}
            isAnalyzing={isAnalyzing}
            currentStep={currentStep}
          />
        </div>

        {/* Resto do conteúdo permanece igual */}
        <div className="glass-effect rounded-2xl p-8 max-w-4xl mx-auto border border-purple-500/20">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            📊 Sistema de Pontuação Mi Mi Mi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Como Funciona (0-100 pontos):</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✅</span>
                  <span><strong>Platinas (30pts):</strong> (platinas ÷ total jogos) × 100</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">📊</span>
                  <span><strong>Completude (20pts):</strong> % completude média × 0.2</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-400 mr-2">💎</span>
                  <span><strong>Platinas Raras (20pts):</strong> Cada platina rara = 2pts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">🏆</span>
                  <span><strong>Jogos GOTY (15pts):</strong> Cada GOTY = 3pts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">⚡</span>
                  <span><strong>Alta Dificuldade (15pts):</strong> Cada jogo difícil = 2pts</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Classificação Mi Mi Mi:</h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <span className="text-2xl mr-3">🐱</span>
                  <div>
                    <strong className="text-yellow-400">0-40: MIADO</strong>
                    <p className="text-sm text-gray-300">Foco em platinas fáceis, jogos simples</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <span className="text-2xl mr-3">😺</span>
                  <div>
                    <strong className="text-green-400">41-70: MIGUÉ</strong>
                    <p className="text-sm text-gray-300">Equilíbrio entre dificuldade e variedade</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <span className="text-2xl mr-3">😻</span>
                  <div>
                    <strong className="text-purple-400">71-90: MISERÊ</strong>
                    <p className="text-sm text-gray-300">Muitas platinas raras, jogos GOTY</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <span className="text-2xl mr-3">🏆</span>
                  <div>
                    <strong className="text-cyan-400">91-100: MISERAVÃO</strong>
                    <p className="text-sm text-gray-300">Lenda do trophy hunting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exemplo de Cálculo */}
        <div className="mt-8 glass-effect rounded-2xl p-6 max-w-4xl mx-auto border border-green-500/20">
          <h3 className="text-xl font-bold text-green-400 mb-4">🎯 Exemplo de Cálculo:</h3>
          <div className="text-gray-300 space-y-2">
            <p><strong>Perfil com 124 platinas, 291 jogos totais:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Platinas:</strong> (124 ÷ 291) × 100 = 42.6% = 12.8 pontos</li>
              <li><strong>Completude:</strong> 50% média = 10 pontos</li>
              <li><strong>Platinas Raras:</strong> 10 raras = 20 pontos (máximo)</li>
              <li><strong>GOTY:</strong> 3 jogos = 9 pontos</li>
              <li><strong>Alta Dificuldade:</strong> 5 jogos = 10 pontos</li>
              <li className="text-cyan-400 font-bold">Total: 61.8 pontos = 😺 MIGUÉ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}