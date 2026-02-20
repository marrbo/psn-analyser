// app/components/ui/StatCard.tsx
interface StatCardProps {
  value: number | string;
  label: string;
  icon: string;
  color?: string;
  percent?: boolean;
  transparent?: boolean;
  obs?: string;
}

export default function StatCard({ value, label, icon, color = 'text-green-400', percent = false, transparent = false, obs = '' }: Readonly<StatCardProps>) {
  const variant = color === 'purple' ? 'purple-600' : `${color}-400`;
  const textColor = color === 'text-green-400' ? 'text-green-400' : `text-${color}-400`;
  const borderColor = color === 'text-green-400' ? 'border-green-500/20' : `border-${color}-500/20`;
  const gradientColor = color === 'text-green-400' ? `from-green-500/20 to-gray-900` : `from-${variant} to-gray-900/20`;
  return (
    <>
      <div className={`${transparent ? 'glass-effect' : `bg-linear-to-br ${gradientColor}`} flex justify-between select-none h-full w-full rounded-2xl p-8 border-2 ${borderColor} cursor-pointer justify-between flex flex-col items-center text-center 
        group hover:border-white transition-transform`}>
        <div className={`text-2xl ${textColor} mb-4 font-semibold select-none text-shadow-2xs shadow-black sha`}>{label}</div>
        <div className={`text-5xl font-bold ${textColor} mb-6 select-none text-shadow-xs`}>{value}
          {percent && (<span className={`text-lg ${textColor} select-none inline-block align-top`}>%</span>)}
        </div>
        <div className="text-sm text-white/70 select-none text-shadow-xs">{icon}</div>
        <div className="p-2"/>
        <div/>
        <div className="text-xs text-gray-500 select-none">{obs}</div>
      </div>
    </>
  );
}