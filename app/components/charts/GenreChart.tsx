// app/components/charts/GenreChart.tsx
'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GenreData {
  name: string;
  games: number;
  platinas: number;
  completion: number;
}

interface GenreChartProps {
  data: GenreData[];
}

export default function GenreChart({ data }: GenreChartProps) {
  const chartData = {
    labels: data.map(genre => `${genre.name} (${genre.games})`),
    datasets: [
      {
        data: data.map(genre => genre.games),
        backgroundColor: [
          '#00f5ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
          '#3b82f6', '#06b6d4', '#84cc16', '#f97316', '#8b5cf6',
          '#ec4899', '#14b8a6', '#f43f5e', '#a855f7', '#eab308'
        ],
        borderColor: [
          '#00a3b5', '#6d28d9', '#047857', '#d97706', '#dc2626',
          '#1d4ed8', '#0e7490', '#4d7c0f', '#ea580c', '#6d28d9',
          '#be185d', '#0f766e', '#e11d48', '#9333ea', '#ca8a04'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'white',
          font: {
            size: 11
          },
          padding: 15,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label.replace(/\(\d+\)/, '')}: ${value} jogos (${percentage}%)`;
          }
        }
      }
    },
    cutout: '40%',
  };

  return (
    <div className="relative h-80">
      <Pie data={chartData} options={options} />
      
      {/* Estatísticas adicionais */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        {data.slice(0, 4).map((genre, index) => (
          <div key={genre.name} className="text-center p-2 bg-gray-800/50 rounded">
            <div className="font-bold text-cyan-400">{genre.name}</div>
            <div className="text-gray-300">{genre.games} jogos</div>
            <div className="text-green-400">{genre.platinas} 🏆</div>
            <div className="text-yellow-400">{genre.completion}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}