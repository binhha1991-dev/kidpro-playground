import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Sparkles, Undo2, Zap } from 'lucide-react';

type GameProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type Phase = 'ready' | 'showing' | 'recall' | 'feedback';

type MemoryItem = {
  id: string;
  emoji: string;
  label: string;
  color: string;
};

type MemoryTheme = {
  id: string;
  name: string;
  description: string;
  items: MemoryItem[];
};

const THEMES: MemoryTheme[] = [
  {
    id: 'fruits',
    name: 'Fruit Basket',
    description: 'Remember colorful fruits.',
    items: [
      { id: 'apple', emoji: '🍎', label: 'Apple', color: 'bg-red-100 border-red-300 text-red-700' },
      {
        id: 'banana',
        emoji: '🍌',
        label: 'Banana',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
      },
      {
        id: 'grapes',
        emoji: '🍇',
        label: 'Grapes',
        color: 'bg-purple-100 border-purple-300 text-purple-700',
      },
      {
        id: 'strawberry',
        emoji: '🍓',
        label: 'Strawberry',
        color: 'bg-pink-100 border-pink-300 text-pink-700',
      },
      {
        id: 'kiwi',
        emoji: '🥝',
        label: 'Kiwi',
        color: 'bg-lime-100 border-lime-300 text-lime-700',
      },
      {
        id: 'orange',
        emoji: '🍊',
        label: 'Orange',
        color: 'bg-orange-100 border-orange-300 text-orange-700',
      },
    ],
  },
  {
    id: 'animals',
    name: 'Animal Friends',
    description: 'Remember cute animals.',
    items: [
      {
        id: 'cat',
        emoji: '🐱',
        label: 'Cat',
        color: 'bg-amber-100 border-amber-300 text-amber-700',
      },
      {
        id: 'dog',
        emoji: '🐶',
        label: 'Dog',
        color: 'bg-orange-100 border-orange-300 text-orange-700',
      },
      {
        id: 'panda',
        emoji: '🐼',
        label: 'Panda',
        color: 'bg-slate-100 border-slate-300 text-slate-700',
      },
      {
        id: 'frog',
        emoji: '🐸',
        label: 'Frog',
        color: 'bg-green-100 border-green-300 text-green-700',
      },
      { id: 'fox', emoji: '🦊', label: 'Fox', color: 'bg-red-100 border-red-300 text-red-700' },
      {
        id: 'penguin',
        emoji: '🐧',
        label: 'Penguin',
        color: 'bg-sky-100 border-sky-300 text-sky-700',
      },
    ],
  },
  {
    id: 'shapes',
    name: 'Color Shapes',
    description: 'Remember shape and color pairs.',
    items: [
      {
        id: 'red-circle',
        emoji: '🔴',
        label: 'Red Circle',
        color: 'bg-red-100 border-red-300 text-red-700',
      },
      {
        id: 'blue-circle',
        emoji: '🔵',
        label: 'Blue Circle',
        color: 'bg-blue-100 border-blue-300 text-blue-700',
      },
      {
        id: 'green-circle',
        emoji: '🟢',
        label: 'Green Circle',
        color: 'bg-green-100 border-green-300 text-green-700',
      },
      {
        id: 'yellow-circle',
        emoji: '🟡',
        label: 'Yellow Circle',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
      },
      {
        id: 'purple-circle',
        emoji: '🟣',
        label: 'Purple Circle',
        color: 'bg-purple-100 border-purple-300 text-purple-700',
      },
      {
        id: 'orange-circle',
        emoji: '🟠',
        label: 'Orange Circle',
        color: 'bg-orange-100 border-orange-300 text-orange-700',
      },
    ],
  },
  {
    id: 'space',
    name: 'Space Mission',
    description: 'Remember cosmic objects.',
    items: [
      {
        id: 'rocket',
        emoji: '🚀',
        label: 'Rocket',
        color: 'bg-indigo-100 border-indigo-300 text-indigo-700',
      },
      {
        id: 'star',
        emoji: '⭐',
        label: 'Star',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
      },
      {
        id: 'moon',
        emoji: '🌙',
        label: 'Moon',
        color: 'bg-slate-100 border-slate-300 text-slate-700',
      },
      {
        id: 'planet',
        emoji: '🪐',
        label: 'Planet',
        color: 'bg-violet-100 border-violet-300 text-violet-700',
      },
      {
        id: 'earth',
        emoji: '🌍',
        label: 'Earth',
        color: 'bg-emerald-100 border-emerald-300 text-emerald-700',
      },
      {
        id: 'comet',
        emoji: '☄️',
        label: 'Comet',
        color: 'bg-orange-100 border-orange-300 text-orange-700',
      },
    ],
  },
  {
    id: 'weather',
    name: 'Weather Watch',
    description: 'Remember weather symbols.',
    items: [
      {
        id: 'sun',
        emoji: '☀️',
        label: 'Sun',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
      },
      {
        id: 'cloud',
        emoji: '☁️',
        label: 'Cloud',
        color: 'bg-slate-100 border-slate-300 text-slate-700',
      },
      {
        id: 'rain',
        emoji: '🌧️',
        label: 'Rain',
        color: 'bg-blue-100 border-blue-300 text-blue-700',
      },
      {
        id: 'snow',
        emoji: '❄️',
        label: 'Snow',
        color: 'bg-cyan-100 border-cyan-300 text-cyan-700',
      },
      {
        id: 'rainbow',
        emoji: '🌈',
        label: 'Rainbow',
        color: 'bg-pink-100 border-pink-300 text-pink-700',
      },
      {
        id: 'storm',
        emoji: '⛈️',
        label: 'Storm',
        color: 'bg-purple-100 border-purple-300 text-purple-700',
      },
    ],
  },
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function getDifficulty(userAge: number) {
  if (userAge < 6) {
    return {
      label: 'Starter',
      itemCount: 4,
      startLength: 3,
      maxLength: 5,
      showMs: 950,
      gapMs: 220,
      allowUndo: true,
    };
  }

  if (userAge <= 8) {
    return {
      label: 'Explorer',
      itemCount: 5,
      startLength: 4,
      maxLength: 7,
      showMs: 760,
      gapMs: 180,
      allowUndo: true,
    };
  }

  return {
    label: 'Champion',
    itemCount: 6,
    startLength: 5,
    maxLength: 9,
    showMs: 580,
    gapMs: 130,
    allowUndo: false,
  };
}

function makeSequence(length: number, itemCount: number): string[] {
  return Array.from({ length }, () => Math.floor(Math.random() * itemCount).toString());
}

export default function MemorySequence({ userAge, onGameComplete }: GameProps) {
  const difficulty = useMemo(() => getDifficulty(userAge), [userAge]);
  const completedRef = useRef(false);

  const [theme, setTheme] = useState<MemoryTheme>(() => randomItem(THEMES));
  const [items, setItems] = useState<MemoryItem[]>(() => randomItem(THEMES).items.slice(0, 6));
  const [phase, setPhase] = useState<Phase>('ready');
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [lastClicked, setLastClicked] = useState<number | null>(null);
  const [wrongSlot, setWrongSlot] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('Choose a theme and start the memory challenge!');

  function startNewGame() {
    const nextTheme = randomItem(THEMES);
    const nextItems = nextTheme.items.slice(0, difficulty.itemCount);

    setTheme(nextTheme);
    setItems(nextItems);
    setRound(1);
    setMistakes(0);
    setAnswer([]);
    setWrongSlot(null);
    setLastClicked(null);
    setActiveIndex(null);
    setSequence(makeSequence(difficulty.startLength, difficulty.itemCount));
    setPhase('showing');
    setMessage('Watch the sequence carefully.');
    completedRef.current = false;
  }

  function nextRound() {
    const nextLength = Math.min(difficulty.startLength + round, difficulty.maxLength);
    setRound((current) => current + 1);
    setAnswer([]);
    setWrongSlot(null);
    setLastClicked(null);
    setActiveIndex(null);
    setSequence(makeSequence(nextLength, difficulty.itemCount));
    setPhase('showing');
    setMessage('New sequence! Watch carefully.');
  }

  useEffect(() => {
    if (phase !== 'showing' || sequence.length === 0) return;

    let cancelled = false;

    async function playSequence() {
      for (let i = 0; i < sequence.length; i++) {
        if (cancelled) return;

        const itemIndex = Number(sequence[i]);
        setActiveIndex(itemIndex);

        await new Promise((resolve) => window.setTimeout(resolve, difficulty.showMs));

        setActiveIndex(null);

        await new Promise((resolve) => window.setTimeout(resolve, difficulty.gapMs));
      }

      if (!cancelled) {
        setPhase('recall');
        setMessage('Now repeat the sequence from memory.');
      }
    }

    playSequence();

    return () => {
      cancelled = true;
    };
  }, [phase, sequence, difficulty.showMs, difficulty.gapMs]);

  function handleChoose(index: number) {
    if (phase !== 'recall') return;

    const selectedId = index.toString();
    const nextAnswer = [...answer, selectedId];
    const expected = sequence[answer.length];

    setAnswer(nextAnswer);
    setLastClicked(index);

    window.setTimeout(() => setLastClicked(null), 260);

    if (selectedId !== expected) {
      setWrongSlot(answer.length);
      setMistakes((current) => current + 1);
      setMessage(`Oops! The correct next item was ${items[Number(expected)]?.emoji ?? ''}`);

      window.setTimeout(() => {
        setPhase('feedback');
      }, 650);

      return;
    }

    if (nextAnswer.length === sequence.length) {
      setMessage('Perfect sequence! ✨');

      window.setTimeout(() => {
        setPhase('feedback');
      }, 550);
    }
  }

  function undoLast() {
    if (phase !== 'recall' || !difficulty.allowUndo || answer.length === 0) return;

    setAnswer((current) => current.slice(0, -1));
    setMessage('Undo complete. Try that step again.');
  }

  function finishGame() {
    if (completedRef.current) return;

    completedRef.current = true;

    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    onGameComplete(stars);
  }

  const success = phase === 'feedback' && answer.length === sequence.length && wrongSlot === null;
  const fail = phase === 'feedback' && wrongSlot !== null;

  return (
    <div className="min-h-[720px] w-full rounded-3xl bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-4 text-slate-800 shadow-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="rounded-3xl border border-sky-200 bg-white/90 p-5 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-500">
            Memory Sequence v3
          </p>
          <h2 className="mt-1 text-3xl font-black text-slate-800">Pattern Memory Lab</h2>
          <p className="mt-1 font-bold text-slate-500">{message}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm font-black">
            <span className="rounded-full bg-sky-100 px-4 py-2 text-sky-700">
              {difficulty.label}
            </span>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-emerald-700">
              Theme: {theme.name}
            </span>
            <span className="rounded-full bg-amber-100 px-4 py-2 text-amber-700">
              Round {round}
            </span>
          </div>
        </header>

        {phase === 'ready' && (
          <section className="rounded-[2rem] bg-white/90 p-8 text-center shadow-lg">
            <div className="mb-4 text-7xl">🧠</div>
            <h3 className="mb-2 text-2xl font-black text-slate-800">Train visual memory</h3>
            <p className="mx-auto mb-6 max-w-xl font-semibold text-slate-500">
              Each game uses one themed item set. Watch the flashing sequence, then rebuild it in
              the answer row.
            </p>

            <button
              type="button"
              onClick={startNewGame}
              className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-8 py-4 font-black text-white shadow-lg transition hover:-translate-y-1 active:scale-95"
            >
              Start Memory Lab
            </button>
          </section>
        )}

        {phase !== 'ready' && (
          <>
            <section className="rounded-[2rem] bg-white/85 p-5 shadow-lg">
              <div className="mb-3 text-center">
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">
                  {theme.description}
                </p>
              </div>

              <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4">
                {items.map((item, index) => {
                  const isActive = activeIndex === index;
                  const isClicked = lastClicked === index;

                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => handleChoose(index)}
                      disabled={phase !== 'recall'}
                      animate={
                        isActive
                          ? { scale: [1, 1.18, 1], y: [0, -8, 0] }
                          : isClicked
                            ? { scale: [1, 1.12, 1] }
                            : { scale: 1 }
                      }
                      transition={{ duration: 0.32 }}
                      className={`relative flex h-28 w-28 flex-col items-center justify-center rounded-3xl border-4 p-3 shadow-md transition hover:-translate-y-1 disabled:cursor-default sm:h-32 sm:w-32 ${item.color} ${
                        isActive ? 'ring-4 ring-sky-400 ring-offset-2' : ''
                      }`}
                    >
                      <div className="text-5xl sm:text-6xl">{item.emoji}</div>

                      <div className="mt-2 text-center text-xs font-black uppercase tracking-wide">
                        {item.label}
                      </div>

                      {phase === 'recall' && (
                        <div className="absolute -right-2 -top-2 rounded-full bg-white px-2 py-1 text-xs font-black text-slate-500 shadow">
                          {index + 1}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white/85 p-5 shadow-lg">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-black text-slate-700">Your Answer</p>
                <p className="text-sm font-bold text-slate-400">
                  {answer.length}/{sequence.length}
                </p>
              </div>

              <div className="flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-3xl bg-slate-50 p-4">
                {Array.from({ length: sequence.length }).map((_, index) => {
                  const answerId = answer[index];
                  const item = answerId !== undefined ? items[Number(answerId)] : undefined;
                  const isWrong = wrongSlot === index;

                  return (
                    <motion.div
                      key={index}
                      animate={
                        isWrong
                          ? { x: [-8, 8, -6, 6, 0], scale: [1, 1.1, 1] }
                          : item
                            ? { scale: [0.7, 1.12, 1] }
                            : { scale: 1 }
                      }
                      transition={{ duration: 0.38 }}
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl border-4 text-3xl shadow-sm ${
                        isWrong
                          ? 'border-red-400 bg-red-100'
                          : item
                            ? `${item.color}`
                            : 'border-dashed border-slate-300 bg-white text-slate-300'
                      }`}
                    >
                      {item ? item.emoji : '?'}
                    </motion.div>
                  );
                })}
              </div>

              {phase === 'recall' && difficulty.allowUndo && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={undoLast}
                    disabled={answer.length === 0}
                    className="flex items-center gap-2 rounded-2xl bg-slate-200 px-5 py-3 font-black text-slate-700 transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Undo2 size={18} />
                    Undo
                  </button>
                </div>
              )}
            </section>

            <AnimatePresence>
              {phase === 'feedback' && (
                <motion.section
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="rounded-[2rem] bg-white/95 p-6 text-center shadow-xl"
                >
                  {success && (
                    <>
                      <Sparkles className="mx-auto mb-2 h-12 w-12 text-amber-400" />
                      <h3 className="text-3xl font-black text-emerald-600">Great memory!</h3>
                      <p className="mt-2 font-bold text-slate-500">
                        You rebuilt the sequence correctly.
                      </p>

                      {round < 5 ? (
                        <button
                          type="button"
                          onClick={nextRound}
                          className="mt-5 rounded-2xl bg-emerald-400 px-7 py-3 font-black text-emerald-950 shadow transition hover:-translate-y-1"
                        >
                          Next Round
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={finishGame}
                          className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-7 py-3 font-black text-white shadow transition hover:-translate-y-1"
                        >
                          Complete Game
                        </button>
                      )}
                    </>
                  )}

                  {fail && (
                    <>
                      <div className="mb-2 text-5xl">🌧️</div>
                      <h3 className="text-3xl font-black text-rose-600">Almost!</h3>
                      <p className="mt-2 font-bold text-slate-500">
                        Watch the sequence again and try a new run.
                      </p>

                      <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={startNewGame}
                          className="rounded-2xl bg-sky-400 px-7 py-3 font-black text-white shadow transition hover:-translate-y-1"
                        >
                          New Game
                        </button>
                        <button
                          type="button"
                          onClick={finishGame}
                          className="rounded-2xl bg-slate-200 px-7 py-3 font-black text-slate-700 shadow transition hover:-translate-y-1"
                        >
                          Finish
                        </button>
                      </div>
                    </>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            <footer className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={startNewGame}
                className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-sky-700 shadow transition hover:-translate-y-1"
              >
                <RotateCcw size={18} />
                New Theme
              </button>

              {phase === 'recall' && (
                <div className="flex items-center gap-2 rounded-2xl bg-amber-100 px-5 py-3 font-black text-amber-700">
                  <Zap size={18} />
                  Repeat the pattern in order
                </div>
              )}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
