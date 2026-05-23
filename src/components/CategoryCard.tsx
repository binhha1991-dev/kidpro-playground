import type { ReactNode } from 'react';

interface CategoryCardProps {
  icon: string;
  title: string;
  subtitle: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  badgeText: string;
  children: ReactNode;
}

export default function CategoryCard({
  icon,
  title,
  subtitle,
  accentColor,
  bgColor,
  borderColor,
  badgeColor,
  badgeText,
  children,
}: CategoryCardProps) {
  return (
    <div
      className={`rounded-3xl border-2 ${borderColor} ${bgColor} p-5 sm:p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-lg`}
    >
      {/* Category header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl ${accentColor} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-slate-800 text-lg leading-tight">{title}</h3>
            <span className={`text-xs font-bold ${badgeColor} rounded-full px-2 py-0.5`}>
              {badgeText}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Divider */}
      <div className={`h-px ${borderColor} bg-current opacity-30`} />

      {/* Games list */}
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}
