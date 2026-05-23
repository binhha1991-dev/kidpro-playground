import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trash2 } from 'lucide-react';

type Props = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type Puzzle = {
  target: number;
  solution: number[];
};

const TOTAL_ROUNDS = 6;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getWeights(userAge: number) {
  if (userAge <= 5) return [1];
  if (userAge <= 8) return [1, 5, 10];
  return [1, 5, 10, 20];
}

function getMaxWeights(userAge: number) {
  if (userAge <= 5) return 5;
  if (userAge <= 8) return 4;
  return 3;
}

function generateValidPuzzle(userAge: number): Puzzle {
  const weights = getWeights(userAge);
  const maxWeights = getMaxWeights(userAge);
  const count = randomInt(1, maxWeights);
  const solution: number[] = [];

  for (let i = 0; i < count; i++) {
    solution.push(weights[randomInt(0, weights.length - 1)]);
  }

  return {
    target: solution.reduce((sum, value) => sum + value, 0),
    solution,
  };
}

function getStars(mistakes: number) {
  if (mistakes <= 1) return 3;
  if (mistakes <= 3) return 2;
  return 1;
}

function getBlockSize(value: number, small = false) {
  if (small) {
    if (value >= 20) return { width: 64, height: 56, fontSize: 13 };
    if (value >= 10) return { width: 56, height: 48, fontSize: 12 };
    if (value >= 5) return { width: 48, height: 40, fontSize: 11 };
    return { width: 40, height: 34, fontSize: 10 };
  }

  if (value >= 20) return { width: 96, height: 82, fontSize: 22 };
  if (value >= 10) return { width: 82, height: 70, fontSize: 18 };
  if (value >= 5) return { width: 70, height: 58, fontSize: 15 };
  return { width: 56, height: 48, fontSize: 13 };
}

function WeightBlock({ value, small = false }: { value: number; small?: boolean }) {
  const size = getBlockSize(value, small);

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-slate-800 px-1 font-black text-white shadow-sm"
      style={{
        width: size.width,
        height: size.height,
        fontSize: size.fontSize,
      }}
      title={`${value}kg`}
    >
      <span className="whitespace-nowrap leading-none">
        {value}
        <span style={{ fontSize: '0.65em' }}>kg</span>
      </span>
    </div>
  );
}

export default function MagicMathBalance({ userAge, onGameComplete }: Props) {
  const [round, setRound] = useState(1);
  const [puzzle, setPuzzle] = useState(() => generateValidPuzzle(userAge));
  const [placed, setPlaced] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('Add weights to match the target.');
  const [locked, setLocked] = useState(false);

  const weights = useMemo(() => getWeights(userAge), [userAge]);
  const maxWeights = useMemo(() => getMaxWeights(userAge), [userAge]);

  const current = placed.reduce((sum, value) => sum + value, 0);
  const diff = current - puzzle.target;
  const tilt = Math.max(-9, Math.min(9, diff * 0.55));
  const isFull = placed.length >= maxWeights;

  function addWeight(weight: number) {
    if (locked) return;

    if (isFull) {
      setMessage(`You can only use ${maxWeights} weights.`);
      return;
    }

    setPlaced((prev) => [...prev, weight]);
    setMessage('Check when both sides look balanced.');
  }

  function removeLastWeight() {
    if (locked) return;
    setPlaced((prev) => prev.slice(0, -1));
    setMessage('Removed the last weight.');
  }

  function clearWeights() {
    if (locked) return;
    setPlaced([]);
    setMessage('Cleared. Try a new combination.');
  }

  function nextRound() {
    if (round >= TOTAL_ROUNDS) {
      setMessage('Great job!');
      setTimeout(() => onGameComplete(getStars(mistakes)), 700);
      return;
    }

    setRound((prev) => prev + 1);
    setPuzzle(generateValidPuzzle(userAge));
    setPlaced([]);
    setLocked(false);
    setMessage('New target. Build the balance again.');
  }

  function checkBalance() {
    if (locked) return;

    if (current === puzzle.target) {
      setLocked(true);
      setMessage('Balanced!');
      setTimeout(nextRound, 800);
    } else {
      setMistakes((prev) => prev + 1);
      setMessage(
        current < puzzle.target
          ? 'Too light. Add more weight.'
          : 'Too heavy. Remove some weight.'
      );
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 px-3 py-4 text-slate-900 sm:px-4">
      <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-2">
        <section className="min-w-0 rounded-3xl bg-white p-4 shadow-sm sm:p-5">
          <div className="text-center">
            <h2 className="text-xl font-black sm:text-2xl">Magic Math Balance</h2>
            <p className="mt-2 text-base font-bold sm:text-lg">
              Target:{' '}
              <span className="text-emerald-600">{puzzle.target}kg</span>
            </p>
          </div>

          <div className="relative mx-auto mt-4 h-[360px] w-full max-w-[560px] overflow-hidden sm:mt-6 sm:h-[390px]">
            <div className="absolute bottom-16 left-1/2 h-44 w-5 -translate-x-1/2 rounded-t-lg bg-amber-700 sm:h-52" />
            <div className="absolute bottom-11 left-1/2 h-5 w-44 -translate-x-1/2 rounded-full bg-amber-800" />
            <div className="absolute bottom-7 left-1/2 h-5 w-28 -translate-x-1/2 rounded-full bg-amber-900" />

            <div className="absolute left-1/2 top-24 h-4 w-[78%] -translate-x-1/2 sm:w-[82%]">
              <motion.div
                className="absolute left-0 top-0 h-4 w-full rounded-full bg-amber-600"
                animate={{ rotate: tilt }}
                transition={{ type: 'spring', stiffness: 130, damping: 14 }}
                style={{ transformOrigin: 'center center' }}
              />

              <div className="absolute left-1/2 top-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-800 bg-amber-300" />

              <motion.div
                className="absolute left-0 top-4 flex w-32 flex-col items-center sm:w-40"
                animate={{ y: diff < 0 ? 14 : diff > 0 ? -10 : 0 }}
                transition={{ type: 'spring', stiffness: 130, damping: 14 }}
              >
                <div className="h-16 w-1 bg-amber-500" />
                <div className="flex min-h-28 w-32 flex-wrap items-end justify-center gap-1 rounded-2xl border-4 border-amber-500 bg-amber-100 p-2 sm:w-40">
                  <WeightBlock value={puzzle.target} />
                </div>
              </motion.div>

              <motion.div
                className="absolute right-0 top-4 flex w-32 flex-col items-center sm:w-40"
                animate={{ y: diff > 0 ? 14 : diff < 0 ? -10 : 0 }}
                transition={{ type: 'spring', stiffness: 130, damping: 14 }}
              >
                <div className="h-16 w-1 bg-sky-500" />
                <div className="flex min-h-28 w-32 flex-wrap items-end justify-center gap-1 rounded-2xl border-4 border-sky-500 bg-sky-100 p-2 sm:w-40">
                  {placed.length === 0 ? (
                    <span className="text-3xl font-black text-slate-400">?</span>
                  ) : (
                    placed.map((value, index) => (
                      <WeightBlock key={`${value}-${index}`} value={value} small />
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold">
              Current:{' '}
              <span
                className={
                  current === puzzle.target ? 'text-emerald-600' : 'text-slate-700'
                }
              >
                {current}kg
              </span>
            </p>

            <p className="mx-auto mt-2 min-h-6 max-w-md text-sm font-semibold text-slate-500 sm:text-base">
              {message}
            </p>

            <button
              onClick={checkBalance}
              className="mt-4 rounded-2xl bg-emerald-500 px-8 py-3 font-black text-white shadow-sm hover:bg-emerald-600"
            >
              Check Balance
            </button>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-center text-xl font-black sm:text-2xl">
            Choose weights
          </h3>

          <p className="mt-2 text-center text-sm font-semibold text-slate-500">
            Use up to {maxWeights} weights
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
            {weights.map((weight) => (
              <button
                key={weight}
                onClick={() => addWeight(weight)}
                disabled={isFull || locked}
                className={[
                  'flex min-h-24 items-center justify-center rounded-2xl p-4 shadow-sm',
                  isFull || locked
                    ? 'cursor-not-allowed bg-slate-200 opacity-50'
                    : 'bg-slate-100 hover:bg-slate-200',
                ].join(' ')}
                aria-label={`Add ${weight}kg`}
              >
                <WeightBlock value={weight} />
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={removeLastWeight}
              disabled={locked || placed.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-sky-100 px-5 py-3 font-bold text-sky-800 hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={18} />
              Undo
            </button>

            <button
              onClick={clearWeights}
              disabled={locked || placed.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-rose-100 px-5 py-3 font-bold text-rose-800 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={18} />
              Clear
            </button>
          </div>

          <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-center">
            <p className="font-bold">
              Round {round}/{TOTAL_ROUNDS}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Mistakes: {mistakes}
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-800">
            Tip: Combine weights to match the target exactly. You have limited weights, so try to find a smart combination.
          </div>
        </section>
      </div>
    </div>
  );
}