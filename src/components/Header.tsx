import { Star, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function Header() {
  const { age, setAge, totalStars, achievements } = usePlayer();
  const [showBadges, setShowBadges] = useState(false);
  const earned = achievements.filter((a) => a.earned);

  function handleAgeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 3 && val <= 17) setAge(val);
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm">KP</span>
          </div>
          <span className="font-black text-slate-800 text-lg tracking-tight hidden sm:block">
            KidPro <span className="text-sky-500">Playground</span>
          </span>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-3">

          {/* Star score */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-amber-700 text-sm tabular-nums">{totalStars}</span>
            <span className="text-amber-500 text-xs hidden sm:inline">stars</span>
          </div>

          {/* Achievements badge area */}
          <div className="relative">
            <button
              onClick={() => setShowBadges((v) => !v)}
              className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 hover:bg-emerald-100 transition-colors"
            >
              <span className="text-sm">🏅</span>
              <span className="font-bold text-emerald-700 text-sm">{earned.length}</span>
              <span className="text-emerald-500 text-xs hidden sm:inline">badges</span>
              <ChevronDown className={`w-3.5 h-3.5 text-emerald-500 transition-transform ${showBadges ? 'rotate-180' : ''}`} />
            </button>

            {showBadges && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Achievements</p>
                <div className="space-y-1">
                  {achievements.map((a) => (
                    <div
                      key={a.id}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${
                        a.earned ? 'bg-amber-50' : 'opacity-40'
                      }`}
                    >
                      <span className="text-lg">{a.icon}</span>
                      <span className={`text-sm font-medium ${a.earned ? 'text-slate-700' : 'text-slate-400'}`}>
                        {a.label}
                      </span>
                      {a.earned && <span className="ml-auto text-amber-400 text-xs font-bold">Earned!</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Player profile + age */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pl-2 pr-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 hidden sm:inline">Age</span>
              <input
                type="number"
                min={3}
                max={17}
                value={age}
                onChange={handleAgeChange}
                className="w-10 text-sm font-bold text-slate-700 bg-transparent border-none outline-none text-center tabular-nums"
                aria-label="Player age"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
