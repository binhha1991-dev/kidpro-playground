import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, Volume2 } from 'lucide-react';

type SpellingGardenProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type WordItem = {
  word: string;
  emoji: string;
  label: string;
};

type LetterTile = {
  id: string;
  letter: string;
  used: boolean;
};

const WORDS_UNDER_6: WordItem[] = [
  { word: 'CAT', emoji: '🐱', label: 'Cat' },
  { word: 'DOG', emoji: '🐶', label: 'Dog' },
  { word: 'SUN', emoji: '☀️', label: 'Sun' },
  { word: 'BED', emoji: '🛏️', label: 'Bed' },
  { word: 'BUS', emoji: '🚌', label: 'Bus' },
  { word: 'CUP', emoji: '☕', label: 'Cup' },
  { word: 'HAT', emoji: '🎩', label: 'Hat' },
  { word: 'PIG', emoji: '🐷', label: 'Pig' },
  { word: 'FOX', emoji: '🦊', label: 'Fox' },
  { word: 'BEE', emoji: '🐝', label: 'Bee' },
  { word: 'ANT', emoji: '🐜', label: 'Ant' },
  { word: 'CAR', emoji: '🚗', label: 'Car' },
  { word: 'KEY', emoji: '🔑', label: 'Key' },
  { word: 'BOX', emoji: '📦', label: 'Box' },
  { word: 'EGG', emoji: '🥚', label: 'Egg' },
];

const WORDS_6_TO_8: WordItem[] = [
  { word: 'APPLE', emoji: '🍎', label: 'Apple' },
  { word: 'HOUSE', emoji: '🏠', label: 'House' },
  { word: 'TRAIN', emoji: '🚂', label: 'Train' },
  { word: 'CHAIR', emoji: '🪑', label: 'Chair' },
  { word: 'BREAD', emoji: '🍞', label: 'Bread' },
  { word: 'WATER', emoji: '💧', label: 'Water' },
  { word: 'MOUSE', emoji: '🐭', label: 'Mouse' },
  { word: 'PLANT', emoji: '🌱', label: 'Plant' },
  { word: 'CLOCK', emoji: '🕒', label: 'Clock' },
  { word: 'SHEEP', emoji: '🐑', label: 'Sheep' },
  { word: 'SMILE', emoji: '😊', label: 'Smile' },
  { word: 'CLOUD', emoji: '☁️', label: 'Cloud' },
  { word: 'BRUSH', emoji: '🖌️', label: 'Brush' },
  { word: 'ROBOT', emoji: '🤖', label: 'Robot' },
  { word: 'PIZZA', emoji: '🍕', label: 'Pizza' },
];

const WORDS_9_PLUS: WordItem[] = [
  { word: 'RAINBOW', emoji: '🌈', label: 'Rainbow' },
  { word: 'BUTTERFLY', emoji: '🦋', label: 'Butterfly' },
  { word: 'SUNFLOWER', emoji: '🌻', label: 'Sunflower' },
  { word: 'STARFISH', emoji: '⭐', label: 'Starfish' },
  { word: 'NOTEBOOK', emoji: '📓', label: 'Notebook' },
  { word: 'KEYBOARD', emoji: '⌨️', label: 'Keyboard' },
  { word: 'DRAGONFLY', emoji: '🪰', label: 'Dragonfly' },
  { word: 'WATERFALL', emoji: '🏞️', label: 'Waterfall' },
  { word: 'MOONLIGHT', emoji: '🌙', label: 'Moonlight' },
  { word: 'FIREWORK', emoji: '🎆', label: 'Firework' },
  { word: 'BLUEBERRY', emoji: '🫐', label: 'Blueberry' },
  { word: 'SNOWBALL', emoji: '❄️', label: 'Snowball' },
  { word: 'PLAYGROUND', emoji: '🛝', label: 'Playground' },
  { word: 'STRAWBERRY', emoji: '🍓', label: 'Strawberry' },
  { word: 'GRASSHOPPER', emoji: '🦗', label: 'Grasshopper' },
];

const shuffle = <T,>(array: T[]) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const makeTiles = (word: string): LetterTile[] =>
  shuffle(
    word.split('').map((letter, index) => ({
      id: `${letter}-${index}-${Math.random().toString(36).slice(2)}`,
      letter,
      used: false,
    }))
  );

export default function SpellingGarden({ userAge, onGameComplete }: SpellingGardenProps) {
  const settings = useMemo(() => {
    if (userAge < 6) {
      return {
        words: WORDS_UNDER_6,
        showHints: true,
        floatDuration: 4,
        label: 'Little Sprout',
      };
    }

    if (userAge <= 8) {
      return {
        words: WORDS_6_TO_8,
        showHints: false,
        floatDuration: 3.2,
        label: 'Garden Explorer',
      };
    }

    return {
      words: WORDS_9_PLUS,
      showHints: false,
      floatDuration: 2.3,
      label: 'Word Wizard',
    };
  }, [userAge]);

  const [wordItem, setWordItem] = useState<WordItem>(() => {
    return settings.words[Math.floor(Math.random() * settings.words.length)];
  });

  const [tiles, setTiles] = useState<LetterTile[]>(() => makeTiles(wordItem.word));
  const [answer, setAnswer] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('Pick the first letter!');
  const [completed, setCompleted] = useState(false);
  const [sparkleIndex, setSparkleIndex] = useState<number | null>(null);
  const completionReportedRef = useRef(false);
  const dragLockRef = useRef<string | null>(null);

  const nextIndex = answer.length;
  const targetLetters = wordItem.word.split('');

  useEffect(() => {
    const nextWord = settings.words[Math.floor(Math.random() * settings.words.length)];

    setWordItem(nextWord);
    setTiles(makeTiles(nextWord.word));
    setAnswer([]);
    setMistakes(0);
    setMessage('Pick the first letter!');
    setCompleted(false);
    setSparkleIndex(null);
    completionReportedRef.current = false;
  }, [settings]);

  const resetWithNewWord = () => {
    const nextWord = settings.words[Math.floor(Math.random() * settings.words.length)];

    setWordItem(nextWord);
    setTiles(makeTiles(nextWord.word));
    setAnswer([]);
    setMistakes(0);
    setMessage('Pick the first letter!');
    setCompleted(false);
    setSparkleIndex(null);
    completionReportedRef.current = false;
  };

  const placeLetter = (tile: LetterTile) => {
    if (completed || tile.used) return;

    const expected = targetLetters[nextIndex];

    if (tile.letter !== expected) {
      setMistakes((prev) => prev + 1);
      setMessage('Oops! Try another letter 🌱');
      return;
    }

    const newAnswer = [...answer, tile.letter];

    setAnswer(newAnswer);
    setTiles((prev) => prev.map((item) => (item.id === tile.id ? { ...item, used: true } : item)));
    setSparkleIndex(nextIndex);
    setMessage('Great! Keep planting!');

    setTimeout(() => setSparkleIndex(null), 700);

    if (newAnswer.length === targetLetters.length && !completionReportedRef.current) {
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

      completionReportedRef.current = true;
      setMessage('Beautiful spelling garden! ✨');

      // 🔊 phát âm trước
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(wordItem.label);
        utterance.rate = 0.8;

        utterance.onend = () => {
          setCompleted(true);

          setTimeout(() => {
            onGameComplete(stars);
          }, 400);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setCompleted(true);

        setTimeout(() => {
          onGameComplete(stars);
        }, 900);
      }
    }
  };

  const undoLast = () => {
    if (completed || answer.length === 0) return;

    const removedIndex = answer.length - 1;
    const removedLetter = answer[removedIndex];

    const matchingUsedTile = [...tiles]
      .reverse()
      .find((tile) => tile.used && tile.letter === removedLetter);

    setAnswer((prev) => prev.slice(0, -1));

    if (matchingUsedTile) {
      setTiles((prev) =>
        prev.map((tile) => (tile.id === matchingUsedTile.id ? { ...tile, used: false } : tile))
      );
    }

    setMessage('No problem! Plant a new letter 🌼');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-200 via-emerald-100 to-lime-200 p-4 text-slate-800">
      <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-yellow-300 shadow-[0_0_60px_rgba(250,204,21,0.8)]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 rounded-t-[50%] bg-gradient-to-t from-green-500 to-green-300" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-5">
        <header className="rounded-3xl bg-white/80 p-5 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-emerald-700">🌷 Spelling Garden</h1>
              <p className="font-bold text-slate-500">Plant the letters in the correct order.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-2xl bg-sky-100 px-4 py-2 text-sm font-black text-sky-700">
                Age {userAge}
              </div>
              <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                {settings.label}
              </div>
            </div>
          </div>
        </header>

        <main className="rounded-[2rem] bg-white/70 p-5 shadow-2xl backdrop-blur">
          <section className="mb-6 grid gap-5 md:grid-cols-[280px_1fr]">
            <div className="rounded-[2rem] bg-gradient-to-br from-yellow-100 to-pink-100 p-6 text-center shadow-inner">
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="mb-3 text-8xl"
              >
                {wordItem.emoji}
              </motion.div>

              <p className="mb-2 text-sm font-black uppercase tracking-wider text-slate-400">
                Spell this word
              </p>

              <div className="rounded-2xl bg-white px-4 py-3 text-2xl font-black text-emerald-700 shadow">
                {wordItem.label}
              </div>

              <button
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(wordItem.label);
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-sky-600 shadow transition hover:scale-105 active:scale-95"
              >
                <Volume2 className="h-4 w-4" />
                Say word
              </button>
            </div>

            <div className="flex flex-col justify-center rounded-[2rem] bg-emerald-50 p-5 shadow-inner">
              <p className="mb-4 text-center text-lg font-black text-emerald-800">{message}</p>

              <div className="flex flex-wrap justify-center gap-3">
                {targetLetters.map((letter, index) => {
                  const planted = answer[index];

                  return (
                    <motion.div
                      key={`${letter}-${index}`}
                      animate={
                        sparkleIndex === index ? { scale: [1, 1.25, 1], rotate: [0, -5, 5, 0] } : {}
                      }
                      className="relative flex flex-col items-center"
                    >
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-t-full border-4 border-amber-700 bg-amber-500 shadow-lg">
                        <AnimatePresence mode="wait">
                          {planted ? (
                            <motion.span
                              key={planted}
                              initial={{ scale: 0, y: 20, opacity: 0 }}
                              animate={{ scale: 1, y: 0, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              className="text-4xl font-black text-white"
                            >
                              {planted}
                            </motion.span>
                          ) : (
                            <span className="text-4xl font-black text-white/35">
                              {settings.showHints ? letter : ''}
                            </span>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {sparkleIndex === index && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1.4, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute -top-6 text-2xl"
                            >
                              ✨
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="h-5 w-24 rounded-b-2xl bg-amber-800" />

                      {planted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-10 text-4xl"
                        >
                          🌸
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={undoLast}
                  disabled={completed || answer.length === 0}
                  className="rounded-2xl bg-white px-5 py-3 font-black text-slate-600 shadow transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Undo
                </button>

                <button
                  onClick={resetWithNewWord}
                  className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-emerald-700 shadow transition hover:-translate-y-1"
                >
                  <RotateCcw className="h-5 w-5" />
                  New Word
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-gradient-to-br from-sky-50 to-white p-5 shadow-inner">
            <p className="mb-5 text-center text-sm font-black uppercase tracking-wider text-slate-400">
              Floating Letters
            </p>

            <div className="flex min-h-[170px] flex-wrap items-center justify-center gap-4">
              {tiles.map((tile, index) => (
                <motion.button
                  key={tile.id}
                  drag={!tile.used && !completed}
                  dragSnapToOrigin
                  onClick={() => {
                    if (dragLockRef.current === tile.id) return;
                    placeLetter(tile);
                  }}
                  onDragStart={() => {
                    dragLockRef.current = tile.id;
                  }}
                  onDragEnd={(_, info) => {
                    const distance = Math.hypot(info.offset.x, info.offset.y);

                    if (distance > 35) {
                      placeLetter(tile);
                    }

                    window.setTimeout(() => {
                      if (dragLockRef.current === tile.id) {
                        dragLockRef.current = null;
                      }
                    }, 80);
                  }}
                  disabled={tile.used || completed}
                  animate={
                    tile.used
                      ? { scale: 0, opacity: 0 }
                      : {
                          y: [0, -12, 0],
                          rotate: [-3, 3, -3],
                        }
                  }
                  transition={{
                    repeat: tile.used ? 0 : Infinity,
                    duration: settings.floatDuration,
                    delay: index * 0.15,
                    ease: 'easeInOut',
                  }}
                  whileHover={!tile.used ? { scale: 1.12 } : {}}
                  whileTap={!tile.used ? { scale: 0.9 } : {}}
                  className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-yellow-200 to-amber-300 text-4xl font-black text-amber-900 shadow-xl transition ${
                    tile.used ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'
                  }`}
                >
                  <span className="absolute -left-4 top-4 text-2xl">🪽</span>
                  <span className="absolute -right-4 top-4 scale-x-[-1] text-2xl">🪽</span>
                  {tile.letter}
                </motion.button>
              ))}
            </div>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 p-4 backdrop-blur"
          >
            <div className="max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl">
              <Sparkles className="mx-auto mb-3 h-14 w-14 text-amber-400" />

              <h2 className="mb-2 text-3xl font-black text-emerald-700">Word Bloomed!</h2>

              <p className="mb-4 font-bold text-slate-600">
                You spelled <span className="text-emerald-700">{wordItem.word}</span>!
              </p>

              <div className="mb-5 text-4xl">
                {mistakes === 0 ? '⭐⭐⭐' : mistakes <= 2 ? '⭐⭐' : '⭐'}
              </div>

              <button
                onClick={resetWithNewWord}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-400 px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-1 active:scale-95"
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
