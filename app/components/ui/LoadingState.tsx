// app/components/ui/LoadingState.tsx
'use client';

interface LoadingStateProps {
  title: string;
  subtitle?: string;
  currentStep?: string;
  progress?: number;
}

export default function LoadingState({ title, subtitle, currentStep, progress }: LoadingStateProps) {
  const steps = [
    'Conectando ao servidor...',
    'Convertendo psnId...',
    'Buscando dados do PSN...',
    'Processando troféus...',
    'Calculando estatísticas...',
    'Gerando relatório...'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-t from-gray-900 via-yellow-900 to-gray-900 flex items-center justify-center">
      <div className="glass-effect rounded-2xl p-8 max-w-md w-full mx-4 border border-cyan-500/20">
        <div className="text-center">
          {/* Spinner animado */}
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="w-20 h-20 border-4 border-purple-400 border-b-transparent rounded-full animate-spin-reverse absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>

          {/* Título e subtítulo */}
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          {subtitle && (
            <p className="text-gray-400 mb-6">{subtitle}</p>
          )}

          {/* Barra de progresso */}
          {progress !== undefined && (
            <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* Passos atuais */}
          {currentStep && (
            <div className="mb-6">
              <div className="flex items-center justify-center text-cyan-400 text-sm mb-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping mr-2"></div>
                {currentStep}
              </div>
            </div>
          )}

          {/* Lista de passos */}
          <div className="space-y-2 text-left">
            {steps.map((step, index) => (
              <div 
                key={step}
                className={`flex items-center text-sm ${
                  currentStep === step 
                    ? 'text-cyan-400 font-semibold' 
                    : 'text-gray-500'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  currentStep === step 
                    ? 'bg-cyan-400 animate-pulse' 
                    : currentStep && steps.indexOf(currentStep) > index
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}></div>
                {step}
              </div>
            ))}
          </div>

          {/* Dica */}
          <div className="mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400">
              💡 Este processo pode levar alguns minutos dependendo do número de jogos no seu perfil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}