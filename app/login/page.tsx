// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/providers/HeaderContext';
import LoadingState from '@/app/components/ui/LoadingState';
import AnalysisForm from '@/app/components/AnalysisForm';
// import { useHeader } from '@/providers/HeaderContext';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const { setShow } = useHeader(); 
  const router = useRouter();

  const updateProgress = (step: number, totalSteps: number = 6) => {
    setProgress(Math.min((step / totalSteps) * 100, 100));
  };

  const handleAnalysisStart = async (username: string) => {
    setShow(false);
    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      // Passo 1: Conectando ao servidor
      setCurrentStep('Conectando ao servidor...');
      updateProgress(1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Passo 2: Convertendo username
      setCurrentStep('Convertendo psnId...');
      updateProgress(2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        setCurrentStep('Usando análise em cache...');
        router.push(`/dashboard/${data.analysisId}`);
        return;
      }

      // Passo 3: Buscando dados PSN (apenas para nova análise)
      setCurrentStep('Buscando dados da PSN...');
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
    <div className="min-h-screen gap-8 flex flex-col">
      <>
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-3xl italic drop-shadow-accent shadow-black text-gray-300 max-w-xl mx-auto">
            Descubra sua classificação baseada em platinas, completude, dificuldade e suas conquistas épicas
          </p>
        </div>

        <div className="text-center container gap-8 mx-auto flex sm:flex-row md:flex-row">
          
          {/* Formulário de Análise */}
          <div className="glass-effect rounded-2xl p-8 min-h-full align-center min-w-150 max-w-150">
            <AnalysisForm 
              onAnalysisStart={handleAnalysisStart}
              isAnalyzing={isAnalyzing}
              currentStep={currentStep}
            />
          </div>

          {/* Sobre o Sistema de Pontuação*/}
          <div className="glass-effect rounded-2xl p-8 min-w-150 max-w-full">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              📊 Sistema de Pontuação
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-6">Como Funciona (0-100 pontos):</h3>
                <ul className="space-y-4 text-gray-300 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✅</span>
                    <span><strong>Platinas (20pts):</strong> (platinas ÷ total jogos) × 100</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">📊</span>
                    <span><strong>Completude (30pts):</strong> % completude média × 0.2</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">🏆</span>
                    <span><strong>Jogos GOTY (15pts):</strong> Cada GOTY = 3pts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">⚡</span>
                    <span><strong>Alta Dificuldade (15pts):</strong> Cada jogo difícil = 2pts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">💎</span>
                    <span><strong>Jogos Metacritic 80+ (20pts):</strong> Cada platina rara = 2pts</span>
                  </li>
                </ul>
                
                {/* Exemplo de Cálculo */}
                <div className="glass-effect rounded-2xl p-6  mt-8 text-left border-green-500/20">
                  <h3 className="text-xl font-bold text-green-400 mb-6">🎯 Exemplo de Cálculo:</h3>
                  <div className="text-gray-300 flex flex-col gap-2 p-2">
                    <p><strong>Perfil com 124 platinas, 291 jogos totais:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>Platinas:</strong> ((124 ÷ 291) × 100 = 42.61%) x 0.2 = 8.5 pontos</li>
                      <li><strong>Completude:</strong> 40.9% média = 12.3 pontos</li>
                      <li><strong>GOTY 100%:</strong> 2 jogos (0 - 100%) = 0 pontos</li>
                      <li><strong>Alta Dificuldade:</strong> 59 jogos = 10 pontos</li>
                      <li><strong>Jogos Metacritc 80+:</strong> 59 / 10 = 5.9 pontos (máximo 20)</li>
                      <li className="text-cyan-400 font-bold">Total: 37.7 pontos = 🐱 MIADO</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-6">Classificação:</h3>
                <div className="flex justify-between flex-col gap-6">
                  <div className="min-h-[95px] flex items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <span className="text-2xl mr-3">🐱</span>
                    <div>
                      <strong className="text-yellow-400">0-40: MIADO</strong>
                      <p className="text-sm text-gray-300">Foco em platinas fáceis, jogos simples, baixa completude</p>
                    </div>
                  </div>
                  <div className="min-h-[95px] flex items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-2xl mr-3">😺</span>
                    <div>
                      <strong className="text-green-400">41-70: MIGUÉ</strong>
                      <p className="text-sm text-gray-300">Equilíbrio entre dificuldade e variedade, alguns jogos difíceis</p>
                    </div>
                  </div>
                  <div className="min-h-[95px] flex items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <span className="text-2xl mr-3">😻</span>
                    <div>
                      <strong className="text-purple-400">71-90: MISERÊ</strong>
                      <p className="text-sm text-gray-300">Completude alta, jogos GOTY, alta dificuldade (8/10+)</p>
                    </div>
                  </div>
                  <div className="min-h-[95px] flex items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <span className="text-2xl mr-3">🏆</span>
                    <div>
                      <strong className="text-cyan-400">91-100: MISERAVÃO</strong>
                      <p className="text-sm text-gray-300">Lenda do trophy hunting, perfil excepcional em todos os aspectos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </>
    </div>
  );
}