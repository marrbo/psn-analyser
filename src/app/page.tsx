'use client';

import { useState } from 'react';
import { Trophy, Play, Shield, Award, Users, Star } from 'lucide-react';

export default function Home() {
  const [npsso, setNpsso] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/trophies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npsso })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar dados');
      }

      if (data.data) {
        localStorage.setItem('psnProfile', JSON.stringify(data.data));
        globalThis.location.href = '/dashboard';
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center items-center mb-6">
              <div className="relative">
                <Trophy className="h-16 w-16 text-yellow-400 mr-4" />
                <div className="absolute -top-1 -right-1">
                  <Star className="h-6 w-6 text-yellow-300 animate-pulse" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                PSN Trophy Master
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Descubra seus <span className="text-yellow-400 font-semibold">padrões de jogo</span>, 
              analise suas <span className="text-blue-400 font-semibold">conquistas</span> e 
              eleve seu <span className="text-green-400 font-semibold">nível gamer</span>
            </p>
            
            {/* Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
              <StatPreview number="124" label="Platinas" />
              <StatPreview number="2.347" label="Troféus" />
              <StatPreview number="87%" label="Eficiência" />
              <StatPreview number="95" label="Nota PSNP" />
            </div>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/50">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <Play className="h-8 w-8 text-blue-400 mr-2" />
                <h2 className="text-2xl font-bold text-white">Conectar com PSN</h2>
              </div>
              <p className="text-gray-400">
                Use seu <span className="text-blue-400 font-semibold">NPSSO</span> para acessar suas estatísticas
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start">
                <Shield className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🔑 Token NPSSO
                </label>
                <input
                  type="password"
                  value={npsso}
                  onChange={(e) => {
                    setNpsso(e.target.value);
                    setError('');
                  }}
                  placeholder="Cole seu token NPSSO aqui..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  required
                />
                <p className="mt-2 text-sm text-gray-400">
                  Não sabe como obter?{' '}
                  <a 
                    href="https://andshrew.github.io/PlayStation-Trophies/#/AUTHENTICATION" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    Guia passo a passo
                  </a>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !npsso.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Analisando seu perfil...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trophy className="h-6 w-6 mr-3" />
                    🎮 Analisar Meu Perfil PSN
                  </div>
                )}
              </button>
            </form>

            {/* Security Info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-1">Autenticação Segura</h4>
                  <p className="text-xs text-gray-300">
                    Seu token NPSSO é processado diretamente pelos servidores da Sony e nunca é armazenado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Análises <span className="text-yellow-400">Exclusivas</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Descubra insights profundos sobre seus hábitos de jogo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Trophy className="h-12 w-12 text-yellow-400" />}
            title="Análise de Platinas"
            description="Identifique padrões, rarezas e tempo médio para conquistar cada platina"
            features={['Raridade das platinas', 'Tempo médio por jogo', 'Taxa de sucesso']}
            gradient="from-yellow-500/10 to-orange-500/10"
          />
          <FeatureCard
            icon={<Award className="h-12 w-12 text-blue-400" />}
            title="Perfil do Jogador"
            description="Descubra seu arquétipo gamer baseado em suas conquistas e preferências"
            features={['Arquétipo personalizado', 'Preferências de gênero', 'Estilo de jogo']}
            gradient="from-blue-500/10 to-purple-500/10"
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-green-400" />}
            title="Comparações"
            description="Compare seu progresso com a comunidade e amigos"
            features={['Ranking personalizado', 'Métricas da comunidade', 'Desafios']}
            gradient="from-green-500/10 to-emerald-500/10"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-t border-b border-gray-700/50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para <span className="text-yellow-400">elevar</span> seu nível?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de jogadores que já descobriram seus padrões secretos
          </p>
          <button
            onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🎯 Começar Agora
          </button>
        </div>
      </div>
    </div>
  );
}

function StatPreview({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50">
      <div className="text-2xl font-bold text-white mb-1">{number}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  features,
  gradient 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  gradient: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300`}>
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white text-center mb-3">{title}</h3>
      <p className="text-gray-400 text-center mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-300">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}