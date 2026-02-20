import { ReactNode } from 'react';

interface FeatureCardProps {
  feature: {
    icon: ReactNode;
    title: string;
    description: string;
    color: string;
    bgColor: string;
    stats: string;
    statsLabel: string;
    details: string[];
  };
  index: number;
}

export default function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-gray-900/50 to-black/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gray-700 hover:scale-[1.02] hover:shadow-2xl"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white">
            {feature.icon}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
        <p className="text-gray-400 mb-4">{feature.description}</p>

        {/* Stats */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-white mb-1">{feature.stats}</div>
          <div className="text-sm text-gray-400">{feature.statsLabel}</div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2 p-2">
          {feature.details.map((detail, i) => (
            <div key={i} className="flex items-center text-sm text-gray-400">
              <div className={`w-1.5 h-1.5 rounded-full bg-linear-to-r ${feature.color} mr-3`} />
              {detail}
            </div>
          ))}
        </div>

        {/* Hover indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`w-8 h-8 rounded-full bg-linear-to-r ${feature.color} flex items-center justify-center`}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Border glow on hover */}
      <div className={`absolute -inset-px rounded-2xl bg-linear-to-r ${feature.color} opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300`} />
    </div>
  );
}