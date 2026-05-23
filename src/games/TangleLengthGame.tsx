import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, Trophy } from 'lucide-react';

type Props = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type Mode = 'LONGEST' | 'SHORTEST';
type Theme = 'snakes' | 'vines' | 'pipes';

type Rope = {
  id: string;
  name: string;
  color: string;
  startLabel: string;
  path: string;
  width: number;
  wiggle: number;
  length?: number;
};

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#ec4899'];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function makePath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  complexity: number,
  wave: number
) {
  const points = [start];

  for (let i = 1; i <= complexity; i++) {
    const t = i / (complexity + 1);
    const baseX = start.x + (end.x - start.x) * t;
    const baseY = start.y + (end.y - start.y) * t;

    points.push({
      x: baseX + rand(-wave, wave),
      y: baseY + rand(-wave, wave),
    });
  }

  points.push(end);

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    const c1 = {
      x: prev.x + rand(-wave, wave),
      y: prev.y + rand(-wave, wave),
    };

    const c2 = {
      x: curr.x + rand(-wave, wave),
      y: curr.y + rand(-wave, wave),
    };

    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${curr.x} ${curr.y}`;
  }

  return d;
}

export default function TangledLengthGame({ userAge, onGameComplete }: Props) {
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});

  const settings = useMemo(() => {
    if (userAge < 6) {
      return {
        count: 2,
        complexity: 1,
        wave: 55,
        title: 'Little Length Detective',
        similar: false,
      };
    }

    if (userAge <= 8) {
      return {
        count: 4,
        complexity: 3,
        wave: 95,
        title: 'Tangle Explorer',
        similar: true,
      };
    }

    return {
      count: 4,
      complexity: 6,
      wave: 135,
      title: 'Master of Twists',
      similar: true,
    };
  }, [userAge]);

  const createRound = () => {
    const theme: Theme = pick(['snakes', 'vines', 'pipes']);
    const mode: Mode = pick(['LONGEST', 'SHORTEST']);

    const starts = [
      { x: 40, y: 40, label: 'Top Left' },
      { x: 760, y: 40, label: 'Top Right' },
      { x: 40, y: 520, label: 'Bottom Left' },
      { x: 760, y: 520, label: 'Bottom Right' },
    ].slice(0, settings.count);

    const centerTargets = [
      { x: 390, y: 260 },
      { x: 430, y: 275 },
      { x: 375, y: 310 },
      { x: 420, y: 325 },
    ];

    const ropes: Rope[] = starts.map((start, index) => {
      const waveBoost =
        userAge < 6
          ? index === 0
            ? 20
            : 120
          : settings.similar
            ? settings.wave + rand(-18, 18)
            : settings.wave;

      return {
        id: `rope-${index}-${Math.random().toString(36).slice(2)}`,
        name:
          theme === 'snakes'
            ? `Snake ${index + 1}`
            : theme === 'vines'
              ? `Vine ${index + 1}`
              : `Pipe ${index + 1}`,
        color: COLORS[index],
        startLabel: start.label,
        path: makePath(
          { x: start.x, y: start.y },
          centerTargets[index],
          settings.complexity,
          waveBoost
        ),
        width: theme === 'pipes' ? 20 : 16,
        wiggle: index % 2 === 0 ? 1 : -1,
      };
    });

    return { theme, mode, ropes };
  };

  const [round, setRound] = useState(createRound);
  const [ropes, setRopes] = useState<Rope[]>(round.ropes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('Look carefully, then choose!');

  useEffect(() => {
    const measured = ropes.map((rope) => {
      const el = pathRefs.current[rope.id];
      return {
        ...rope,
        length: el ? el.getTotalLength() : 0,
      };
    });

    setRopes(measured);
  }, [round]);

  const validLengths = ropes.filter((r) => r.length && r.length > 0);

  const correctRope =
    round.mode === 'LONGEST'
      ? [...validLengths].sort((a, b) => (b.length || 0) - (a.length || 0))[0]
      : [...validLengths].sort((a, b) => (a.length || 0) - (b.length || 0))[0];

  const selectRope = (ropeId: string) => {
    if (revealing || completed || !correctRope) return;

    setSelectedId(ropeId);
    setRevealing(true);

    const isCorrect = ropeId === correctRope.id;

    if (!isCorrect) {
      setMistakes((m) => m + 1);
      setMessage('Watch the roll-back to see the answer!');
    } else {
      setMessage('Great choice! Watch it roll back!');
    }

    const longestDuration = Math.max(...ropes.map((r) => (r.length || 1) / 180));

    setTimeout(
      () => {
        setCompleted(true);
        const stars = isCorrect ? (mistakes === 0 ? 3 : 2) : 1;
        onGameComplete(stars);
      },
      longestDuration * 1000 + 700
    );
  };

  const resetRound = () => {
    const next = createRound();
    setRound(next);
    setRopes(next.ropes);
    setSelectedId(null);
    setRevealing(false);
    setCompleted(false);
    setMistakes(0);
    setMessage('Look carefully, then choose!');
  };

  const themeEmoji = round.theme === 'snakes' ? '🐍' : round.theme === 'vines' ? '🌿' : '🚰';

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-lime-50 to-emerald-100 p-4 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 rounded-[2rem] bg-white/80 p-5 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-emerald-700">
                {themeEmoji} Tangle Length Challenge
              </h1>
              <p className="font-bold text-slate-500">
                Which one is the <span className="text-emerald-700">{round.mode}</span>?
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-2xl bg-sky-100 px-4 py-2 text-sm font-black text-sky-700">
                Age {userAge}
              </div>
              <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                {settings.title}
              </div>
              <div className="rounded-2xl bg-amber-100 px-4 py-2 text-sm font-black text-amber-700">
                Mistakes: {mistakes}
              </div>
            </div>
          </div>
        </header>

        <main className="rounded-[2rem] bg-white/70 p-5 shadow-2xl backdrop-blur">
          <div className="mb-4 text-center">
            <p className="text-2xl font-black text-slate-700">
              Which one is the {round.mode.toLowerCase()}?
            </p>
            <p className="font-bold text-slate-500">{message}</p>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-sky-50 to-lime-50 shadow-inner">
            <svg viewBox="0 0 800 560" className="h-[560px] w-full touch-none select-none">
              <defs>
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feColorMatrix
                    in="blur"
                    type="matrix"
                    values="1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 0.75 0"
                  />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity="0.22" />
                </filter>

                <pattern
                  id="vineTexture"
                  patternUnits="userSpaceOnUse"
                  width="28"
                  height="28"
                  patternTransform="rotate(25)"
                >
                  <path
                    d="M 0 14 Q 7 7 14 14 T 28 14"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="3"
                  />
                </pattern>

                <pattern id="snakeTexture" patternUnits="userSpaceOnUse" width="34" height="18">
                  <circle cx="8" cy="9" r="3" fill="rgba(255,255,255,0.35)" />
                  <circle cx="25" cy="9" r="3" fill="rgba(15,23,42,0.16)" />
                </pattern>

                <pattern id="pipeTexture" patternUnits="userSpaceOnUse" width="36" height="36">
                  <path d="M 0 18 H 36" stroke="rgba(255,255,255,0.28)" strokeWidth="4" />
                  <path d="M 18 0 V 36" stroke="rgba(15,23,42,0.12)" strokeWidth="3" />
                </pattern>
              </defs>

              {ropes.map((rope) => {
                const isSelected = selectedId === rope.id;
                const isCorrect = completed && correctRope?.id === rope.id;
                const length = rope.length || 1;
                const duration = length / 180;

                return (
                  <g key={rope.id}>
                    {/* Measurement path - invisible but used for getTotalLength */}
                    <path
                      ref={(el) => {
                        pathRefs.current[rope.id] = el;
                      }}
                      d={rope.path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={rope.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Soft outer shadow */}
                    <motion.path
                      d={rope.path}
                      fill="none"
                      stroke="rgba(15,23,42,0.16)"
                      strokeWidth={rope.width + 14}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={length}
                      animate={revealing ? { strokeDashoffset: length } : { strokeDashoffset: 0 }}
                      transition={
                        revealing
                          ? { strokeDashoffset: { duration, ease: 'linear' } }
                          : { duration: 0.3 }
                      }
                      filter="url(#softShadow)"
                    />

                    {/* Main rounded body */}
                    <motion.path
                      d={rope.path}
                      fill="none"
                      stroke={rope.color}
                      strokeWidth={isCorrect ? rope.width + 5 : rope.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={length}
                      initial={{ strokeDashoffset: 0 }}
                      animate={
                        revealing
                          ? {
                              strokeDashoffset: length,
                              opacity: isCorrect || isSelected ? 1 : 0.35,
                            }
                          : {
                              strokeDashoffset: 0,
                              opacity: 1,
                            }
                      }
                      transition={
                        revealing
                          ? {
                              strokeDashoffset: {
                                duration,
                                ease: 'linear',
                              },
                            }
                          : {
                              duration: 0.3,
                            }
                      }
                      filter={isSelected || isCorrect ? 'url(#glow)' : undefined}
                      style={{
                        cursor: revealing ? 'default' : 'pointer',
                      }}
                      onClick={() => selectRope(rope.id)}
                    />

                    {/* Texture overlay */}
                    <motion.path
                      d={rope.path}
                      fill="none"
                      stroke={
                        round.theme === 'snakes'
                          ? 'url(#snakeTexture)'
                          : round.theme === 'vines'
                            ? 'url(#vineTexture)'
                            : 'url(#pipeTexture)'
                      }
                      strokeWidth={Math.max(rope.width - 4, 8)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={length}
                      initial={{ strokeDashoffset: 0 }}
                      animate={
                        revealing
                          ? {
                              strokeDashoffset: length,
                              opacity: isCorrect || isSelected ? 0.9 : 0.25,
                            }
                          : {
                              strokeDashoffset: 0,
                              opacity: 0.85,
                            }
                      }
                      transition={
                        revealing
                          ? {
                              strokeDashoffset: {
                                duration,
                                ease: 'linear',
                              },
                            }
                          : {
                              duration: 0.3,
                            }
                      }
                      pointerEvents="none"
                    />

                    {/* Inner glossy highlight */}
                    <motion.path
                      d={rope.path}
                      fill="none"
                      stroke="rgba(255,255,255,0.42)"
                      strokeWidth={Math.max(rope.width * 0.22, 3)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={length}
                      initial={{ strokeDashoffset: 0 }}
                      animate={
                        revealing
                          ? {
                              strokeDashoffset: length,
                              opacity: isCorrect || isSelected ? 0.8 : 0.2,
                            }
                          : {
                              strokeDashoffset: 0,
                              opacity: 0.75,
                            }
                      }
                      transition={
                        revealing
                          ? {
                              strokeDashoffset: {
                                duration,
                                ease: 'linear',
                              },
                            }
                          : {
                              duration: 0.3,
                            }
                      }
                      pointerEvents="none"
                    />

                    {round.theme === 'snakes' && (
                      <motion.text
                        x={rope.id.includes('0') || rope.id.includes('2') ? 55 : 730}
                        y={rope.id.includes('0') || rope.id.includes('1') ? 55 : 505}
                        fontSize="34"
                        animate={{ rotate: [0, 8 * rope.wiggle, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        onClick={() => selectRope(rope.id)}
                        className="cursor-pointer"
                      >
                        🐍
                      </motion.text>
                    )}

                    {round.theme === 'vines' && (
                      <motion.text
                        x={rope.id.includes('0') || rope.id.includes('2') ? 55 : 720}
                        y={rope.id.includes('0') || rope.id.includes('1') ? 65 : 505}
                        fontSize="30"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        onClick={() => selectRope(rope.id)}
                        className="cursor-pointer"
                      >
                        🍃
                      </motion.text>
                    )}

                    {round.theme === 'pipes' && (
                      <motion.circle
                        cx={rope.id.includes('0') || rope.id.includes('2') ? 45 : 755}
                        cy={rope.id.includes('0') || rope.id.includes('1') ? 45 : 515}
                        r="18"
                        fill={rope.color}
                        stroke="white"
                        strokeWidth="5"
                        onClick={() => selectRope(rope.id)}
                        className="cursor-pointer"
                      />
                    )}

                    <motion.circle
                      cx={rope.id.includes('0') || rope.id.includes('2') ? 40 : 760}
                      cy={rope.id.includes('0') || rope.id.includes('1') ? 40 : 520}
                      r={isSelected ? 22 : 16}
                      fill={rope.color}
                      stroke="white"
                      strokeWidth="5"
                      animate={isSelected ? { scale: [1, 1.18, 1] } : { scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      onClick={() => selectRope(rope.id)}
                      className="cursor-pointer"
                    />
                  </g>
                );
              })}
            </svg>

            <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-2 text-sm font-black text-slate-600 shadow">
              Tip: click a colored start dot or rope.
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {ropes.map((rope) => {
              const isSelected = selectedId === rope.id;
              const isCorrect = completed && correctRope?.id === rope.id;

              return (
                <button
                  key={rope.id}
                  onClick={() => selectRope(rope.id)}
                  disabled={revealing}
                  className={`rounded-3xl border-4 bg-white p-4 text-left shadow-md transition hover:-translate-y-1 disabled:cursor-not-allowed ${
                    isCorrect
                      ? 'border-emerald-400 bg-emerald-50'
                      : isSelected
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full border-4 border-white shadow"
                      style={{ backgroundColor: rope.color }}
                    />
                    <div>
                      <p className="font-black text-slate-700">{rope.name}</p>
                      <p className="text-xs font-bold text-slate-400">From {rope.startLabel}</p>
                    </div>
                  </div>

                  {completed && (
                    <p className="mt-2 text-xs font-black text-slate-500">
                      Length: {Math.round(rope.length || 0)}
                    </p>
                  )}

                  {isCorrect && (
                    <p className="mt-2 flex items-center gap-1 text-sm font-black text-emerald-600">
                      <Sparkles className="h-4 w-4" />
                      Correct answer!
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex justify-center">
            <button
              onClick={resetRound}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-emerald-700 shadow-md transition hover:-translate-y-1 active:scale-95"
            >
              <RotateCcw className="h-5 w-5" />
              New Round
            </button>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 p-4 backdrop-blur"
          >
            <div className="max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl">
              <Trophy className="mx-auto mb-3 h-16 w-16 text-amber-400" />

              <h2 className="mb-2 text-3xl font-black text-emerald-700">Mystery Solved!</h2>

              <p className="mb-4 font-bold text-slate-600">
                The {round.mode.toLowerCase()} one was{' '}
                <span className="text-emerald-700">{correctRope?.name}</span>.
              </p>

              <div className="mb-5 text-4xl">
                {selectedId === correctRope?.id ? (mistakes === 0 ? '⭐⭐⭐' : '⭐⭐') : '⭐'}
              </div>

              <button
                onClick={resetRound}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-1 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
