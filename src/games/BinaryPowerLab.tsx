import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, RotateCcw, Sparkles, Timer, Zap } from 'lucide-react';

type GameProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type GameMode = 'build' | 'decode';

type Puzzle = {
  target: number;
  activeIndexes: number[];
};

const POWER_COLORS = [
  'rgba(250,204,21,0.95)',
  'rgba(34,211,238,0.95)',
  'rgba(167,139,250,0.95)',
  'rgba(52,211,153,0.95)',
  'rgba(244,114,182,0.95)',
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeBinary(value: number, bits: number) {
  return value.toString(2).padStart(bits, '0');
}

function pickColor() {
  return POWER_COLORS[randomInt(0, POWER_COLORS.length - 1)];
}

function getMaxActiveBits(userAge: number) {
  if (userAge < 6) return 2;
  if (userAge <= 8) return 3;
  return 4;
}

function generateBuildPuzzle(bits: number, userAge: number): Puzzle {
  const maxActiveBits = getMaxActiveBits(userAge);
  const count = randomInt(1, maxActiveBits);
  const indexes = shuffle(Array.from({ length: bits }, (_, index) => index)).slice(0, count);
  const target = indexes.reduce((sum, index) => sum + 2 ** index, 0);

  return {
    target,
    activeIndexes: indexes,
  };
}

export default function BinaryPowerLab({ userAge, onGameComplete }: GameProps) {
  const completedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const config = useMemo(() => {
    if (userAge < 6) {
      return {
        bits: 3,
        max: 7,
        title: 'Little Light Lab',
        showBreakdown: true,
        timeLimit: null as number | null,
        allowDecodeMode: false,
      };
    }

    if (userAge <= 8) {
      return {
        bits: 5,
        max: 31,
        title: 'Binary Builder Lab',
        showBreakdown: true,
        timeLimit: null as number | null,
        allowDecodeMode: false,
      };
    }

    return {
      bits: 8,
      max: 255,
      title: 'Byte Power Lab Pro',
      showBreakdown: false,
      timeLimit: 60,
      allowDecodeMode: true,
    };
  }, [userAge]);

  const values = useMemo(
    () => Array.from({ length: config.bits }, (_, index) => 2 ** index),
    [config.bits]
  );

  const maxActiveBits = useMemo(() => getMaxActiveBits(userAge), [userAge]);

  const [mode, setMode] = useState<GameMode>('build');
  const [target, setTarget] = useState(1);
  const [, setSolutionIndexes] = useState<number[]>([]);
  const [switches, setSwitches] = useState<boolean[]>([]);
  const [answer, setAnswer] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit ?? 0);
  const [powerColor, setPowerColor] = useState(POWER_COLORS[0]);
  const [message, setMessage] = useState('Build the target number with binary lights!');

  const total = switches.reduce((sum, on, index) => sum + (on ? values[index] : 0), 0);
  const activeCount = switches.filter(Boolean).length;

  const binaryString = switches
    .slice()
    .reverse()
    .map((on) => (on ? '1' : '0'))
    .join('');

  const targetBreakdown = values
    .slice()
    .reverse()
    .filter((value) => (target & value) !== 0);

  function newRound(forceMode?: GameMode) {
    const nextMode =
      forceMode ?? (config.allowDecodeMode && Math.random() > 0.5 ? 'decode' : 'build');

    if (nextMode === 'build') {
      const puzzle = generateBuildPuzzle(config.bits, userAge);

      setMode('build');
      setTarget(puzzle.target);
      setSolutionIndexes(puzzle.activeIndexes);
      setSwitches(Array.from({ length: config.bits }, () => false));
      setMessage(`Build the target using up to ${maxActiveBits} lights.`);
    } else {
      const nextTarget = randomInt(1, config.max);
      const nextBinary = makeBinary(nextTarget, config.bits);

      setMode('decode');
      setTarget(nextTarget);
      setSolutionIndexes([]);
      setSwitches(
        nextBinary
          .split('')
          .reverse()
          .map((bit) => bit === '1')
      );
      setMessage('Decode the glowing binary number!');
    }

    setAnswer('');
    setMistakes(0);
    setMoves(0);
    setCompleted(false);
    setTimeLeft(config.timeLimit ?? 0);
    setPowerColor(pickColor());
    completedRef.current = false;
  }

  useEffect(() => {
    newRound('build');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAge]);

  useEffect(() => {
    if (!config.timeLimit || completed) return;

    if (timerRef.current) window.clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setMistakes((m) => m + 1);
          setMessage('Time reset! Try to solve the lab faster.');
          return config.timeLimit ?? 60;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [config.timeLimit, completed, mode, target]);

  function calculateStars() {
    const fastBonus = config.timeLimit ? timeLeft > config.timeLimit * 0.55 : true;
    const efficientMoves = mode === 'build' ? moves <= maxActiveBits + 2 : moves <= 4;

    if (mistakes === 0 && fastBonus && efficientMoves) return 3;
    if (mistakes <= 2) return 2;
    return 1;
  }

  function finishRound() {
    if (completedRef.current) return;

    completedRef.current = true;
    setCompleted(true);
    setCombo((current) => current + 1);
    setMessage('Lab powered up! Binary success! ✨');

    if (timerRef.current) window.clearInterval(timerRef.current);

    onGameComplete(calculateStars());
  }

  function toggleSwitch(index: number) {
    if (completed || mode === 'decode') return;

    const isCurrentlyOn = switches[index];

    if (!isCurrentlyOn && activeCount >= maxActiveBits) {
      setMessage(`You can only turn on ${maxActiveBits} lights. Turn one off first.`);
      setMistakes((m) => m + 1);
      setCombo(0);
      return;
    }

    setSwitches((current) => current.map((value, i) => (i === index ? !value : value)));
    setMoves((m) => m + 1);
    setMessage('Good. Check the total or adjust your lights.');
  }

  function resetSwitches() {
    if (completed || mode !== 'build') return;

    setSwitches(Array.from({ length: config.bits }, () => false));
    setMoves((m) => m + 1);
    setMessage('Lights reset. Try a cleaner combination.');
  }

  function checkBuildAnswer() {
    if (completed || mode !== 'build') return;

    if (total === target) {
      finishRound();
    } else {
      setMistakes((m) => m + 1);
      setCombo(0);

      if (total < target) {
        setMessage(`Need ${target - total} more power.`);
      } else {
        setMessage(`Too much power by ${total - target}. Turn some lights off.`);
      }
    }
  }

  function checkDecodeAnswer() {
    if (completed || mode !== 'decode') return;

    if (Number(answer) === target) {
      finishRound();
    } else {
      setMistakes((m) => m + 1);
      setCombo(0);
      setMessage('Not quite. Add the glowing bit values carefully.');
    }
  }

  function typeDigit(digit: string) {
    if (completed || mode !== 'decode') return;
    if (answer.length >= 3) return;

    setAnswer((current) => current + digit);
    setMoves((m) => m + 1);
  }

  function clearAnswer() {
    if (completed || mode !== 'decode') return;
    setAnswer('');
  }

  return (
    <div className="min-h-[720px] w-full rounded-3xl bg-[#0F172A] p-4 text-white shadow-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header
          className="rounded-3xl border border-cyan-400/30 bg-slate-950 p-4 text-center shadow-[0_0_32px_rgba(34,211,238,0.18)]"
          style={{
            backgroundImage: 'radial-gradient(rgba(34,211,238,0.18) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Binary Power Lab
          </p>
          <h2 className="mt-1 text-2xl font-black">{config.title}</h2>
          <p className="mt-1 font-semibold text-slate-300">{message}</p>
        </header>

        <main className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <section className="relative overflow-hidden rounded-[2rem] border border-cyan-400/30 bg-slate-950 p-5 shadow-[inset_0_0_40px_rgba(34,211,238,0.12)]">
            <AnimatePresence>
              {completed && (
                <motion.div
                  className="pointer-events-none absolute inset-0 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.25, 0.7, 0.25] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  style={{
                    background: `radial-gradient(circle at center, ${powerColor}, transparent 62%)`,
                  }}
                />
              )}
            </AnimatePresence>

            <div
              className="relative z-20 grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${config.bits}, minmax(0, 1fr))`,
              }}
            >
              {values.map((value, index) => {
                const on = switches[index];

                return (
                  <div
                    key={value}
                    className="relative flex flex-col items-center rounded-3xl border border-slate-700 bg-slate-900 p-3 shadow-lg"
                  >
                    <motion.div
                      animate={
                        on ? { scale: [1, 1.12, 1], rotate: [-2, 2, -2] } : { scale: 1, rotate: 0 }
                      }
                      transition={
                        on ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : undefined
                      }
                      className={on ? 'text-yellow-300' : 'text-slate-600'}
                      style={{
                        filter: on ? 'drop-shadow(0 0 18px rgba(250,204,21,0.95))' : 'none',
                      }}
                    >
                      <Lightbulb size={userAge < 6 ? 54 : 44} strokeWidth={2.6} />
                    </motion.div>

                    <button
                      type="button"
                      onClick={() => toggleSwitch(index)}
                      disabled={mode === 'decode' || completed}
                      className={`mt-4 h-12 w-20 rounded-full p-1 transition disabled:cursor-not-allowed ${
                        on
                          ? 'bg-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.65)]'
                          : 'bg-slate-700'
                      }`}
                    >
                      <motion.div
                        animate={{ x: on ? 32 : 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                        className={`h-10 w-10 rounded-full ${on ? 'bg-yellow-50' : 'bg-slate-400'}`}
                      />
                    </button>

                    <div className="mt-3 rounded-full bg-slate-950 px-3 py-1 font-mono text-sm font-black text-cyan-200">
                      {value}
                    </div>

                    <div className="mt-1 text-xs font-bold text-slate-500">{on ? '1' : '0'}</div>

                    {on && (
                      <motion.div
                        className="pointer-events-none absolute top-5 rounded-full bg-emerald-300 px-3 py-1 text-sm font-black text-emerald-950"
                        initial={{ y: 0, opacity: 0, scale: 0.5 }}
                        animate={{ y: -34, opacity: [0, 1, 0], scale: [0.6, 1.1, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
                      >
                        +{value}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="flex flex-col gap-4 rounded-[2rem] border border-cyan-400/30 bg-slate-950 p-4 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
            <div className="rounded-3xl border border-yellow-300/30 bg-slate-900 p-5 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-300">
                {mode === 'build' ? 'Target' : 'Binary Code'}
              </p>

              {mode === 'build' ? (
                <>
                  <div className="mt-2 text-6xl font-black text-yellow-200 drop-shadow">
                    {target}
                  </div>

                  <div className="mt-2 rounded-2xl bg-slate-950 p-2 text-sm font-black text-yellow-100">
                    Use up to {maxActiveBits} lights
                  </div>

                  {(config.showBreakdown || completed) && (
                    <div className="mt-2 rounded-2xl bg-slate-950 p-2 font-mono text-sm font-black text-yellow-100">
                      {targetBreakdown.join(' + ')}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="mt-2 rounded-2xl bg-slate-950 p-3 font-mono text-4xl font-black tracking-widest text-yellow-200">
                    {makeBinary(target, config.bits)}
                  </div>
                  <p className="mt-2 font-semibold text-slate-400">What number does this make?</p>
                </>
              )}
            </div>

            <div className="rounded-3xl border border-cyan-300/30 bg-slate-900 p-5 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
                {mode === 'build' ? 'Current Total' : 'Your Answer'}
              </p>

              <motion.div
                key={mode === 'build' ? total : answer}
                initial={{ scale: 0.82 }}
                animate={{ scale: 1 }}
                className="mt-2 text-6xl font-black text-cyan-200"
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(34,211,238,0.65))',
                }}
              >
                {mode === 'build' ? total : answer || '?'}
              </motion.div>

              <div className="mt-3 rounded-2xl bg-slate-950 p-3 font-mono text-sm font-bold text-slate-300">
                {binaryString}
              </div>

              {mode === 'build' && (
                <p className="mt-2 text-xs font-bold text-slate-500">
                  Lights used: {activeCount}/{maxActiveBits}
                </p>
              )}
            </div>

            {mode === 'decode' && (
              <div className="grid grid-cols-5 gap-2 rounded-3xl bg-slate-900 p-3">
                {'1234567890'.split('').map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => typeDigit(digit)}
                    disabled={completed}
                    className="rounded-xl bg-slate-700 px-3 py-2 font-black text-white transition hover:bg-slate-600 disabled:opacity-50"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={clearAnswer}
                  disabled={completed}
                  className="col-span-5 rounded-xl bg-rose-400 px-3 py-2 font-black text-rose-950 transition hover:bg-rose-300 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            )}

            {mode === 'build' && (
              <button
                type="button"
                onClick={resetSwitches}
                disabled={completed || activeCount === 0}
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-700 px-6 py-3 font-black text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={20} />
                Reset Lights
              </button>
            )}

            {config.timeLimit && (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-pink-500/15 px-4 py-3 font-black text-pink-200">
                <Timer size={22} />
                Time: {timeLeft}s
              </div>
            )}

            <button
              type="button"
              onClick={mode === 'build' ? checkBuildAnswer : checkDecodeAnswer}
              disabled={completed}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 text-xl font-black text-emerald-950 shadow-[0_0_20px_rgba(52,211,153,0.45)] transition hover:-translate-y-1 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap size={24} />
              Check Power
            </button>

            <button
              type="button"
              onClick={() => newRound()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.4)] transition hover:-translate-y-1 hover:bg-cyan-200"
            >
              <RotateCcw size={20} />
              New Challenge
            </button>

            <div className="rounded-2xl bg-slate-900 p-4 text-center font-bold text-slate-300">
              <p>Moves: {moves}</p>
              <p>Mistakes: {mistakes}</p>
              <p>Combo: {combo}</p>
            </div>
          </aside>
        </main>
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-sm rounded-[2rem] bg-white p-8 text-center text-slate-800 shadow-2xl">
              <Sparkles className="mx-auto mb-3 h-14 w-14 text-amber-400" />

              <h2 className="mb-2 text-3xl font-black text-cyan-700">Lab Powered Up!</h2>

              <p className="mb-3 font-bold text-slate-600">
                {mode === 'build'
                  ? `You built ${target} with ${activeCount} binary lights.`
                  : `${makeBinary(target, config.bits)} equals ${target}.`}
              </p>

              <div className="mb-5 text-4xl">
                {calculateStars() === 3 ? '⭐⭐⭐' : calculateStars() === 2 ? '⭐⭐' : '⭐'}
              </div>

              <button
                onClick={() => newRound()}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-1"
              >
                Next Challenge
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
