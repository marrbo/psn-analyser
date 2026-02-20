"use client";

import { useState } from 'react';

interface Platform {
  name: string;
  icon: string;
  color: string;
  games: string;
}

interface PlatformShowcaseProps {
  platforms: Platform[];
}

export default function PlatformShowcase({ platforms }: PlatformShowcaseProps) {
  const [activePlatform, setActivePlatform] = useState(0);

  return (
    <div className="relative">
      {/* Platform Selector */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {platforms.map((platform, index) => (
          <button
            key={index}
            onClick={() => setActivePlatform(index)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activePlatform === index
                ? `${platform.color} text-white scale-105 shadow-lg`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`${platform.name.includes('PS') ? 'text-3xl' : 'text-xl'} `}>{platform.icon}</span>
              <span>{platform.name.includes('PS') ? '' : platform.name}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Platform Display */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
        
        <div className="relative backdrop-blur-sm bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className={`inline-flex p-4 rounded-2xl ${platforms[activePlatform].color} bg-opacity-20 mb-6`}>
                <span className="text-4xl">{platforms[activePlatform].icon}</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Suporte completo para {platforms[activePlatform].name}
              </h3>
              <p className="text-gray-400 mb-6">
                Análise completa de todos os jogos e troféus da plataforma {platforms[activePlatform].name}.
                Acompanhe seu progresso, tempo jogado e conquistas de forma unificada.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {platforms[activePlatform].games}
                  </div>
                  <div className="text-sm text-gray-400">Jogos compatíveis</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white mb-1">100%</div>
                  <div className="text-sm text-gray-400">Troféus suportados</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Mock Game Display */}
              <div className="bg-linear-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-800 rounded"></div>
                  </div>
                  <div className={`h-8 w-8 rounded-full ${platforms[activePlatform].color}`}></div>
                </div>
                
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-800 rounded-lg"></div>
                  ))}
                </div>
                
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${platforms[activePlatform].color} rounded-full`}
                    style={{ width: `${Math.random() * 30 + 70}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}