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
    labels: data.map(genre => genre.name),
    datasets: [
      {
        data: data.map(genre => genre.games),
        backgroundColor: [
          '#00f5ff',
          '#8b5cf6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#3b82f6'
        ],
        borderColor: [
          '#00a3b5',
          '#6d28d9',
          '#047857',
          '#d97706',
          '#dc2626',
          '#1d4ed8'
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
            size: 12
          },
          padding: 20
        }
      },
    },
    cutout: '40%',
  };

  return (
    <div className="relative h-80">
      <Pie data={chartData} options={options} />
    </div>
  );
}