import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';

type GameProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type LetterState = 'empty' | 'correct' | 'wrong';
type ClueType = 'direct' | 'math' | 'direction' | 'multi';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const EASY_WORDS = [
  'CAT', 'DOG', 'SUN', 'FOX', 'BEE', 'ANT', 'CUP', 'BUS', 'EGG', 'HAT',
  'BAT', 'OWL', 'MAP', 'RED', 'BIG', 'RUN', 'TREE', 'DINO', 'MOON', 'STAR',
];

const MEDIUM_WORDS = [
  'DINO', 'TREE', 'STAR', 'MOON', 'BIRD', 'FISH', 'ROCK', 'FERN', 'RAIN', 'WIND',
  'BONE', 'CAVE', 'LEAF', 'FAST', 'JUMP', 'GREEN', 'RIVER', 'LIGHT', 'PLANT', 'TRACK',
];

const HARD_WORDS = [
  'ROCKET', 'JUNGLE', 'FOSSIL', 'PLANET', 'PUZZLE', 'FOREST', 'RAPTOR', 'VOLCANO',
  'TREASURE', 'DINOSAUR', 'CRYSTAL', 'MYSTERY', 'ANCIENT', 'EXPLORE', 'CIRCUIT',
  'GALAXY', 'COMPASS', 'HABITAT', 'MACHINE', 'PYTHON',
];

function shiftLetter(char: string, shift: number) {
  const index = ALPHABET.indexOf(char);
  if (index === -1) return char;
  return ALPHABET[(index + shift + 26) % 26];
}

function encodeWord(word: string, shift: number) {
  return word
    .split('')
    .map((char) => shiftLetter(char, shift))
    .join('');
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalizeShift(value: number) {
  let result = value;
  while (result > 13) result -= 26;
  while (result < -13) result += 26;
  return result;
}

export default function CipherMachine({ userAge, onGameComplete }: GameProps) {
  const completedRef = useRef(false);

  const config = useMemo(() => {
    if (userAge < 6) {
      return {
        words: EASY_WORDS,
        shifts: [0, 1],
        title: 'Little Decoder',
        showShift: true,
        extras: 6,
        clueTypes: ['direct'] as ClueType[],
      };
    }

    if (userAge <= 8) {
      return {
        words: MEDIUM_WORDS,
        shifts: [1, 2, 3, -1],
        title: 'Cipher Explorer',
        showShift: false,
        extras: 10,
        clueTypes: ['math', 'direction'] as ClueType[],
      };
    }

    return {
      words: HARD_WORDS,
      shifts: [2, 3, 4, 5, 6, -2, -3, -4, -5, -6],
      title: 'Master Cipher Machine',
      showShift: false,
      extras: 14,
      clueTypes: ['math', 'direction', 'multi'] as ClueType[],
    };
  }, [userAge]);

  const [word, setWord] = useState('CAT');
  const [shift, setShift] = useState(0);
  const [encoded, setEncoded] = useState('CAT');
  const [guessShift, setGuessShift] = useState(0);
  const [keySolved, setKeySolved] = useState(false);
  const [clue, setClue] = useState('');
  const [wrongKeyAttempts, setWrongKeyAttempts] = useState(0);
  const [slotIndex, setSlotIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [states, setStates] = useState<LetterState[]>([]);
  const [wrongSlot, setWrongSlot] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState('Find the key, then decode the message!');

  function generateClue(nextShift: number) {
    const type = randomItem(config.clueTypes);
    const abs = Math.abs(nextShift);

    if (type === 'direct') {
      return `Shift ${nextShift >= 0 ? '+' : ''}${nextShift}`;
    }

    if (type === 'math') {
      const a = randomInt(1, Math.max(1, abs - 1));
      const b = abs - a;
      const expression = `${a} + ${b}`;
      return nextShift >= 0 ? `Key = +(${expression})` : `Key = -(${expression})`;
    }

    if (type === 'direction') {
      return nextShift >= 0 ? `Move forward ${abs} steps` : `Move backward ${abs} steps`;
    }

    const start = abs + randomInt(2, 5);
    const subtract = start - abs;
    return nextShift >= 0 ? `Key = +(${start} - ${subtract})` : `Key = -(${start} - ${subtract})`;
  }

  function newPuzzle() {
    const nextWord = randomItem(config.words);
    const nextShift = randomItem(config.shifts);
    const startingGuess = config.showShift ? nextShift : 0;

    setWord(nextWord);
    setShift(nextShift);
    setEncoded(encodeWord(nextWord, nextShift));
    setGuessShift(startingGuess);
    setKeySolved(config.showShift);
    setClue(config.showShift ? `Shift ${nextShift >= 0 ? '+' : ''}${nextShift}` : generateClue(nextShift));
    setWrongKeyAttempts(0);
    setSlotIndex(0);
    setAnswers(Array.from({ length: nextWord.length }, () => ''));
    setStates(Array.from({ length: nextWord.length }, () => 'empty'));
    setWrongSlot(null);
    setMistakes(0);
    setCompleted(false);
    setMessage(config.showShift ? 'Decode the letters!' : 'Solve the clue and rotate the disk to find the key.');
    completedRef.current = false;
  }

  useEffect(() => {
    newPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAge]);


  function updateShift(delta: number) {
    if (completed) return;

    const nextShift = normalizeShift(guessShift + delta);
    setGuessShift(nextShift);

    if (!keySolved) {
      if (nextShift === shift) {
        setKeySolved(true);
        setMessage('Key found! Now use the disk to decode the message.');
      } else {
        setWrongKeyAttempts((current) => current + 1);
        setMessage('Disk moved. Check the clue and keep looking for the key.');
      }
    }
  }

  function calculateStars() {
    if (mistakes === 0 && wrongKeyAttempts <= 1) return 3;
    if (mistakes <= 2 && wrongKeyAttempts <= 4) return 2;
    return 1;
  }

  function chooseLetter(letter: string) {
    if (completed || slotIndex >= word.length) return;

    if (letter === word[slotIndex]) {
      const nextAnswers = [...answers];
      const nextStates = [...states];

      nextAnswers[slotIndex] = letter;
      nextStates[slotIndex] = 'correct';

      setAnswers(nextAnswers);
      setStates(nextStates);

      const nextIndex = slotIndex + 1;
      setSlotIndex(nextIndex);
      setMessage('Good decode! Keep going.');

      if (nextIndex === word.length && !completedRef.current) {
        completedRef.current = true;
        setCompleted(true);
        setMessage('Cipher solved! ✨');
        onGameComplete(calculateStars());
      }
    } else {
      setMistakes((current) => current + 1);
      setWrongSlot(slotIndex);
      setMessage('That letter does not fit. Check the disk and try again.');

      setStates((current) =>
        current.map((state, index) => (index === slotIndex ? 'wrong' : state))
      );

      window.setTimeout(() => {
        setWrongSlot(null);
        setStates((current) =>
          current.map((state, index) => (index === slotIndex ? 'empty' : state))
        );
      }, 550);
    }
  }

  function clearLast() {
    if (completed || slotIndex === 0) return;

    const previous = slotIndex - 1;
    const nextAnswers = [...answers];
    const nextStates = [...states];

    nextAnswers[previous] = '';
    nextStates[previous] = 'empty';

    setAnswers(nextAnswers);
    setStates(nextStates);
    setSlotIndex(previous);
    setMessage('Try that spot again.');
  }

  const keypadLetters = useMemo(() => {
    const needed = new Set(word.split(''));
    const extras = shuffle(ALPHABET.filter((letter) => !needed.has(letter))).slice(
      0,
      config.extras
    );
    return shuffle([...needed, ...extras]);
  }, [word, config.extras]);

  const outerLetters = ALPHABET;
  const innerLetters = ALPHABET;

  return (
    <div className="min-h-[720px] w-full rounded-3xl bg-gradient-to-br from-stone-200 via-amber-100 to-yellow-100 p-4 text-stone-800 shadow-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="rounded-3xl border-4 border-stone-400 bg-[#F5E6C8] p-4 text-center shadow-lg">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-700">
            Cipher Machine
          </p>
          <h2 className="mt-1 text-2xl font-black">{config.title}</h2>
          <p className="mt-1 font-bold text-stone-600">
            {config.showShift ? `Rule: ${clue}` : `Clue: ${clue}`}
          </p>
        </header>

        <main className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <section className="rounded-[2rem] border-4 border-stone-400 bg-[#E7D3A7] p-4 shadow-lg">
            <h3 className="mb-3 text-center text-xl font-black text-stone-800">Decoder Disk</h3>

            <div className="relative mx-auto h-[300px] w-[300px]">
              <svg viewBox="0 0 300 300" className="h-full w-full">
                <circle cx="150" cy="150" r="138" fill="#78350F" stroke="#451A03" strokeWidth="6" />
                <circle cx="150" cy="150" r="100" fill="#FCD34D" stroke="#92400E" strokeWidth="5" />
                <circle cx="150" cy="150" r="48" fill="#FEF3C7" />

                {outerLetters.map((letter, index) => {
                  const angle = (index / 26) * Math.PI * 2 - Math.PI / 2;
                  const x = 150 + Math.cos(angle) * 120;
                  const y = 150 + Math.sin(angle) * 120;

                  return (
                    <text
                      key={`outer-${letter}`}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-amber-100 text-[13px] font-black"
                    >
                      {letter}
                    </text>
                  );
                })}

                <motion.g
                  animate={{ rotate: -guessShift * (360 / 26) }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  style={{ transformOrigin: '150px 150px' }}
                >
                  {innerLetters.map((letter, index) => {
                    const angle = (index / 26) * Math.PI * 2 - Math.PI / 2;
                    const x = 150 + Math.cos(angle) * 72;
                    const y = 150 + Math.sin(angle) * 72;

                    return (
                      <text
                        key={`inner-${letter}-${index}`}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-stone-900 text-[12px] font-black"
                      >
                        {letter}
                      </text>
                    );
                  })}
                </motion.g>

                <motion.line
                  x1="150"
                  y1="28"
                  x2="150"
                  y2="80"
                  stroke="#EF4444"
                  strokeWidth="5"
                  strokeLinecap="round"
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />

                <text
                  x="150"
                  y="145"
                  textAnchor="middle"
                  className="fill-stone-800 text-[15px] font-black"
                >
                  KEY
                </text>
                <text
                  x="150"
                  y="168"
                  textAnchor="middle"
                  className="fill-amber-700 text-[22px] font-black"
                >
                  {keySolved ? (guessShift >= 0 ? `+${guessShift}` : guessShift) : '?'}
                </text>
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => updateShift(-1)}
                disabled={completed}
                className="rounded-2xl bg-stone-700 px-3 py-3 font-black text-amber-100 shadow transition hover:-translate-y-1 disabled:opacity-50"
              >
                Rotate -1
              </button>
              <button
                onClick={() => updateShift(1)}
                disabled={completed}
                className="rounded-2xl bg-stone-700 px-3 py-3 font-black text-amber-100 shadow transition hover:-translate-y-1 disabled:opacity-50"
              >
                Rotate +1
              </button>
            </div>

            <div className="mt-2 rounded-2xl bg-amber-100/80 p-2 text-center text-xs font-black text-amber-900">
              Outer ring = answer letter · Inner ring = encoded letter
            </div>

            <div className="mt-3 rounded-2xl bg-stone-100/70 p-3 text-center text-sm font-bold text-stone-700">
              {keySolved
                ? 'Key found. Match each encoded inner letter to the outer answer letter.'
                : 'Solve the clue, then rotate the inner disk until the key is found.'}
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-[2rem] border-4 border-stone-400 bg-[#F5E6C8] p-4 shadow-lg">
            <div className="rounded-3xl bg-stone-800 p-5 text-center shadow-inner">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-amber-300">
                Encoded Message
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {encoded.split('').map((char, index) => {
                  const isCurrent = index === slotIndex;

                  return (
                    <motion.div
                      key={`${char}-${index}`}
                      whileHover={isCurrent ? { scale: 1.1, y: -4 } : {}}
                      className={`relative rounded-2xl px-4 py-3 font-mono text-3xl font-black shadow ${
                        isCurrent
                          ? keySolved
                            ? 'bg-amber-200 text-amber-900 ring-4 ring-yellow-400'
                            : 'bg-amber-200 text-amber-900'
                          : 'bg-stone-700 text-amber-100 opacity-60'
                      }`}
                    >
                      {char}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-amber-100 p-4 shadow-inner">
              <p className="mb-3 text-center text-lg font-black text-amber-900">Secret Word</p>

              <div className="flex flex-wrap justify-center gap-3">
                {answers.map((letter, index) => (
                  <motion.div
                    key={index}
                    animate={
                      wrongSlot === index
                        ? { x: [-8, 8, -7, 7, 0] }
                        : states[index] === 'correct'
                          ? { scale: [1, 1.15, 1] }
                          : {}
                    }
                    transition={{ duration: 0.45 }}
                    className={`flex h-16 w-14 items-center justify-center rounded-2xl border-4 font-mono text-3xl font-black shadow-md ${
                      states[index] === 'correct'
                        ? 'border-yellow-500 bg-yellow-200 text-yellow-900'
                        : states[index] === 'wrong'
                          ? 'border-red-400 bg-red-100 text-red-700'
                          : index === slotIndex
                            ? 'border-amber-600 bg-white text-stone-800'
                            : 'border-stone-300 bg-stone-100 text-stone-400'
                    }`}
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white/60 p-4 shadow-sm">
              <p className="mb-3 text-center text-lg font-black text-stone-800">Answer Keypad</p>

              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7">
                {keypadLetters.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => chooseLetter(letter)}
                    disabled={completed || !keySolved}
                    className="rounded-2xl bg-stone-700 px-3 py-3 font-mono text-xl font-black text-amber-100 shadow-md transition hover:-translate-y-1 hover:bg-stone-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {letter}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={clearLast}
                  disabled={completed || slotIndex === 0}
                  className="rounded-2xl bg-orange-300 px-5 py-3 font-black text-orange-950 shadow-md transition hover:-translate-y-1 hover:bg-orange-200 disabled:opacity-50"
                >
                  Backspace
                </button>

                <button
                  type="button"
                  onClick={newPuzzle}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3 font-black text-emerald-950 shadow-md transition hover:-translate-y-1 hover:bg-emerald-200"
                >
                  <RotateCcw size={20} />
                  New Cipher
                </button>
              </div>
            </div>

            <p className="text-center font-black text-stone-600">{message}</p>

            <AnimatePresence>
              {completed && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="rounded-3xl border-4 border-yellow-400 bg-yellow-100 p-5 text-center shadow-lg"
                >
                  <div className="mb-2 flex justify-center text-5xl">💎🏆💎</div>
                  <div className="flex items-center justify-center gap-2 text-2xl font-black text-yellow-800">
                    <Sparkles size={26} />
                    Secret Treasure Unlocked!
                    <Sparkles size={26} />
                  </div>
                  <p className="mt-1 font-bold text-yellow-700">The mystery word was {word}.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>
    </div>
  );
}
