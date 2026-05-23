import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Lightbulb, RotateCcw, Sparkles, Trophy } from 'lucide-react';

type PatternBuilderProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type PatternId =
  | 'add'
  | 'subtract'
  | 'skip'
  | 'alternating'
  | 'growing'
  | 'multiply'
  | 'power2'
  | 'square'
  | 'cube'
  | 'fibonacci'
  | 'lucas'
  | 'prime'
  | 'collatz';

type PatternData = {
  id: PatternId;
  name: string;
  title: string;
  minAge: number;
  weight: number;
  generator: () => number[];
  hint: string;
  explanation: string;
  application: string;
  funFact?: string;
};

type Round = {
  pattern: PatternData;
  sequence: number[];
  visibleSequence: number[];
  answer: number;
  options: number[];
};

const VISIBLE_COUNT = 5;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function makeOptions(answer: number, count: number) {
  const options = new Set<number>();
  options.add(answer);

  const range = answer <= 20 ? 8 : answer <= 80 ? 16 : 32;

  while (options.size < count) {
    const offset = randomInt(-range, range);
    const candidate = Math.max(0, answer + offset);

    if (candidate !== answer) {
      options.add(candidate);
    }
  }

  return shuffle([...options]);
}

function weightedPick<T extends { weight: number }>(items: T[]) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}

function primes(count: number) {
  const result: number[] = [];
  let n = 2;

  while (result.length < count) {
    let isPrime = true;

    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        isPrime = false;
        break;
      }
    }

    if (isPrime) result.push(n);
    n += 1;
  }

  return result;
}

function collatz(start: number, count: number) {
  const seq = [start];
  let n = start;

  while (seq.length < count) {
    n = n % 2 === 0 ? n / 2 : n * 3 + 1;
    seq.push(n);
  }

  return seq;
}

function getPatternLibrary(): PatternData[] {
  return [
    {
      id: 'add',
      name: 'Add Pattern',
      title: 'Add the Same Number',
      minAge: 3,
      weight: 14,
      generator: () => {
        const start = randomInt(1, 10);
        const step = randomInt(1, 5);
        return Array.from({ length: VISIBLE_COUNT + 1 }, (_, i) => start + i * step);
      },
      hint: 'Look at how much the number grows each step.',
      explanation: 'The same number is added each time.',
      application: 'This helps children understand counting, distance steps, and simple arithmetic patterns.',
    },
    {
      id: 'subtract',
      name: 'Backward Pattern',
      title: 'Count Backward',
      minAge: 6,
      weight: 8,
      generator: () => {
        const step = randomInt(1, 5);
        const start = randomInt(28, 55);
        return Array.from({ length: VISIBLE_COUNT + 1 }, (_, i) => start - i * step);
      },
      hint: 'The numbers are getting smaller.',
      explanation: 'The same number is subtracted each time.',
      application: 'Subtraction patterns are useful for countdowns, measuring what remains, and mental math.',
    },
    {
      id: 'skip',
      name: 'Skip Counting',
      title: 'Skip Counting',
      minAge: 3,
      weight: 12,
      generator: () => {
        const step = randomInt(2, 6);
        const start = randomInt(0, 8);
        return Array.from({ length: VISIBLE_COUNT + 1 }, (_, i) => start + i * step);
      },
      hint: 'Try counting by 2s, 3s, 4s, or 5s.',
      explanation: 'This sequence jumps by the same size each time.',
      application: 'Skip counting supports multiplication, rhythm, grouping, and early number fluency.',
    },
    {
      id: 'alternating',
      name: 'Two-Step Pattern',
      title: 'Alternating Jumps',
      minAge: 6,
      weight: 7,
      generator: () => {
        const start = randomInt(1, 8);
        const a = randomInt(1, 3);
        const b = randomInt(4, 7);
        const seq = [start];

        for (let i = 0; i < VISIBLE_COUNT; i++) {
          seq.push(seq[i] + (i % 2 === 0 ? a : b));
        }

        return seq;
      },
      hint: 'The jumps repeat in two different sizes.',
      explanation: 'The rule alternates between two jumps, such as +2, +5, +2, +5.',
      application: 'Alternating patterns help children notice cycles, schedules, and repeated rules.',
    },
    {
      id: 'growing',
      name: 'Growing Steps',
      title: 'Growing Step Pattern',
      minAge: 9,
      weight: 5,
      generator: () => {
        const start = randomInt(1, 5);
        let step = randomInt(1, 3);
        const seq = [start];

        while (seq.length < VISIBLE_COUNT + 1) {
          seq.push(seq[seq.length - 1] + step);
          step += 1;
        }

        return seq;
      },
      hint: 'The jump gets bigger each time.',
      explanation: 'Each step increases, such as +1, +2, +3, +4.',
      application: 'Growing patterns build intuition for acceleration, triangular numbers, and changing rates.',
    },
    {
      id: 'multiply',
      name: 'Multiply Pattern',
      title: 'Multiply Each Step',
      minAge: 9,
      weight: 5,
      generator: () => {
        const multiplier = randomInt(2, 3);
        const start = multiplier === 2 ? randomInt(1, 4) : randomInt(1, 3);
        return Array.from({ length: VISIBLE_COUNT + 1 }, (_, i) => start * multiplier ** i);
      },
      hint: 'Each number is multiplied by the same number.',
      explanation: 'The sequence grows by multiplication instead of addition.',
      application: 'Multiplication patterns appear in growth, scaling, technology, and repeated doubling.',
    },
    {
      id: 'power2',
      name: 'Powers of 2',
      title: 'Power of 2 Sequence',
      minAge: 6,
      weight: 10,
      generator: () => {
        const startExp = randomInt(0, 2);
        return Array.from({ length: VISIBLE_COUNT + 1 }, (_, i) => 2 ** (startExp + i));
      },
      hint: 'Each number doubles.',
      explanation: 'Every number is multiplied by 2 to get the next one.',
      application: 'Powers of 2 are fundamental in computer science, binary numbers, and computer memory.',
      funFact: 'Computer memory sizes often use powers of 2, such as 8, 16, 32, 64, 128, and 256.',
    },
    {
      id: 'square',
      name: 'Square Numbers',
      title: 'Square Numbers',
      minAge: 6,
      weight: 7,
      generator: () => {
        const start = randomInt(0, 2);
        return Array.from({ length: VISIBLE_COUNT + 1 }, (_, i) => {
          const n = start + i;
          return n * n;
        });
      },
      hint: 'Think of n × n.',
      explanation: 'Each number is made by squaring: 0², 1², 2², 3²...',
      application: 'Square numbers appear in geometry, area, algebra, and distance calculations.',
      funFact: 'A square number can represent the area of a square grid.',
    },
    {
      id: 'cube',
      name: 'Cube Numbers',
      title: 'Cube Numbers',
      minAge: 9,
      weight: 4,
      generator: () => {
        const start = randomInt(0, 2);
        return Array.from({ length: VISIBLE_COUNT + 1 }, (_, i) => {
          const n = start + i;
          return n ** 3;
        });
      },
      hint: 'Think of n × n × n.',
      explanation: 'Each number is a cube number: 0³, 1³, 2³, 3³...',
      application: 'Cube numbers connect to volume and three-dimensional space.',
      funFact: 'Cubes are useful when thinking about boxes, blocks, volume, and 3D structures.',
    },
    {
      id: 'fibonacci',
      name: 'Fibonacci',
      title: 'Fibonacci Sequence',
      minAge: 9,
      weight: 6,
      generator: () => {
        const seq = [0, 1];

        while (seq.length < VISIBLE_COUNT + 1) {
          seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
        }

        return seq;
      },
      hint: 'Add the last two numbers.',
      explanation: 'Each new number is the sum of the two before it.',
      application: 'Fibonacci patterns appear in nature, shells, flowers, leaves, art, and design.',
      funFact: 'Fibonacci numbers are connected to the golden ratio.',
    },
    {
      id: 'lucas',
      name: 'Lucas',
      title: 'Lucas Sequence',
      minAge: 9,
      weight: 4,
      generator: () => {
        const seq = [2, 1];

        while (seq.length < VISIBLE_COUNT + 1) {
          seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
        }

        return seq;
      },
      hint: 'It works like Fibonacci, but starts with 2 and 1.',
      explanation: 'Each new number is the sum of the two before it.',
      application: 'Lucas numbers are related to Fibonacci numbers and the golden ratio.',
      funFact: 'Lucas numbers and Fibonacci numbers are close mathematical cousins.',
    },
    {
      id: 'prime',
      name: 'Prime Numbers',
      title: 'Prime Numbers',
      minAge: 9,
      weight: 4,
      generator: () => primes(VISIBLE_COUNT + 1),
      hint: 'Prime numbers only divide by 1 and themselves.',
      explanation: 'Prime numbers have no factors other than 1 and the number itself.',
      application: 'Prime numbers are essential in modern encryption, cybersecurity, and online banking.',
      funFact: 'Large prime numbers help keep internet communication secure.',
    },
    {
      id: 'collatz',
      name: 'Collatz',
      title: 'Hailstone Sequence',
      minAge: 9,
      weight: 3,
      generator: () => collatz(randomInt(5, 15), VISIBLE_COUNT + 1),
      hint: 'Even number: divide by 2. Odd number: multiply by 3 and add 1.',
      explanation: 'If the number is even, divide it by 2. If it is odd, calculate 3n + 1.',
      application: 'The Collatz sequence is a famous unsolved puzzle in mathematics.',
      funFact:
        'Many mathematicians believe every starting number eventually reaches 4, 2, 1, but no one has proven it for all numbers.',
    },
  ];
}

function createRound(userAge: number): Round {
  const library = getPatternLibrary();
  const available = library.filter((pattern) => userAge >= pattern.minAge);
  const pattern = weightedPick(available);
  const sequence = pattern.generator();
  const answer = sequence[VISIBLE_COUNT];
  const optionCount = userAge < 6 ? 3 : 4;

  return {
    pattern,
    sequence,
    visibleSequence: sequence.slice(0, VISIBLE_COUNT),
    answer,
    options: makeOptions(answer, optionCount),
  };
}

export default function PatternBuilder({ userAge, onGameComplete }: PatternBuilderProps) {
  const settings = useMemo(() => {
    if (userAge < 6) {
      return {
        label: 'Tiny Number Patterns',
        showHintButton: false,
      };
    }

    if (userAge <= 8) {
      return {
        label: 'Number Pattern Explorer',
        showHintButton: true,
      };
    }

    return {
      label: 'Pattern Master',
      showHintButton: true,
    };
  }, [userAge]);

  const [round, setRound] = useState<Round>(() => createRound(userAge));
  const [placedAnswer, setPlacedAnswer] = useState<number | null>(null);
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(userAge < 6);
  const [message, setMessage] = useState('Find the next number in the pattern!');

  function resetRound() {
    const next = createRound(userAge);

    setRound(next);
    setPlacedAnswer(null);
    setWrongAnswer(null);
    setMistakes(0);
    setCompleted(false);
    setShowHint(userAge < 6);
    setMessage('Find the next number in the pattern!');
  }

  function chooseOption(value: number) {
    if (completed) return;

    if (value === round.answer) {
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

      setPlacedAnswer(value);
      setCompleted(true);
      setMessage('Correct! You found the pattern! ✨');

      setTimeout(() => {
        onGameComplete(stars);
      }, 900);
    } else {
      setMistakes((prev) => prev + 1);
      setWrongAnswer(value);
      setMessage('Not quite. Look at how the numbers change.');

      setTimeout(() => setWrongAnswer(null), 550);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-sky-100 via-pink-50 to-emerald-100 p-4 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 rounded-[2rem] bg-white/80 p-5 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-violet-700">
                🔢 Number Pattern Builder
              </h1>
              <p className="font-bold text-slate-500">
                Look at the sequence and choose the next number.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-2xl bg-sky-100 px-4 py-2 text-sm font-black text-sky-700">
                Age {userAge}
              </div>
              <div className="rounded-2xl bg-violet-100 px-4 py-2 text-sm font-black text-violet-700">
                {settings.label}
              </div>
              <div className="rounded-2xl bg-amber-100 px-4 py-2 text-sm font-black text-amber-700">
                Mistakes: {mistakes}
              </div>
            </div>
          </div>
        </header>

        <main className="rounded-[2rem] bg-white/70 p-5 shadow-2xl backdrop-blur">
          <div className="mb-5 text-center">
            <p className="text-2xl font-black text-slate-700">{message}</p>
            <p className="text-sm font-bold text-slate-400">{round.pattern.title}</p>
          </div>

          <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-yellow-50 via-white to-sky-50 p-6 shadow-inner">
            <div className="absolute bottom-10 left-8 right-8 h-2 rounded-full bg-slate-200" />

            <motion.div className="flex flex-wrap items-center justify-center gap-4 py-8">
              {round.visibleSequence.map((value, index) => (
                <motion.div
                  key={`${value}-${index}`}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 16, delay: index * 0.06 }}
                  className="relative flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-sky-100 to-violet-100 text-4xl font-black text-slate-800 shadow-md"
                >
                  {value}
                  <span className="absolute -bottom-7 text-xs font-black text-slate-400">
                    #{index + 1}
                  </span>
                </motion.div>
              ))}

              <motion.div
                animate={
                  placedAnswer !== null
                    ? { scale: [1, 1.2, 1], rotate: [0, -4, 4, 0] }
                    : { scale: [1, 1.06, 1] }
                }
                transition={{
                  repeat: placedAnswer !== null ? 0 : Infinity,
                  duration: placedAnswer !== null ? 0.55 : 1.2,
                }}
                className="relative flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-dashed border-violet-400 bg-violet-50 text-4xl font-black text-violet-500 shadow-md"
              >
                <AnimatePresence mode="wait">
                  {placedAnswer !== null ? (
                    <motion.span
                      key={placedAnswer}
                      initial={{ scale: 0, y: 40, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                    >
                      {placedAnswer}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="question"
                      animate={{ opacity: [0.35, 1, 0.35] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      ?
                    </motion.span>
                  )}
                </AnimatePresence>

                <span className="absolute -bottom-7 text-xs font-black text-violet-400">
                  next
                </span>

                {placedAnswer !== null && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.4, opacity: 1 }}
                    className="absolute -top-6 text-3xl"
                  >
                    ✨
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </section>

          {(showHint || completed) && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-[2rem] bg-indigo-50 p-4 text-center shadow-inner"
            >
              <div className="mb-2 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider text-indigo-400">
                <Lightbulb size={18} />
                {completed ? 'Rule Learned' : 'Pattern Hint'}
              </div>
              <p className="mt-1 text-lg font-black text-indigo-700">
                {completed ? round.pattern.explanation : round.pattern.hint}
              </p>
            </motion.section>
          )}

          <section className="rounded-[2rem] bg-gradient-to-br from-violet-50 to-white p-5 shadow-inner">
            <p className="mb-4 text-center text-sm font-black uppercase tracking-wider text-slate-400">
              Choose the next number
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {round.options.map((value) => (
                <motion.button
                  key={value}
                  onClick={() => chooseOption(value)}
                  disabled={completed}
                  animate={
                    wrongAnswer === value
                      ? { x: [-10, 10, -8, 8, 0], rotate: [-3, 3, -3, 3, 0] }
                      : {}
                  }
                  whileHover={!completed ? { scale: 1.05, y: -4 } : {}}
                  whileTap={!completed ? { scale: 0.92 } : {}}
                  className="rounded-[2rem] bg-white p-5 text-4xl font-black text-slate-700 shadow-md transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {value}
                </motion.button>
              ))}
            </div>
          </section>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {settings.showHintButton && !showHint && !completed && (
              <button
                onClick={() => setShowHint(true)}
                className="flex items-center gap-2 rounded-2xl bg-indigo-100 px-5 py-3 font-black text-indigo-700 shadow-md transition hover:-translate-y-1 active:scale-95"
              >
                <Lightbulb className="h-5 w-5" />
                Show Hint
              </button>
            )}

            <button
              onClick={resetRound}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-violet-700 shadow-md transition hover:-translate-y-1 active:scale-95"
            >
              <RotateCcw className="h-5 w-5" />
              New Pattern
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
            <div className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl">
              <Trophy className="mx-auto mb-3 h-16 w-16 text-amber-400" />
              <h2 className="mb-2 text-3xl font-black text-violet-700">
                Pattern Complete!
              </h2>

              <p className="mb-2 font-bold text-slate-600">
                You found the next number in the {round.pattern.name} pattern.
              </p>

              <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-left">
                <div className="mb-2 flex items-center gap-2 font-black text-indigo-700">
                  <BookOpen size={20} />
                  What did we learn?
                </div>
                <p className="font-bold text-indigo-700">{round.pattern.explanation}</p>

                <div className="mt-3 rounded-xl bg-white p-3 text-sm font-bold text-slate-600">
                  <span className="text-emerald-600">Application:</span>{' '}
                  {round.pattern.application}
                </div>

                {round.pattern.funFact && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-700">
                    Fun fact: {round.pattern.funFact}
                  </div>
                )}
              </div>

              <div className="mb-5 text-4xl">
                {mistakes === 0 ? '⭐⭐⭐' : mistakes <= 2 ? '⭐⭐' : '⭐'}
              </div>

              <button
                onClick={resetRound}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-400 to-sky-400 px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-1 active:scale-95"
              >
                <Sparkles className="h-5 w-5" />
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
