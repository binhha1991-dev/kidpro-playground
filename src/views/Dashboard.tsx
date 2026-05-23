import { Sparkles, Zap } from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import GameCard from '../components/GameCard';
import { usePlayer } from '../context/PlayerContext';
import { games, type GameCategory, type GameId } from '../gameRegistry';

interface DashboardProps {
  onNavigate: (game: GameId) => void;
}

const categories: {
  category: GameCategory;
  icon: string;
  subtitle: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
}[] = [
  {
    category: 'Logic & Memory',
    icon: '🧩',
    subtitle: 'Train your brain with puzzles',
    accentColor: 'bg-sky-100',
    bgColor: 'bg-gradient-to-b from-sky-50 to-cyan-50',
    borderColor: 'border-sky-200',
    badgeColor: 'text-sky-600 bg-sky-100',
  },
  {
    category: 'Words & Language',
    icon: '📝',
    subtitle: 'Explore spelling & vocabulary',
    accentColor: 'bg-emerald-100',
    bgColor: 'bg-gradient-to-b from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200',
    badgeColor: 'text-emerald-600 bg-emerald-100',
  },
  {
    category: 'Numbers & Shapes',
    icon: '🔢',
    subtitle: 'Math, counting & geometry fun',
    accentColor: 'bg-rose-100',
    bgColor: 'bg-gradient-to-b from-rose-50 to-orange-50',
    borderColor: 'border-rose-200',
    badgeColor: 'text-rose-600 bg-rose-100',
  },
];

function formatActiveGamesBadge(activeCount: number): string {
  return activeCount === 1 ? '1 Game' : `${activeCount} Games`;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { age } = usePlayer();

  const difficultyLabel =
    age <= 6 ? 'Starter' : age <= 10 ? 'Explorer' : age <= 13 ? 'Champion' : 'Master';

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      {/* Hero banner */}
      <section className="py-10 sm:py-14 text-center">
        <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1.5 mb-5">
          <Zap className="w-3.5 h-3.5 text-sky-500" />
          <span className="text-sm font-semibold text-sky-600">
            Difficulty: <span className="font-black">{difficultyLabel}</span> Mode (Age {age})
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-800 leading-tight">
          Ready to <span className="text-sky-500">Play</span> &amp;{' '}
          <span className="text-emerald-500">Learn</span>?
        </h1>
        <p className="text-slate-500 mt-3 text-lg max-w-xl mx-auto">
          Pick a category below and start your adventure. Earn stars as you go!
        </p>
        <div className="flex items-center justify-center gap-2 mt-5 text-sm text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Games auto-adjust to your age level</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
      </section>

      {/* Category grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const categoryGames = games.filter(
            (game) => game.category === cat.category && game.status !== 'hidden'
          );
          const activeCount = categoryGames.filter((game) => game.status === 'ready').length;

          return (
            <CategoryCard
              key={cat.category}
              icon={cat.icon}
              title={cat.category}
              subtitle={cat.subtitle}
              accentColor={cat.accentColor}
              bgColor={cat.bgColor}
              borderColor={cat.borderColor}
              badgeColor={cat.badgeColor}
              badgeText={formatActiveGamesBadge(activeCount)}
            >
              {categoryGames.map((game) => {
                const isReady = game.status === 'ready';
                const isWip = game.status === 'wip';

                return (
                  <div key={game.id} className={isWip ? 'opacity-50' : ''}>
                    <GameCard
                      title={game.title}
                      description={isWip ? `${game.description} (Coming Soon)` : game.description}
                      active={isReady}
                      onClick={isReady ? () => onNavigate(game.id) : undefined}
                    />
                  </div>
                );
              })}
            </CategoryCard>
          );
        })}
      </div>

      {/* Footer nudge */}
      <div className="mt-12 text-center">
        <p className="text-sm text-slate-400">
          More games are on the way — check back soon for new adventures!
        </p>
      </div>
    </main>
  );
}
