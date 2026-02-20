// PlatinumScore.tsx - atualizações específicas
import { calculateNormalizedScore } from '@/lib/calcular-platinas';
import { NormalizedScore, UserPlatinumData } from '@/lib/score.types';
import React, { useState, useEffect } from 'react';
import { VscGraph } from "react-icons/vsc";

// Componente Principal
const PlatinumScoreCalculatorWithMemory: React.FC<{ userData: UserPlatinumData | undefined }> = ({ userData }) => {
  const [scoreResult, setScoreResult] = useState<NormalizedScore | null>(null);
  
  useEffect(() => {
    if (userData) {
      const result = calculateNormalizedScore(userData);
      setScoreResult(result);
    }
  }, [userData, setScoreResult]);
  
  if (!scoreResult) return <div></div>;
  
  return (
    <>
    
    {/* <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
         <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Calculadora de Score Platina
          </h1>
          <p className="text-gray-600">
            Score baseado em média ponderada (0-30)
          </p>
        </header> */}
        
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> */}
          {/* Painel Esquerdo: Estatísticas */}
          {/* <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Estatísticas</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-sm text-blue-600 font-medium">Total de Platinas</div>
                    <div className="text-2xl font-bold text-gray-800">{scoreResult.totalGames}</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="text-sm text-green-600 font-medium">Pontuação Total</div>
                    <div className="text-2xl font-bold text-gray-800">{scoreResult.totalPoints}</div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="text-sm text-purple-600 font-medium">Dificuldade Média</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {scoreResult.averageDifficulty.toFixed(2)}
                    <span className="text-sm font-normal text-gray-600 ml-1">pontos/platina</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <div className="text-sm text-yellow-600 font-medium">Média Ponderada</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {(scoreResult.distributionScore / 10).toFixed(2)}
                    <span className="text-sm font-normal text-gray-600 ml-1">pontos</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card de Pesos 
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">⚖️ Pesos das Categorias</h2>
              <div className="space-y-3 text-gray-500">
                {[
                  { label: 'Comum (3 pts)', weight: '7%', color: 'bg-blue-100' },
                  { label: 'Raro (5 pts)', weight: '15%', color: 'bg-green-100' },
                  { label: 'Muito Raro (7 pts)', weight: '25%', color: 'bg-yellow-100' },
                  { label: 'Ultra Raro (15 pts)', weight: '50%', color: 'bg-red-100' },
                  { label: 'Oculto (-30 pts)', weight: '-20% cada', color: 'bg-gray-100' }
                ].map((item, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${item.color}`}>
                    <span className="font-medium">{item.label}</span>
                    <span className="font-bold">{item.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
          
          {/* Painel Direito: Resultado e Memória */}
          {/* <div className="lg:col-span-2 space-y-6"> */}
            {/* Card do Score Principal */}
            {/* <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Score Final</h2>
                  <p className="text-blue-100">Baseado em média ponderada com penalidades</p>
                </div>
                
                <div className="mt-4 md:mt-0 text-center">
                  <div className="text-5xl md:text-6xl font-bold">
                    {scoreResult.normalizedScore.toFixed(2)}
                    <span className="text-2xl md:text-3xl font-normal opacity-80">/30</span>
                  </div>
                  <div className="mt-2 text-sm text-blue-100">
                    {scoreResult.normalizedScore >= 25 ? 'Excelente' : 
                     scoreResult.normalizedScore >= 20 ? 'Muito Bom' : 
                     scoreResult.normalizedScore >= 15 ? 'Bom' : 
                     scoreResult.normalizedScore >= 10 ? 'Regular' : 'Em progresso'}
                  </div>
                </div>
              </div>
              
              {/* Barra de Progresso 
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-1">
                  {[0, 5, 10, 15, 20, 25, 30].map((value) => (
                    <span key={value}>{value}</span>
                  ))}
                </div>
                <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(scoreResult.normalizedScore / 30) * 100}%` }}
                  />
                </div>
              </div>
            </div> */}
            
            {/* Card da Memória do Cálculo */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">🧮 Memória do Cálculo</h2>
                <div className="text-sm text-gray-500">
                  {scoreResult.calculationMemory.length} passos
                </div>
              </div>
              
              <div className="space-y-4">
                {scoreResult.calculationMemory.map((step) => (
                  <div 
                    key={step.step}
                    className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                      step.step === scoreResult.calculationMemory.length 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                        step.step === scoreResult.calculationMemory.length 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {step.step}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">{step.description}</h3>
                            {step.formula && (
                              <div className="mt-1 text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                                {step.formula}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 md:mt-0 text-right">
                            <span className="text-2xl font-bold text-gray-900">
                              {typeof step.value === 'number' 
                                ? step.value.toFixed([3, 6, 7].includes(step.step) ? 2 : 0)
                                : step.value
                              }
                            </span>
                            {step.unit && (
                              <span className="ml-1 text-gray-600">{step.unit}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Legenda da Fórmula 
              <div className="mt-8 p-4 bg-linear-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-700 mb-2">📐 Fórmula Principal</h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Score = (MédiaPonderada × 2) × (1 - Ocultas×0.01) × min(1, log10(TotalPlatinas+1)/2)</strong>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="font-medium">Média Ponderada</div>
                      <div>= Σ(Pontuação × Peso × %Categoria)</div>
                    </div>
                    <div>
                      <div className="font-medium">Penalidade Ocultas</div>
                      <div>= -1% por platina oculta</div>
                    </div>
                    <div>
                      <div className="font-medium">Fator Volume</div>
                      <div>= min(1, log10(N+1)/2)</div>
                    </div>
                    <div>
                      <div className="font-medium">Limite</div>
                      <div>= min(Score, 30)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
            
            
        {/* </div> */}

        {/* Card de Distribuição */}
        <div className="bg-white rounded-2xl shadow-lg p-6 glass-apple">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-3"><VscGraph className='h-6 w-6'/> Distribuição de Platinas</h3>
          
          <div className="space-y-3">
            {scoreResult.scoreBreakdown.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-30 text-sm ">
                  {item.category}
                </div>
                <div className="flex-1 ml-2">
                  <div className="flex items-center justify-end">
                    <div 
                      className={`h-6 rounded-l-lg ${
                        item.category === 'Comum' ? 'bg-blue-400' :
                        item.category === 'Raro' ? 'bg-green-400' :
                        item.category === 'Muito Raro' ? 'bg-yellow-400' :
                        item.category === 'Ultra Raro' ? 'bg-red-500' :
                        'bg-purple-700'
                      }`}
                      style={{ 
                        width: `${Math.max(5, item.percentage)}%` 
                      }} 
                    />
                    <div className="ml-2 text-sm font-medium text-right min-w-20">
                      {item.count} <span className='text-xs'>
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
                {/* <div className="ml-4 text-right w-16">
                  <div className={`font-bold ${
                    item.subtotal >= 0 ? 'text-gray-800' : 'text-red-600'
                  }`}>
                    {item.subtotal >= 0 ? '+' : ''}{item.subtotal}
                  </div>
                </div> */}
              </div>
            ))}
            
          </div>
        </div>

        
        {/* Footer Informativo */}
        {/* <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-gray-600 text-sm">
            <p>
              <strong>Nota:</strong> O score é calculado usando média ponderada para valorizar a qualidade das platinas.
              Platinas mais raras têm maior peso na composição do score final (0-30).
            </p>
          </div>
        </footer> */}
    </>
  );
};

export default PlatinumScoreCalculatorWithMemory;