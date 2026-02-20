// app/components/AnalysisForm.tsx
'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AnalysisFormProps {
  onAnalysisStart: (username: string) => void;
  isAnalyzing: boolean;
  currentStep: string;
}

export default function AnalysisForm({ onAnalysisStart, isAnalyzing, currentStep }: AnalysisFormProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onAnalysisStart(username.trim());
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Nova Análise</h2>
      <p className="text-gray-400 mb-6">Digite seu PSN Username para começar</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-lg font-medium text-gray-300 text-left mb-2">
            Seu Username (PSN ID)
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ex: JegueParalitico"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            disabled={isAnalyzing}
          />
        </div>

        <div className="flex justify-center">
          <Button 
            type="submit"
            variant="primary"
            disabled={isAnalyzing || !username.trim()}
          >
            {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analisando...
                </div>
              ) : (
                '🎮 Fazer Análise'
              )}
          </Button>
          <Button 
            variant="secondary"
            onClick={() => window.history.back()}
          >
            <span className="flex items-center gap-3">
              <ChevronLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Voltar
            </span>
          </Button>
        </div>
        
        
      </form>

      {isAnalyzing && currentStep && (
        <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <div className="flex items-center justify-center text-cyan-400 text-sm">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping mr-2"></div>
            {currentStep}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-bold text-cyan-400 mb-2">💡 Dica:</h4>
        <p className="text-xs text-gray-400">
          Use o mesmo username que aparece no app oficial da PSN. 
          Não é necessário o AccountID, nós convertemos automaticamente.
        </p>
      </div>

      {/* Aviso de 60 minutos */}
      <div className="glass-effect p-4 w-full mt-8 text-sm rounded-lg bg-yellow-500/20">
        <div className="flex items-start">
          <div className="text-3xl mr-4 mt-1">⏰</div>
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Atenção: Sistema de Cache</h3>
            <p className="text-gray-300">
              Para otimizar o desempenho e evitar sobrecarga, cada perfil só pode ser analisado uma vez a cada <strong>60 minutos</strong>.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Se você já analisou este perfil recentemente, poderá visualizar a análise existente ou aguardar o tempo restante para uma nova análise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}