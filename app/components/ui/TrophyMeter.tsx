// app/components/ui/TrophyMeter.tsx
'use client';

export default function TrophyMeter({ data }: any) {
  const levels = [
    { name: 'Bronze', color: 'from-yellow-800 to-yellow-600', progress: 65 },
    { name: 'Prata', color: 'from-gray-400 to-gray-300', progress: 45 },
    { name: 'Ouro', color: 'from-yellow-400 to-yellow-200', progress: 30 },
    { name: 'Platina', color: 'from-cyan-400 to-blue-500', progress: 25 },
  ];

  return (
    <div className="space-y-6">
      {levels.map((level, index) => (
        <div key={level.name} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white font-medium">{level.name}</span>
            <span className="text-gray-400">{level.progress}%</span>
          </div>
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${level.color} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${level.progress}%` }}
            />
          </div>
        </div>
      ))}
      
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg border border-cyan-500/30">
        <div className="text-center">
          <div className="text-cyan-400 text-sm mb-1">Eficiência de Conquista</div>
          <div className="text-2xl font-bold text-white">87%</div>
        </div>
      </div>
    </div>
  );
}