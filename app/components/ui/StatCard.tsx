// app/components/ui/StatCard.tsx
interface StatCardProps {
  value: number;
  label: string;
  icon: string;
}

export default function StatCard({ value, label, icon }: Readonly<StatCardProps>) {
  return (
    <div className="text-center group hover:scale-105 transition-transform">
      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}