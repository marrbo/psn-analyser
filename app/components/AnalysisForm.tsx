// app/components/AnalysisForm.tsx
'use client';

import { useState } from 'react';

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
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 text-left mb-2">
            Seu PSN Username
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

        <button
          type="submit"
          disabled={isAnalyzing || !username.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-lg font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Analisando...
            </div>
          ) : (
            '🎮 Fazer Análise'
          )}
        </button>
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
    </div>
  );
}