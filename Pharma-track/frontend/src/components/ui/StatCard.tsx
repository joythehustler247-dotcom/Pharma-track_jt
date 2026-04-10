import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  badge?: string;
  badgeColor?: string;
  iconBg?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  badge,
  badgeColor = 'text-cyan-400',
  iconBg = 'bg-white/5',
}: StatCardProps) {
  return (
    <div className="relative bg-[#111827]/80 border border-white/5 rounded-2xl p-5 flex flex-col gap-3 overflow-hidden group hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        {badge && (
          <span className={`text-[11px] font-semibold ${badgeColor}`}>{badge}</span>
        )}
      </div>
      <div>
        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );
}
