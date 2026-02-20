'use client';

import Link from "next/link";
import { 
  Trophy, 
  Gamepad2, 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp,
  Sparkles,
  Zap,
  Star,
  CheckCircle,
  ChevronRight,
  Award,
  Cloud,
  Database,
  Cpu,
  Server,
  FactoryIcon
} from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import FeatureCard from "@/app/components/home/FeatureCard";
import TestimonialCard from "@/app/components/home/TestimonialCard";
import PlatformShowcase from "@/app/components/home/PlatformShowcase";
import AnimatedCounter from "@/app/components/ui/AnimatedCounter";
import { useState } from "react";
import { useHeader } from "@/providers/HeaderContext";
import { useRouter } from "next/navigation";
import LoadingState from "./components/ui/LoadingState";
import { FaMicrosoft } from "react-icons/fa";
import { SiPlaystation3, SiPlaystation4, SiPlaystation5 } from "react-icons/si";

export default function HomePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const { setShow } = useHeader(); 
  const router = useRouter();

  setShow(false);
  
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


  const features = [
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Controle Total de Troféus",
      description: "Acompanhe todos os seus troféus conquistados, em progresso e descubra sua raridade.",
      color: "from-yellow-500 to-amber-600",
      bgColor: "bg-linear-to-br from-yellow-500/10 to-amber-600/10",
      stats: "99%",
      statsLabel: "de cobertura",
      details: ["Progresso por jogo", "Troféus raros", "Platinas", "Conquistas por data"]
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Biblioteca Inteligente",
      description: "Organize, filtre e analise sua coleção completa de jogos com filtros avançados.",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-linear-to-br from-blue-500/10 to-cyan-600/10",
      stats: "500+",
      statsLabel: "jogos analisados",
      details: ["Por plataforma", "Por status", "Por tempo jogado", "Por progresso"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Estatísticas Avançadas",
      description: "Gráficos interativos e insights detalhados sobre seus hábitos de jogo.",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-linear-to-br from-purple-500/10 to-pink-600/10",
      stats: "15+",
      statsLabel: "métricas",
      details: ["Tempo jogado", "Jogos por mês", "Progresso anual", "Comparativos"]
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Histórico Detalhado",
      description: "Veja quando e quanto tempo você jogou cada título, com análise temporal.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-linear-to-br from-green-500/10 to-emerald-600/10",
      stats: "24/7",
      statsLabel: "monitoramento",
      details: ["Sessões de jogo", "Picos de atividade", "Histórico completo", "Exportação"]
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Integração PlayFab",
      description: "Estatísticas em tempo real, cloud saves e progresso sincronizado com a plataforma da Microsoft.",
      color: "from-teal-500 to-blue-600",
      bgColor: "bg-linear-to-br from-teal-500/10 to-blue-600/10",
      stats: "API",
      statsLabel: "oficial",
      details: ["Cloud Saves", "Estatísticas", "Achievements", "Progresso Sincronizado"]
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Dados em Tempo Real",
      description: "Sincronização automática com APIs oficiais da PSN e PlayFab.",
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-linear-to-br from-indigo-500/10 to-purple-600/10",
      stats: "100%",
      statsLabel: "sincronizado",
      details: ["API PSN Oficial", "API PlayFab", "Atualizações automáticas", "Backup em nuvem"]
    }
  ];

  const stats = [
    {
      value: <AnimatedCounter from={0} to={10000} />,
      label: "Usuários Ativos",
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      value: <AnimatedCounter from={0} to={2500000} />,
      label: "Troféus Analisados",
      icon: <Trophy className="w-6 h-6" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      value: <AnimatedCounter from={0} to={50000} suffix="+" />,
      label: "Jogos Catalogados",
      icon: <Gamepad2 className="w-6 h-6" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      value: <AnimatedCounter from={0} to={15000} suffix="h" />,
      label: "Tempo Analisado",
      icon: <Clock className="w-6 h-6" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ];

  const testimonials = [
    {
      name: "Alex Gamer",
      role: "Platinum Hunter",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      content: "Consegui platinar 15 jogos graças às estatísticas detalhadas! O dashboard me mostrou exatamente onde focar.",
      rating: 5,
      platform: "PS5",
      playfab: true
    },
    {
      name: "Maria Silva",
      role: "Game Developer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      content: "A integração com PlayFab é incrível! Agora posso acompanhar minhas estatísticas em múltiplas plataformas.",
      rating: 5,
      platform: "PlayFab",
      playfab: true
    },
    {
      name: "Carlos Pro",
      role: "Competitive Player",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      content: "As comparações com amigos me motivaram a jogar mais. Agora temos competições saudáveis!",
      rating: 5,
      platform: "PS5",
      playfab: false
    }
  ];

  const platforms = [
    { 
      name: "PS5", 
      icon: <SiPlaystation5 className="w-10 h-10" />,
      color: "bg-blue-500", 
      games: "850+",
      badge: "PSN"
    },
    { 
      name: "PS4", 
      icon: <SiPlaystation4 className="w-10 h-10" />,  
      color: "bg-purple-500", 
      games: "4000+",
      badge: "PSN"
    },
    { 
      name: "PS3", 
      icon: <SiPlaystation3 className="w-10 h-10" />,  
      color: "bg-pink-500", 
      games: "2000+",
      badge: "Legacy"
    },
    { 
      name: "PlayFab (breve)", 
      icon: <FaMicrosoft className="w-6 h-6" />, 
      color: "bg-teal-500", 
      games: "API",
      badge: "Microsoft"
    },
    { 
      name: "Multiplataforma (breve)", 
      icon: <FactoryIcon className="w-6 h-6" />, 
      color: "bg-linear-to-r from-blue-500 to-teal-500", 
      games: "Sincronizado",
      badge: "Cloud"
    }
  ];

  return (
    <div className="min-h-screen gap-8 py-10">
      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-10 w-96 h-96 bg-gray-950/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Particle Animation */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 1}s`
              }}
            />
          ))}
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Conecte sua conta <span className="font-semibold text-blue-400">PSN</span> e sincronize com{" "}
            <span className="font-semibold text-teal-400">PlayFab</span> para{" "}
            <span className="font-semibold text-purple-400">estatísticas avançadas</span>,{" "}
            <span className="font-semibold text-cyan-400">controle de troféus</span> e{" "}
            <span className="font-semibold text-green-400">dados em tempo real</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up">
            <Link href="/login">
              {/* <Button 
                size="lg" 
                className="group px-8 py-6 text-lg font-bold bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center gap-3">
                  <PlayCircle className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  Conectar PSN + PlayFab
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button> */}
            </Link>
            
            <Link href="#features">
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 text-lg font-medium border-2 border-gray-600 hover:border-white hover:bg-white/5 rounded-xl backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  Explorar Recursos
                  <Sparkles className="w-5 h-5" />
                </span>
              </Button>
            </Link>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronRight className="w-8 h-8 text-gray-400 rotate-90" />
            </div>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 transform transition-all duration-300 hover:scale-105 hover:bg-white/10"
              >
                <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} mb-3`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 bg-linear-to-b from-black to-gray-900">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600/20 to-teal-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-4 py-2 mb-4">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">TECNOLOGIA AVANÇADA</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Integração Completa com{" "}
              <span className="block text-transparent bg-linear-to-r from-blue-400 to-teal-400 bg-clip-text">
                PSN + PlayFab
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Utilize as APIs oficiais da Sony e Microsoft para uma experiência de dados completa e em tempo real.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>

          {/* Platform Showcase */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                Plataformas Sincronizadas
              </h3>
              <p className="text-gray-400">
                Suporte completo para PlayStation Network + Integração oficial com PlayFab API
              </p>
            </div>
            <PlatformShowcase platforms={platforms} />
          </div>

          {/* Tech Stack */}
          <div className="mb-20">
            <div className="bg-linear-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-3xl p-8">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Tecnologia por Trás
                </h3>
                <p className="text-gray-400">
                  APIs oficiais e infraestrutura moderna para garantir velocidade e precisão
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="inline-flex p-3 bg-blue-500/10 rounded-lg mb-4">
                    <Server className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="font-bold text-white mb-2">API PSN Oficial</h4>
                  <p className="text-sm text-gray-400">Dados diretos da Sony</p>
                </div>
                
                <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="inline-flex p-3 bg-teal-500/10 rounded-lg mb-4">
                    <Cloud className="w-8 h-8 text-teal-400" />
                  </div>
                  <h4 className="font-bold text-white mb-2">PlayFab API</h4>
                  <p className="text-sm text-gray-400">Microsoft Game Services</p>
                </div>
                
                <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="inline-flex p-3 bg-purple-500/10 rounded-lg mb-4">
                    <Cpu className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="font-bold text-white mb-2">Next.js 16</h4>
                  <p className="text-sm text-gray-400">Edge Runtime</p>
                </div>
                
                <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="inline-flex p-3 bg-green-500/10 rounded-lg mb-4">
                    <Database className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="font-bold text-white mb-2">Sincronização</h4>
                  <p className="text-sm text-gray-400">Tempo real (apenas VIPs)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Video / Screenshot */}
          <div className="mb-20">
            <div className="relative overflow-hidden rounded-3xl border-2 border-gray-800 bg-linear-to-br from-gray-900 to-black p-8">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-teal-500"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600/20 to-teal-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-4 py-2 mb-6">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">DUPLA INTEGRAÇÃO</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Dashboard em Tempo Real
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Visualize seus dados da PSN sincronizados com PlayFab. Estatísticas avançadas,
                    troféus, progresso de jogos e muito mais em uma única interface.
                  </p>
                  <ul className="flex flex-col gap-3 p-3 mb-8">
                    {['Dados da PSN Oficial', 'Estatísticas PlayFab', 'Sincronização automática', 'API em tempo real'].map((item, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/login">
                    <Button className="bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                      Experimentar Agora
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-2">
                    {/* Mock Dashboard com ícones PSN + PlayFab */}
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-32 bg-gray-700 rounded"></div>
                          <div className="flex gap-1">
                            <div className="h-4 w-4 bg-blue-500 rounded"></div>
                            <div className="h-4 w-4 bg-teal-500 rounded"></div>
                          </div>
                        </div>
                        <div className="h-4 w-16 bg-linear-to-r from-blue-500 to-teal-500 rounded"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className={`h-20 rounded-lg ${
                            i % 2 === 0 ? 'bg-blue-500/20' : 'bg-teal-500/20'
                          }`}></div>
                        ))}
                      </div>
                      <div className="h-40 bg-linear-to-r from-blue-500/20 via-teal-500/20 to-blue-500/20 rounded-lg"></div>
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-teal-500/20 rounded-full blur-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-linear-to-b from-gray-900 to-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-yellow-600/20 to-teal-600/20 backdrop-blur-sm border border-yellow-500/30 rounded-full px-4 py-2 mb-4">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">COMUNIDADE ATIVA</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              O que os gamers estão dizendo
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Junte-se a milhares de jogadores que já transformaram sua experiência com PSN + PlayFab
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 bg-linear-to-br from-blue-900/30 via-teal-900/30 to-purple-900/30 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-blue-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600/20 to-teal-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-6 py-3 mb-8">
            <Award className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white">INTEGRAÇÃO COMPLETA</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Pronto para a próxima geração de{" "}
            <span className="block text-transparent bg-linear-to-r from-blue-400 via-teal-400 to-purple-400 bg-clip-text">
              análise de jogos?
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Conecte sua conta PSN, sincronize com PlayFab e tenha acesso a estatísticas avançadas,
            troféus, progresso e muito mais. Totalmente gratuito e em tempo real.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <Button 
                size="lg" 
                className="group px-10 py-6 text-lg font-bold bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center gap-3">
                  <Cloud className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                  Conectar PSN + PlayFab
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
            </Link>

            <Link href="#features">
              <Button 
                size="lg" 
                variant="outline"
                className="px-10 py-6 text-lg font-medium border-2 border-white/30 hover:border-white hover:bg-white/10 rounded-xl backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  Ver Tecnologia
                  <TrendingUp className="w-6 h-6" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                <span className="text-transparent bg-linear-to-r from-blue-400 to-teal-400 bg-clip-text">
                  API
                </span>
              </div>
              <div className="text-sm text-gray-400">PlayFab Oficial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                <span className="text-transparent bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text">
                  ∞
                </span>
              </div>
              <div className="text-sm text-gray-400">Dados em Tempo Real</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                <span className="text-transparent bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text">
                  24/7
                </span>
              </div>
              <div className="text-sm text-gray-400">Sincronização</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                <span className="text-transparent bg-linear-to-r from-yellow-400 to-amber-400 bg-clip-text">
                  0$
                </span>
              </div>
              <div className="text-sm text-gray-400">Grátis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <Gamepad2 className="w-8 h-8 text-blue-400" />
                  <Cloud className="w-4 h-4 text-teal-400 absolute -top-1 -right-1" />
                </div>
                <span className="text-xl font-bold text-white">PSN + PlayFab</span>
              </div>
              <p className="text-gray-400 text-sm">
                A plataforma definitiva para análise de dados da PlayStation Network
                integrada com PlayFab. Dados em tempo real via APIs oficiais.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                  PSN API
                </div>
                <div className="text-xs px-2 py-1 bg-teal-500/20 text-teal-300 rounded">
                  PlayFab
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Recursos</h4>
              <ul className="flex flex-col gap-2 p-2">
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/library" className="text-gray-400 hover:text-white transition-colors">Biblioteca</Link></li>
                <li><Link href="/playfab" className="text-gray-400 hover:text-white transition-colors">PlayFab Stats</Link></li>
                <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Perfil</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">APIs</h4>
              <ul className="flex flex-col gap-2 p-2">
                <li><a href="https://developer.playstation.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">PSN API</a></li>
                <li><a href="https://docs.microsoft.com/playfab" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">PlayFab Docs</a></li>
                <li><Link href="/api" className="text-gray-400 hover:text-white transition-colors">Nossa API</Link></li>
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentação</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Conectar</h4>
              <ul className="flex flex-col gap-2 p-2">
                <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Suporte</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/community" className="text-gray-400 hover:text-white transition-colors">Comunidade</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contato</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} PSN Dashboard + PlayFab. Projeto independente não afiliado à Sony ou Microsoft.
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs px-3 py-1 bg-gray-800 text-gray-400 rounded-full">
                PlayStation® é marca registrada da Sony Interactive Entertainment
              </div>
              <div className="text-xs px-3 py-1 bg-gray-800 text-gray-400 rounded-full">
                PlayFab® é marca registrada da Microsoft
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
