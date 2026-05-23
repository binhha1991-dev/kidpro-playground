import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Sparkles, Timer, Undo2 } from 'lucide-react';

type GameProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type RobotSkin = 'antenna' | 'box' | 'ball' | 'visor' | 'twin';

type Robot = {
  id: string;
  height: number;
  color: string;
  skin: RobotSkin;
};

const COLORS = [
  '#38BDF8',
  '#F472B6',
  '#FBBF24',
  '#34D399',
  '#A78BFA',
  '#FB7185',
  '#60A5FA',
  '#4ADE80',
];

const SKINS: RobotSkin[] = ['antenna', 'box', 'ball', 'visor', 'twin'];

function makeId() {
  return Math.random().toString(36).slice(2);
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function isSorted(robots: Robot[]) {
  return robots.every((robot, index) => index === 0 || robots[index - 1].height <= robot.height);
}

function inversionCount(robots: Robot[]) {
  let count = 0;

  for (let i = 0; i < robots.length; i++) {
    for (let j = i + 1; j < robots.length; j++) {
      if (robots[i].height > robots[j].height) count += 1;
    }
  }

  return count;
}

function generateRobots(count: number, easy: boolean): Robot[] {
  const heights = easy
    ? [2, 6, 10].slice(0, count)
    : shuffle(Array.from({ length: Math.max(10, count + 2) }, (_, index) => index + 1)).slice(
        0,
        count
      );

  let robots = heights.map((height, index) => ({
    id: makeId(),
    height,
    color: COLORS[index % COLORS.length],
    skin: SKINS[index % SKINS.length],
  }));

  do {
    robots = shuffle(robots);
  } while (isSorted(robots));

  return robots;
}

function RobotFigure({
  robot,
  selected,
  preview,
  gold,
  showLabel,
}: {
  robot: Robot;
  selected: boolean;
  preview: boolean;
  gold: boolean;
  showLabel: boolean;
}) {
  const bodyHeight = 70 + robot.height * 12;
  const color = gold ? '#FACC15' : robot.color;

  return (
    <div className="flex flex-col items-center justify-end">
      <div className="relative flex flex-col items-center">
        {robot.skin === 'antenna' && (
          <div className="mb-1 h-6 w-1 rounded-full bg-slate-600">
            <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-400" />
          </div>
        )}

        <div
          className={`relative flex w-16 flex-col items-center justify-center rounded-t-3xl border-4 border-slate-700 shadow-lg ${
            selected ? 'ring-4 ring-yellow-300' : ''
          } ${preview ? 'ring-4 ring-sky-300' : ''}`}
          style={{
            height: bodyHeight,
            backgroundColor: color,
            filter: gold
              ? 'drop-shadow(0 0 18px rgba(250,204,21,0.85))'
              : 'drop-shadow(0 8px 8px rgba(15,23,42,0.18))',
          }}
        >
          {robot.skin === 'box' && (
            <div className="absolute top-4 h-8 w-10 rounded-xl bg-white/35" />
          )}
          {robot.skin === 'ball' && (
            <div className="absolute top-4 h-9 w-9 rounded-full bg-white/35" />
          )}
          {robot.skin === 'visor' && (
            <div className="absolute top-5 h-7 w-11 rounded-full bg-slate-900/70" />
          )}
          {robot.skin === 'twin' && (
            <div className="absolute top-5 flex gap-2">
              <div className="h-4 w-4 rounded-full bg-white/70" />
              <div className="h-4 w-4 rounded-full bg-white/70" />
            </div>
          )}

          {showLabel && (
            <div className="mt-8 rounded-full bg-white/80 px-3 py-1 text-lg font-black text-slate-800">
              {robot.height}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <div className="h-5 w-4 rounded-b-lg bg-slate-700" />
          <div className="h-5 w-4 rounded-b-lg bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default function SortingFactoryProMax({ userAge, onGameComplete }: GameProps) {
  const completedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const config = useMemo(() => {
    if (userAge < 6) {
      return {
        count: 3,
        title: 'Tiny Sort Parade',
        showGhost: true,
        showLabels: false,
        timeLimit: null as number | null,
        limitedMoves: false,
      };
    }

    if (userAge <= 8) {
      return {
        count: 5,
        title: 'Factory Sorting Team',
        showGhost: false,
        showLabels: true,
        timeLimit: null as number | null,
        limitedMoves: false,
      };
    }

    return {
      count: 8,
      title: 'Sorting Factory PRO MAX',
      showGhost: false,
      showLabels: true,
      timeLimit: 60,
      limitedMoves: true,
    };
  }, [userAge]);

  const [robots, setRobots] = useState<Robot[]>([]);
  const [history, setHistory] = useState<Robot[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [swaps, setSwaps] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit ?? 0);
  const [initialInversions, setInitialInversions] = useState(0);
  const [finalStars, setFinalStars] = useState<number | null>(null);
  const [message, setMessage] = useState('Swap neighbors to sort the parade!');

  const correctOrder = useMemo(() => [...robots].sort((a, b) => a.height - b.height), [robots]);
  const currentInversions = useMemo(() => inversionCount(robots), [robots]);
  const efficiency = useMemo(() => {
    if (userAge < 6) return 100;
    if (initialInversions === 0) return 100;
    return Math.min(100, Math.round((initialInversions / Math.max(1, swaps)) * 100));
  }, [initialInversions, swaps, userAge]);
  const maxMoves = useMemo(() => Math.max(1, initialInversions + 6), [initialInversions]);

  function newRound() {
    if (timerRef.current) window.clearInterval(timerRef.current);

    const nextRobots = generateRobots(config.count, userAge < 6);
    const nextInitialInversions = inversionCount(nextRobots);

    setRobots(nextRobots);
    setInitialInversions(nextInitialInversions);
    setHistory([]);
    setSelectedId(null);
    setHoverId(null);
    setSwaps(0);
    setMistakes(0);
    setCombo(0);
    setCompleted(false);
    setFinalStars(null);
    setTimeLeft(config.timeLimit ?? 0);
    setMessage('Swap neighbors to sort the parade!');
    completedRef.current = false;
  }

  useEffect(() => {
    newRound();

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [userAge]);

  useEffect(() => {
    if (!config.timeLimit || completed) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setMistakes((m) => m + 1);
          setMessage('Time pressure! Keep sorting carefully.');
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [config.timeLimit, completed]);

  function finishIfSorted(nextRobots: Robot[], nextSwaps: number, nextMistakes: number) {
    if (!isSorted(nextRobots) || completedRef.current) return;

    completedRef.current = true;
    setCompleted(true);
    setSelectedId(null);
    setHoverId(null);

    const finalEfficiency =
      userAge < 6 || initialInversions === 0
        ? 100
        : Math.min(100, Math.round((initialInversions / Math.max(1, nextSwaps)) * 100));

    let stars = 1;

    if (userAge < 6) {
      stars = 3;
    } else if (nextMistakes === 0 && finalEfficiency >= 90) {
      stars = 3;
    } else if (nextMistakes <= 2 && finalEfficiency >= 70) {
      stars = 2;
    }

    setFinalStars(stars);

    if (stars === 3) {
      setMessage('Perfect sorting strategy!');
    } else if (stars === 2) {
      setMessage('Good sorting, but some swaps were extra.');
    } else {
      setMessage('Sorted! Try fewer swaps next time.');
    }

    onGameComplete(stars);
  }

  function swapNeighbors(firstIndex: number, secondIndex: number) {
    if (completed) return;

    if (config.limitedMoves && swaps >= maxMoves) {
      setMistakes((m) => m + 1);
      setMessage('Out of efficient moves! Undo or start a new factory run.');
      return;
    }

    const before = currentInversions;
    const nextRobots = [...robots];

    [nextRobots[firstIndex], nextRobots[secondIndex]] = [
      nextRobots[secondIndex],
      nextRobots[firstIndex],
    ];

    const after = inversionCount(nextRobots);
    const improved = after < before;
    const nextSwaps = swaps + 1;
    const nextMistakes = improved ? mistakes : mistakes + 1;

    setHistory((current) => [...current, robots]);
    setRobots(nextRobots);
    setSwaps(nextSwaps);
    setSelectedId(null);

    if (improved) {
      setCombo((c) => c + 1);
      setMessage('Nice! That swap made the order better.');
    } else {
      setCombo(0);
      setMistakes((m) => m + 1);
      setMessage('Careful! That swap made the sorting harder.');
    }

    finishIfSorted(nextRobots, nextSwaps, nextMistakes);
  }

  function clickRobot(robotId: string) {
    if (completed) return;

    if (!selectedId) {
      setSelectedId(robotId);
      setMessage('Now tap a direct neighbor to swap.');
      return;
    }

    if (selectedId === robotId) {
      setSelectedId(null);
      setMessage('Selection cleared.');
      return;
    }

    const firstIndex = robots.findIndex((robot) => robot.id === selectedId);
    const secondIndex = robots.findIndex((robot) => robot.id === robotId);

    if (Math.abs(firstIndex - secondIndex) !== 1) {
      setSelectedId(robotId);
      setMessage('Only neighboring robots can swap!');
      return;
    }

    swapNeighbors(firstIndex, secondIndex);
  }

  function undo() {
    if (completed || history.length === 0) return;

    const previous = history[history.length - 1];

    setRobots(previous);
    setHistory((current) => current.slice(0, -1));
    setSwaps((s) => Math.max(0, s - 1));
    setSelectedId(null);
    setHoverId(null);
    setMessage('Undo complete. Try a better swap.');
  }

  return (
    <div className="min-h-[720px] w-full rounded-3xl bg-[#F0FDF4] p-4 text-slate-700 shadow-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="rounded-3xl border border-emerald-200 bg-white p-4 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-500">
            Sorting Factory
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-800">{config.title}</h2>
          <p className="mt-1 font-semibold text-slate-500">{message}</p>
          {userAge >= 9 && !completed && (
            <p className="mt-2 text-sm font-bold text-slate-400">
              Tip: compare neighbors and push taller robots to the right.
            </p>
          )}
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">Swaps</p>
            <div className="text-4xl font-black text-emerald-600">
              {swaps}
              {config.limitedMoves && <span className="text-xl text-slate-400">/{maxMoves}</span>}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Unsorted Pairs
            </p>
            <div className="text-4xl font-black text-sky-600">{currentInversions}</div>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">Combo</p>
            <div className="text-4xl font-black text-yellow-500">{combo}</div>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Efficiency
            </p>
            <div className="text-4xl font-black text-purple-500">{efficiency}%</div>
            {userAge >= 6 && (
              <p className="mt-1 text-xs font-bold text-slate-400">
                Optimal: {initialInversions || 0} swaps
              </p>
            )}
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            {config.timeLimit ? (
              <>
                <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide text-pink-400">
                  <Timer size={18} />
                  Time
                </div>
                <div className="text-4xl font-black text-pink-500">{timeLeft}s</div>
              </>
            ) : (
              <>
                <p className="text-sm font-bold uppercase tracking-wide text-slate-400">Goal</p>
                <div className="text-lg font-black text-slate-700">Short ➜ Tall</div>
              </>
            )}
          </div>
        </section>

        <main className="relative overflow-hidden rounded-[2rem] border-4 border-emerald-200 bg-white p-5 shadow-inner">
          <div
            className="absolute bottom-8 left-0 h-20 w-[200%] opacity-40"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #0f766e 0 28px, #14b8a6 28px 56px)',
              animation: 'sorting-belt 6s linear infinite',
            }}
          />

          <style>{`
            @keyframes sorting-belt {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}</style>

          {config.showGhost && (
            <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 items-end gap-6 opacity-20">
              {correctOrder.map((robot) => (
                <div
                  key={`ghost-${robot.id}`}
                  className="w-16 rounded-t-3xl border-4 border-dashed border-slate-500"
                  style={{ height: 70 + robot.height * 12 }}
                />
              ))}
            </div>
          )}

          <div className="relative z-10 flex min-h-[350px] items-end justify-center gap-4 overflow-x-auto pb-10">
            <AnimatePresence>
              {robots.map((robot, index) => {
                const hoverIndex = robots.findIndex((item) => item.id === hoverId);
                const selectedIndex = robots.findIndex((item) => item.id === selectedId);

                const isPreview =
                  hoverId !== null && hoverIndex !== -1 && Math.abs(index - hoverIndex) === 1;

                const isSelectedNeighbor =
                  selectedId !== null &&
                  selectedIndex !== -1 &&
                  Math.abs(index - selectedIndex) === 1;

                return (
                  <motion.button
                    layout
                    key={robot.id}
                    type="button"
                    onMouseEnter={() => setHoverId(robot.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={() => clickRobot(robot.id)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: selectedId === robot.id ? 1.08 : 1,
                    }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className="relative rounded-3xl p-2 transition hover:-translate-y-1"
                  >
                    <RobotFigure
                      robot={robot}
                      selected={selectedId === robot.id || isSelectedNeighbor}
                      preview={isPreview}
                      gold={completed}
                      showLabel={config.showLabels}
                    />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {completed && (
              <motion.div
                className="pointer-events-none absolute inset-y-0 left-0 z-30 w-32 bg-gradient-to-r from-transparent via-yellow-200/70 to-transparent"
                initial={{ x: '-30%' }}
                animate={{ x: '780%' }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />
            )}
          </AnimatePresence>
        </main>

        <footer className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex min-h-10 items-center justify-center text-center text-lg font-bold">
            {!completed && userAge < 6 && (
              <span className="text-emerald-600">Match the shadow order: small, medium, tall.</span>
            )}

            {!completed && userAge >= 6 && (
              <span className="text-slate-500">
                Tap one robot, then tap its neighbor to swap. Good swaps reduce unsorted pairs.
              </span>
            )}

            {completed && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 text-yellow-600"
              >
                <Sparkles size={24} />
                {finalStars === 3
                  ? 'Perfect parade! All robots are sorted efficiently!'
                  : finalStars === 2
                    ? 'Great parade! Try fewer swaps for 3 stars.'
                    : 'Parade sorted! Replay to improve efficiency.'}
                <Sparkles size={24} />
              </motion.div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={undo}
              disabled={completed || history.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-slate-200 px-6 py-3 font-black text-slate-700 shadow-sm transition hover:-translate-y-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Undo2 size={20} />
              Undo
            </button>

            <button
              type="button"
              onClick={newRound}
              className="flex items-center gap-2 rounded-2xl bg-emerald-300 px-6 py-3 font-black text-emerald-950 shadow-sm transition hover:-translate-y-1 hover:bg-emerald-200"
            >
              <RotateCcw size={20} />
              New Factory
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
