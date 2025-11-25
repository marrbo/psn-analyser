// app/components/ui/TrophyMeter.tsx
'use client';

interface TrophyMeterProps {
  data: {
    earnedTrophies: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
    };
    totalTrophies: number;
  };
}

export default function TrophyMeter({ data }: TrophyMeterProps) {
  const { earnedTrophies, totalTrophies } = data;

  const levels = [
    { 
      name: 'Bronze', 
      color: 'from-yellow-800 to-yellow-600',
      count: earnedTrophies.bronze,
      total: totalTrophies
    },
    { 
      name: 'Prata', 
      color: 'from-gray-400 to-gray-300',
      count: earnedTrophies.silver,
      total: totalTrophies
    },
    { 
      name: 'Ouro', 
      color: 'from-yellow-400 to-yellow-200',
      count: earnedTrophies.gold,
      total: totalTrophies
    },
    { 
      name: 'Platina', 
      color: 'from-cyan-400 to-blue-500',
      count: earnedTrophies.platinum,
      total: totalTrophies
    },
  ];

  return (
    <div className="space-y-6">
      {levels.map((level, index) => {
        const progress = level.total > 0 ? (level.count / level.total) * 100 : 0;
        return (
          <div key={level.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium">{level.name}</span>
              <span className="text-gray-400">{level.count} ({progress.toFixed(1)}%)</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${level.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })}
      
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg border border-cyan-500/30">
        <div className="text-center">
          <div className="text-cyan-400 text-sm mb-1">Total de Troféus</div>
          <div className="text-2xl font-bold text-white">{totalTrophies}</div>
          <div className="text-gray-400 text-sm mt-1">
            {earnedTrophies.platinum} 🏆 • {earnedTrophies.gold} 🥇 • {earnedTrophies.silver} 🥈 • {earnedTrophies.bronze} 🥉
          </div>
        </div>
      </div>
    </div>
  );
}