import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ClipboardList,
  Eye,
  HelpCircle,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';

type GameProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type AgeMode = 'easy' | 'medium' | 'hard';

type Specimen = {
  id: string;
  symbol: string;
  name: string;
  group: 'dino' | 'reptile' | 'fossil' | 'nature' | 'toy' | 'simple';
};

type CardItem = {
  id: string;
  specimenId: string;
  symbol: string;
  name: string;
  isTarget: boolean;
  rotation: number;
};

type TargetInfo = {
  specimenId: string;
  symbol: string;
  name: string;
  count: number;
};

type RoundConfig = {
  cols: number;
  totalCards: number;
  targets: TargetInfo[];
  instruction: string;
  helperText: string;
  maxAnswer: number;
  modeLabel: string;
};

const SIMPLE_SPECIMENS: Specimen[] = [
  { id: 'red-ball', symbol: '🔴', name: 'red balls', group: 'simple' },
  { id: 'blue-ball', symbol: '🔵', name: 'blue balls', group: 'simple' },
  { id: 'star', symbol: '⭐', name: 'stars', group: 'simple' },
  { id: 'heart', symbol: '❤️', name: 'hearts', group: 'simple' },
  { id: 'diamond', symbol: '🔷', name: 'diamonds', group: 'simple' },
  { id: 'triangle', symbol: '🔺', name: 'triangles', group: 'simple' },
  { id: 'bear', symbol: '🧸', name: 'teddy bears', group: 'toy' },
  { id: 'balloon', symbol: '🎈', name: 'balloons', group: 'toy' },
  { id: 'rainbow', symbol: '🌈', name: 'rainbows', group: 'toy' },
  { id: 'apple', symbol: '🍎', name: 'apples', group: 'nature' },
  { id: 'flower', symbol: '🌼', name: 'flowers', group: 'nature' },
  { id: 'leaf', symbol: '🍃', name: 'leaves', group: 'nature' },
  { id: 'mushroom', symbol: '🍄', name: 'mushrooms', group: 'nature' },
  { id: 'egg', symbol: '🥚', name: 'eggs', group: 'fossil' },
  { id: 'bone', symbol: '🦴', name: 'bones', group: 'fossil' },
];

const DINO_SPECIMENS: Specimen[] = [
  { id: 'trex', symbol: '🦖', name: 'T-Rex fossils', group: 'dino' },
  { id: 'sauropod', symbol: '🦕', name: 'long-neck dinosaurs', group: 'dino' },
  { id: 'crocodile', symbol: '🐊', name: 'ancient crocodiles', group: 'reptile' },
  { id: 'turtle', symbol: '🐢', name: 'shell fossils', group: 'reptile' },
  { id: 'lizard', symbol: '🦎', name: 'lizard fossils', group: 'reptile' },
  { id: 'snake', symbol: '🐍', name: 'snake fossils', group: 'reptile' },
  { id: 'fossil-bone', symbol: '🦴', name: 'bones', group: 'fossil' },
  { id: 'fossil-egg', symbol: '🥚', name: 'eggs', group: 'fossil' },
  { id: 'volcano', symbol: '🌋', name: 'volcano rocks', group: 'nature' },
  { id: 'crystal', symbol: '💎', name: 'crystals', group: 'nature' },
  { id: 'fern', symbol: '🌿', name: 'ferns', group: 'nature' },
  { id: 'cactus', symbol: '🌵', name: 'desert plants', group: 'nature' },
  { id: 'mushroom', symbol: '🍄', name: 'mushrooms', group: 'nature' },
  { id: 'shell', symbol: '🐚', name: 'shell fossils', group: 'fossil' },
  { id: 'footprint', symbol: '🐾', name: 'footprints', group: 'fossil' },
  { id: 'dragon', symbol: '🐉', name: 'dragon models', group: 'dino' },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function makeId() {
  return Math.random().toString(36).slice(2);
}

function makeCard(specimen: Specimen, isTarget: boolean, rotationRange: number): CardItem {
  return {
    id: makeId(),
    specimenId: specimen.id,
    symbol: specimen.symbol,
    name: specimen.name,
    isTarget,
    rotation: -rotationRange + Math.random() * rotationRange * 2,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function DinoAuditor({ userAge, onGameComplete }: GameProps) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [round, setRound] = useState<RoundConfig | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [completed, setCompleted] = useState(false);
  const completedRef = useRef(false);

  const ageMode = useMemo<AgeMode>(() => {
    if (userAge < 6) return 'easy';
    if (userAge <= 8) return 'medium';
    return 'hard';
  }, [userAge]);

  const buildRound = (): { nextRound: RoundConfig; nextCards: CardItem[] } => {
    if (ageMode === 'easy') {
      const target = randomFrom(SIMPLE_SPECIMENS.slice(0, 9));
      const targetCount = Math.floor(Math.random() * 3) + 2;
      const totalCards = 6;
      const distractors = shuffle(
        SIMPLE_SPECIMENS.filter((specimen) => specimen.id !== target.id)
      ).slice(0, totalCards - targetCount);

      const nextCards = shuffle([
        ...Array.from({ length: targetCount }, () => makeCard(target, true, 0)),
        ...distractors.map((specimen) => makeCard(specimen, false, 0)),
      ]);

      return {
        nextRound: {
          cols: 3,
          totalCards,
          targets: [
            {
              specimenId: target.id,
              symbol: target.symbol,
              name: target.name,
              count: targetCount,
            },
          ],
          instruction: `Find all ${target.symbol}`,
          helperText: `Tap every ${target.name}. Then choose how many you found.`,
          maxAnswer: 6,
          modeLabel: 'Little Auditor',
        },
        nextCards,
      };
    }

    if (ageMode === 'medium') {
      const target = randomFrom(DINO_SPECIMENS.slice(0, 8));
      const targetCount = Math.floor(Math.random() * 5) + 4;
      const totalCards = 12;
      const distractorPool = DINO_SPECIMENS.filter((specimen) => specimen.id !== target.id);
      const similarDistractors = shuffle(distractorPool).slice(0, 5);

      const nextCards = shuffle([
        ...Array.from({ length: targetCount }, () => makeCard(target, true, 2)),
        ...Array.from({ length: totalCards - targetCount }, () =>
          makeCard(randomFrom(similarDistractors), false, 2)
        ),
      ]);

      return {
        nextRound: {
          cols: 4,
          totalCards,
          targets: [
            {
              specimenId: target.id,
              symbol: target.symbol,
              name: target.name,
              count: targetCount,
            },
          ],
          instruction: `Count every ${target.symbol}`,
          helperText: `The fossils look similar now. Audit carefully before answering.`,
          maxAnswer: 12,
          modeLabel: 'Fossil Counter',
        },
        nextCards,
      };
    }

    const targetSymbols = shuffle(DINO_SPECIMENS).slice(0, 2);
    const firstCount = Math.floor(Math.random() * 5) + 4;
    const secondCount = Math.floor(Math.random() * 4) + 3;
    const totalCards = 20;
    const targetCount = firstCount + secondCount;
    const distractorPool = DINO_SPECIMENS.filter(
      (specimen) => !targetSymbols.some((target) => target.id === specimen.id)
    );

    const nextCards = shuffle([
      ...Array.from({ length: firstCount }, () => makeCard(targetSymbols[0], true, 8)),
      ...Array.from({ length: secondCount }, () => makeCard(targetSymbols[1], true, 8)),
      ...Array.from({ length: totalCards - targetCount }, () =>
        makeCard(randomFrom(distractorPool), false, 10)
      ),
    ]);

    return {
      nextRound: {
        cols: 5,
        totalCards,
        targets: [
          {
            specimenId: targetSymbols[0].id,
            symbol: targetSymbols[0].symbol,
            name: targetSymbols[0].name,
            count: firstCount,
          },
          {
            specimenId: targetSymbols[1].id,
            symbol: targetSymbols[1].symbol,
            name: targetSymbols[1].name,
            count: secondCount,
          },
        ],
        instruction: `Count ${targetSymbols[0].symbol} + ${targetSymbols[1].symbol}`,
        helperText: `Add both target groups together. Some cards are rotated to trick your eyes.`,
        maxAnswer: 20,
        modeLabel: 'Senior Dino Auditor',
      },
      nextCards,
    };
  };

  const startNewRound = () => {
    const { nextRound, nextCards } = buildRound();

    setRound(nextRound);
    setCards(nextCards);
    setSelectedIds([]);
    setAttempts(0);
    setFeedback('idle');
    setCompleted(false);
    completedRef.current = false;
  };

  useEffect(() => {
    startNewRound();
    // startNewRound intentionally uses fresh randomness each time age mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageMode]);

  const toggleCard = (id: string) => {
    if (completed) return;

    setSelectedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    );
  };

  const totalTargetCount = useMemo(() => {
    if (!round) return 0;
    return round.targets.reduce((total, target) => total + target.count, 0);
  }, [round]);

  const options = useMemo(() => {
    if (!round) return [];

    const optionSet = new Set<number>([totalTargetCount]);
    const offsets = shuffle([-4, -3, -2, -1, 1, 2, 3, 4, 5]);

    for (const offset of offsets) {
      if (optionSet.size >= 6) break;
      optionSet.add(clamp(totalTargetCount + offset, 0, round.maxAnswer));
    }

    let guard = 0;
    while (optionSet.size < 6 && guard < 30) {
      optionSet.add(Math.floor(Math.random() * (round.maxAnswer + 1)));
      guard += 1;
    }

    return shuffle([...optionSet]);
  }, [round, totalTargetCount]);

  const targetProgress = useMemo(() => {
    if (!round) return [];

    return round.targets.map((target) => {
      const selected = cards.filter(
        (card) =>
          card.specimenId === target.specimenId &&
          card.isTarget &&
          selectedIds.includes(card.id)
      ).length;

      return {
        ...target,
        selected,
      };
    });
  }, [cards, round, selectedIds]);

  const selectedCorrectCount = cards.filter(
    (card) => card.isTarget && selectedIds.includes(card.id)
  ).length;

  const selectedWrongCount = cards.filter(
    (card) => !card.isTarget && selectedIds.includes(card.id)
  ).length;

  const submitAnswer = (value: number) => {
    if (!round || completed) return;

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (value === totalTargetCount) {
      setFeedback('correct');
      setCompleted(true);
      setSelectedIds(cards.filter((card) => card.isTarget).map((card) => card.id));

      if (!completedRef.current) {
        completedRef.current = true;
        const stars = nextAttempts === 1 ? 3 : nextAttempts === 2 ? 2 : 1;
        onGameComplete(stars);
      }
    } else {
      setFeedback('wrong');
    }
  };

  if (!round) return null;

  return (
    <div className="min-h-[640px] w-full rounded-3xl bg-gradient-to-b from-sky-50 via-indigo-50 to-amber-50 p-4 text-slate-700 shadow-xl">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
                <ClipboardList size={28} />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-500">
                  Dino Auditor Lab · {round.modeLabel}
                </p>
                <h2 className="text-2xl font-black text-slate-800">{round.instruction}</h2>
                <p className="mt-1 max-w-xl text-sm font-semibold text-slate-500">
                  {round.helperText}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {targetProgress.map((target) => (
                <div
                  key={target.specimenId}
                  className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 font-bold text-emerald-700"
                >
                  <span className="text-2xl">{target.symbol}</span>
                  <span>
                    Marked: {target.selected}/{target.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="grid gap-3 rounded-3xl bg-blue-50 p-4 shadow-inner sm:gap-4"
          style={{ gridTemplateColumns: `repeat(${round.cols}, minmax(0, 1fr))` }}
        >
          {cards.map((card) => {
            const selected = selectedIds.includes(card.id);

            return (
              <motion.button
                key={card.id}
                type="button"
                onClick={() => toggleCard(card.id)}
                whileHover={!completed ? { scale: 1.05 } : {}}
                whileTap={!completed ? { scale: 0.94 } : {}}
                animate={
                  completed && card.isTarget
                    ? { rotateY: [0, 180, 360], scale: [1, 1.08, 1] }
                    : { rotate: card.rotation }
                }
                transition={{ duration: completed && card.isTarget ? 0.7 : 0.2 }}
                className={`relative flex aspect-square items-center justify-center rounded-2xl bg-white text-3xl shadow-sm transition sm:text-4xl ${
                  selected ? 'opacity-50 ring-4 ring-emerald-300' : 'opacity-100'
                }`}
                aria-label={`${card.name} card`}
              >
                <span className="drop-shadow-sm">{card.symbol}</span>

                <AnimatePresence>
                  {selected && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <div className="rounded-full bg-green-500 p-2 text-white shadow-md">
                        <Check size={26} strokeWidth={4} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-col items-center justify-center gap-2 text-center text-lg font-bold sm:flex-row">
            <Search size={22} className="text-blue-500" />
            <span>What is the correct total?</span>
          </div>

          <div className="mb-4 grid gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-500 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-2">
              <Eye size={18} className="text-emerald-500" />
              Correct marked: {selectedCorrectCount}
            </div>
            <div className="flex items-center justify-center gap-2">
              <HelpCircle size={18} className="text-rose-400" />
              Extra marked: {selectedWrongCount}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              Attempts: {attempts}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => submitAnswer(option)}
                disabled={completed}
                className="min-w-16 rounded-2xl bg-indigo-200 px-5 py-3 text-xl font-black text-indigo-900 shadow-sm transition hover:-translate-y-1 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-4 flex min-h-8 items-center justify-center text-center text-lg font-bold">
            {feedback === 'correct' && (
              <motion.span
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-green-600"
              >
                Research complete! 🎉
              </motion.span>
            )}
            {feedback === 'wrong' && (
              <motion.span
                key={attempts}
                initial={{ x: -8 }}
                animate={{ x: [0, 8, -8, 0] }}
                className="text-rose-500"
              >
                Check the board again!
              </motion.span>
            )}
          </div>

          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={startNewRound}
              className="flex items-center gap-2 rounded-2xl bg-amber-200 px-6 py-3 font-bold text-amber-900 shadow-sm transition hover:-translate-y-1 hover:bg-amber-100"
            >
              <RotateCcw size={20} />
              New Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
