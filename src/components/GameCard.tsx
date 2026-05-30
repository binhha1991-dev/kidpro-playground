import { Lock, ChevronRight, Star } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  stars?: number;
  playLabel?: string;
  active: boolean;
  onClick?: () => void;
}

export default function GameCard({
  title,
  description,
  stars = 0,
  playLabel = 'Play Now',
  active,
  onClick,
}: GameCardProps) {
  if (active) {
    return (
      <button
        onClick={onClick}
        className="group w-full text-left bg-white rounded-2xl border-2 border-sky-200 shadow-sm hover:shadow-md hover:border-sky-400 transition-all duration-200 p-4 hover:-translate-y-0.5 active:translate-y-0"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className="inline-block text-xs font-bold text-sky-600 bg-sky-50 rounded-full px-2 py-0.5 mb-2">
              {playLabel}
            </span>
            <h4 className="font-bold text-slate-800 text-sm leading-tight">{title}</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-1" />
        </div>
        {stars > 0 && (
          <div className="flex items-center gap-1 mt-3">
            {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
              <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
            ))}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="w-full text-left bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-4 opacity-70">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 mb-2">
            <Lock className="w-2.5 h-2.5" />
            Coming Soon
          </span>
          <h4 className="font-bold text-slate-400 text-sm leading-tight">{title}</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
