import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, Sparkles, Star } from 'lucide-react';

interface GameProps {
  userAge: number;
  onGameComplete: (stars: number) => void;
}

type ChapterId = 1 | 2 | 3;

type ElementId =
  | 'water'
  | 'earth'
  | 'sun'
  | 'air'
  | 'mud'
  | 'sprout'
  | 'plant'
  | 'tree'
  | 'forest'
  | 'seed'
  | 'soil'
  | 'plantedSeed'
  | 'flower'
  | 'fruit'
  | 'grass'
  | 'warmForest'
  | 'healthyForest'
  | 'freshGrass'
  | 'rabbit'
  | 'animalHome';

type ChapterQuestId = string;

type ElementDef = {
  id: ElementId;
  emoji: string;
  label: string;
  displayIcon?: string;
};

type DiscoveryBookEntry = {
  id: ChapterQuestId;
  discoveryId: ElementId;
  name: string;
  recipe: string;
  fact: string;
};

type FailedExperiment = {
  key: string;
  label: string;
};

type Recipe = {
  a: ElementId;
  b: ElementId;
  result: ElementId;
};

type ChapterQuest = {
  id: ChapterQuestId;
  discoveryId: ElementId;
  label: string;
};

type ChapterConfig = {
  id: ChapterId;
  title: string;
  goalLabel: string;
  goalEmoji: string;
  initialLesson: string;
  startingElements: ElementId[];
  recipes: Recipe[];
  quests: ChapterQuest[];
  discoveryBook: Record<ChapterQuestId, DiscoveryBookEntry>;
  hints: Record<ChapterQuestId, string>;
  lessons: Record<'initial' | ChapterQuestId, string>;
  finalDiscovery: ElementId;
  completeEmoji: string;
  completeTitle: string;
  completeMessage: string;
  completeMode: 'continue' | 'finish';
  completeShowStars?: boolean;
  continueButtonLabel?: string;
  finishButtonLabel?: string;
};

const ELEMENT_DEFS: Record<ElementId, ElementDef> = {
  water: { id: 'water', emoji: '💧', label: 'Water' },
  earth: { id: 'earth', emoji: '🌎', label: 'Earth' },
  sun: { id: 'sun', emoji: '☀️', label: 'Sun' },
  air: { id: 'air', emoji: '💨', label: 'Air' },
  mud: { id: 'mud', emoji: '🟫', label: 'Mud' },
  sprout: { id: 'sprout', emoji: '🌱', label: 'Sprout' },
  plant: { id: 'plant', emoji: '🌿', label: 'Plant' },
  tree: { id: 'tree', emoji: '🌳', label: 'Tree' },
  forest: { id: 'forest', emoji: '🌲', label: 'Forest' },
  seed: { id: 'seed', emoji: '🌰', label: 'Seed' },
  soil: { id: 'soil', emoji: '🟤', label: 'Soil' },
  plantedSeed: { id: 'plantedSeed', emoji: '🌰', label: 'Planted Seed' },
  flower: { id: 'flower', emoji: '🌸', label: 'Flower' },
  fruit: { id: 'fruit', emoji: '🍎', label: 'Fruit' },
  grass: { id: 'grass', emoji: '🌿', label: 'Grass' },
  warmForest: {
    id: 'warmForest',
    emoji: '🌲',
    displayIcon: '🌲☀️',
    label: 'Warm Forest',
  },
  healthyForest: {
    id: 'healthyForest',
    emoji: '🌲',
    displayIcon: '🌲🌲🌲☀️',
    label: 'Healthy Forest',
  },
  freshGrass: { id: 'freshGrass', emoji: '🌾', label: 'Fresh Grass' },
  rabbit: { id: 'rabbit', emoji: '🐇', label: 'Rabbit' },
  animalHome: {
    id: 'animalHome',
    emoji: '🏡',
    displayIcon: '🏡🌲',
    label: 'Animal Home',
  },
};

const CHAPTER_1: ChapterConfig = {
  id: 1,
  title: 'Chapter 1: From Elements to Life',
  goalLabel: 'Create a Forest',
  goalEmoji: '🌲',
  initialLesson:
    'Nature begins with simple elements like water, earth, sunlight, and air.',
  startingElements: ['water', 'earth', 'sun', 'air'],
  recipes: [
    { a: 'water', b: 'earth', result: 'mud' },
    { a: 'mud', b: 'sun', result: 'sprout' },
    { a: 'sprout', b: 'sun', result: 'plant' },
    { a: 'plant', b: 'air', result: 'tree' },
    { a: 'tree', b: 'water', result: 'forest' },
  ],
  quests: [
    { id: 'mud', discoveryId: 'mud', label: 'Create Mud' },
    { id: 'sprout', discoveryId: 'sprout', label: 'Create Sprout' },
    { id: 'plant', discoveryId: 'plant', label: 'Create Plant' },
    { id: 'tree', discoveryId: 'tree', label: 'Create Tree' },
    { id: 'forest', discoveryId: 'forest', label: 'Create Forest' },
  ],
  discoveryBook: {
    mud: {
      id: 'mud',
      discoveryId: 'mud',
      name: 'Mud',
      recipe: 'Water + Earth',
      fact: 'Mud forms when water mixes with soil. It can hold moisture for plants.',
    },
    sprout: {
      id: 'sprout',
      discoveryId: 'sprout',
      name: 'Sprout',
      recipe: 'Mud + Sun',
      fact: 'A sprout is a very young plant beginning to grow.',
    },
    plant: {
      id: 'plant',
      discoveryId: 'plant',
      name: 'Plant',
      recipe: 'Sprout + Sun',
      fact: 'Plants use sunlight, water, and air to make their own food.',
    },
    tree: {
      id: 'tree',
      discoveryId: 'tree',
      name: 'Tree',
      recipe: 'Plant + Air',
      fact: 'Trees give shade, shelter, and help clean the air.',
    },
    forest: {
      id: 'forest',
      discoveryId: 'forest',
      name: 'Forest',
      recipe: 'Tree + Water',
      fact: 'A forest is a home for many plants and animals.',
    },
  },
  hints: {
    mud: 'Try mixing Water and Earth.',
    sprout: 'A tiny plant needs soft mud and sunlight.',
    plant: 'Sprouts grow stronger with more sunlight.',
    tree: 'Plants need air to grow into trees.',
    forest: 'Many trees need water to become a healthy forest.',
  },
  lessons: {
    initial:
      'Nature begins with simple elements like water, earth, sunlight, and air.',
    mud: 'Mud forms when water mixes with soil. It can hold moisture for plants.',
    sprout: 'A sprout is a very young plant beginning to grow.',
    plant: 'Plants use sunlight, water, and air to make their own food.',
    tree: 'Trees give shade, shelter, and help clean the air.',
    forest: 'A forest is a home for many plants and animals.',
  },
  finalDiscovery: 'forest',
  completeEmoji: '🌲',
  completeTitle: 'Chapter 1 Complete!',
  completeMessage: 'You created a Forest — a home for plants and animals!',
  completeMode: 'continue',
  continueButtonLabel: 'Continue to Chapter 2',
};

const CHAPTER_2: ChapterConfig = {
  id: 2,
  title: 'Chapter 2: Plant Life',
  goalLabel: 'Create Fruit',
  goalEmoji: '🍎',
  initialLesson:
    'Every fruit begins as a tiny seed resting in soil, waiting for water and sunlight.',
  startingElements: ['water', 'sun', 'air', 'seed', 'soil'],
  recipes: [
    { a: 'seed', b: 'soil', result: 'plantedSeed' },
    { a: 'plantedSeed', b: 'water', result: 'sprout' },
    { a: 'sprout', b: 'sun', result: 'plant' },
    { a: 'plant', b: 'sun', result: 'flower' },
    { a: 'flower', b: 'air', result: 'fruit' },
  ],
  quests: [
    { id: 'plantedSeed', discoveryId: 'plantedSeed', label: 'Plant a Seed' },
    { id: 'sprout', discoveryId: 'sprout', label: 'Create Sprout' },
    { id: 'plant', discoveryId: 'plant', label: 'Grow Plant' },
    { id: 'flower', discoveryId: 'flower', label: 'Create Flower' },
    { id: 'fruit', discoveryId: 'fruit', label: 'Create Fruit' },
  ],
  discoveryBook: {
    seed: {
      id: 'seed',
      discoveryId: 'seed',
      name: 'Seed',
      recipe: 'Starting element',
      fact: 'A seed holds the beginning of a new plant.',
    },
    soil: {
      id: 'soil',
      discoveryId: 'soil',
      name: 'Soil',
      recipe: 'Starting element',
      fact: 'Soil gives plants a place to grow and holds water.',
    },
    plantedSeed: {
      id: 'plantedSeed',
      discoveryId: 'plantedSeed',
      name: 'Planted Seed',
      recipe: 'Seed + Soil',
      fact: 'A planted seed rests in soil before it starts growing.',
    },
    sprout: {
      id: 'sprout',
      discoveryId: 'sprout',
      name: 'Sprout',
      recipe: 'Planted Seed + Water',
      fact: 'A sprout is a baby plant.',
    },
    plant: {
      id: 'plant',
      discoveryId: 'plant',
      name: 'Plant',
      recipe: 'Sprout + Sun',
      fact: 'Plants use sunlight, water, and air to make food.',
    },
    flower: {
      id: 'flower',
      discoveryId: 'flower',
      name: 'Flower',
      recipe: 'Plant + Sun',
      fact: 'Flowers help many plants make new seeds.',
    },
    fruit: {
      id: 'fruit',
      discoveryId: 'fruit',
      name: 'Fruit',
      recipe: 'Flower + Air',
      fact: 'Fruit can protect seeds and help new plants grow.',
    },
  },
  hints: {
    plantedSeed: 'Seeds need soil to begin growing.',
    sprout: 'Seeds need water to wake up and sprout.',
    plant: 'Sprouts need sunlight to grow stronger.',
    flower: 'Plants use sunlight to grow flowers.',
    fruit: 'Flowers can become fruit with help from air and nature.',
  },
  lessons: {
    initial:
      'Every fruit begins as a tiny seed resting in soil, waiting for water and sunlight.',
    plantedSeed: 'A planted seed rests in soil before it starts growing.',
    sprout: 'A sprout is a baby plant.',
    plant: 'Plants use sunlight, water, and air to make food.',
    flower: 'Flowers help many plants make new seeds.',
    fruit: 'Fruit can protect seeds and help new plants grow.',
  },
  finalDiscovery: 'fruit',
  completeEmoji: '🍎',
  completeTitle: 'Chapter 2 Complete!',
  completeMessage: 'You completed the plant life cycle and grew Fruit!',
  completeMode: 'continue',
  continueButtonLabel: 'Continue to Chapter 3',
};

const CHAPTER_3: ChapterConfig = {
  id: 3,
  title: 'Chapter 3: Forest Habitat',
  goalLabel: 'Create Animal Home',
  goalEmoji: '🏡🌲',
  initialLesson:
    'Forests give animals food, water, and shelter. A healthy habitat helps life thrive.',
  startingElements: ['forest', 'water', 'sun', 'grass', 'seed', 'air'],
  recipes: [
    { a: 'forest', b: 'sun', result: 'warmForest' },
    { a: 'warmForest', b: 'water', result: 'healthyForest' },
    { a: 'grass', b: 'water', result: 'freshGrass' },
    { a: 'freshGrass', b: 'healthyForest', result: 'rabbit' },
    { a: 'rabbit', b: 'healthyForest', result: 'animalHome' },
  ],
  quests: [
    { id: 'warmForest', discoveryId: 'warmForest', label: 'Create Warm Forest' },
    { id: 'healthyForest', discoveryId: 'healthyForest', label: 'Create Healthy Forest' },
    { id: 'freshGrass', discoveryId: 'freshGrass', label: 'Grow Fresh Grass' },
    { id: 'rabbit', discoveryId: 'rabbit', label: 'Discover Rabbit' },
    { id: 'animalHome', discoveryId: 'animalHome', label: 'Create Animal Home' },
  ],
  discoveryBook: {
    warmForest: {
      id: 'warmForest',
      discoveryId: 'warmForest',
      name: 'Warm Forest',
      recipe: 'Forest + Sun',
      fact: 'Sunlight gives energy to plants and warms the forest.',
    },
    healthyForest: {
      id: 'healthyForest',
      discoveryId: 'healthyForest',
      name: 'Healthy Forest',
      recipe: 'Warm Forest + Water',
      fact: 'Water helps trees and plants stay alive.',
    },
    freshGrass: {
      id: 'freshGrass',
      discoveryId: 'freshGrass',
      name: 'Fresh Grass',
      recipe: 'Grass + Water',
      fact: 'Many plant-eating animals depend on grass.',
    },
    rabbit: {
      id: 'rabbit',
      discoveryId: 'rabbit',
      name: 'Rabbit',
      recipe: 'Fresh Grass + Healthy Forest',
      fact: 'Rabbits eat plants and need safe habitats.',
    },
    animalHome: {
      id: 'animalHome',
      discoveryId: 'animalHome',
      name: 'Animal Home',
      recipe: 'Rabbit + Healthy Forest',
      fact: 'A habitat is a place where animals can find food, water, and shelter.',
    },
  },
  hints: {
    warmForest: 'Forests need sunlight to stay warm and full of energy.',
    healthyForest: 'Warm forests need water to stay green and healthy.',
    freshGrass: 'Grass grows better with water.',
    rabbit: 'Rabbits need fresh grass and a healthy forest.',
    animalHome: 'Rabbits need a healthy forest with food, water, and shelter.',
  },
  lessons: {
    initial:
      'Forests give animals food, water, and shelter. A healthy habitat helps life thrive.',
    warmForest: 'Sunlight gives energy to plants and warms the forest.',
    healthyForest: 'Water helps trees and plants stay alive.',
    freshGrass: 'Many plant-eating animals depend on grass.',
    rabbit: 'Rabbits eat plants and need safe habitats.',
    animalHome:
      'A habitat is a place where animals can find food, water, and shelter.',
  },
  finalDiscovery: 'animalHome',
  completeEmoji: '🏡🌲',
  completeTitle: 'Mission Complete!',
  completeMessage:
    'You created an Animal Home — rabbits now have food, water, and shelter!',
  completeMode: 'continue',
  completeShowStars: true,
  continueButtonLabel: 'Continue to Chapter 4',
};

const CHAPTERS: Record<ChapterId, ChapterConfig> = {
  1: CHAPTER_1,
  2: CHAPTER_2,
  3: CHAPTER_3,
};

function getNextChapterId(current: ChapterId): ChapterId | null {
  const next = (current + 1) as ChapterId;
  return next in CHAPTERS ? next : null;
}

function matchRecipe(
  recipes: Recipe[],
  a: ElementId,
  b: ElementId
): ElementId | null {
  for (const recipe of recipes) {
    if (
      (recipe.a === a && recipe.b === b) ||
      (recipe.a === b && recipe.b === a)
    ) {
      return recipe.result;
    }
  }
  return null;
}

function comboKey(a: ElementId, b: ElementId): string {
  return [a, b].sort().join('+');
}

function formatCombo(a: ElementId, b: ElementId): string {
  const [first, second] = [ELEMENT_DEFS[a], ELEMENT_DEFS[b]].sort((x, y) =>
    x.label.localeCompare(y.label)
  );
  return `${first.label} + ${second.label}`;
}

function getNextQuestHint(
  chapter: ChapterConfig,
  discoveries: ElementId[]
): string | null {
  for (const quest of chapter.quests) {
    if (!discoveries.includes(quest.discoveryId)) {
      return chapter.hints[quest.id];
    }
  }
  return null;
}

function findQuestByDiscovery(
  chapter: ChapterConfig,
  discoveryId: ElementId
): ChapterQuest | undefined {
  return chapter.quests.find((quest) => quest.discoveryId === discoveryId);
}

function findBookEntry(
  chapter: ChapterConfig,
  discoveryId: ElementId
): DiscoveryBookEntry | undefined {
  const quest = findQuestByDiscovery(chapter, discoveryId);
  if (quest) return chapter.discoveryBook[quest.id];
  return Object.values(chapter.discoveryBook).find(
    (entry) => entry.discoveryId === discoveryId
  );
}

function getElementIcon(element: ElementDef): string {
  return element.displayIcon ?? element.emoji;
}

function getIconSizeClass(displayIcon: string, size: 'lg' | 'md'): string {
  const isComposite = displayIcon.length > 2;
  if (size === 'lg') {
    return isComposite ? 'text-2xl sm:text-3xl tracking-tight' : 'text-4xl sm:text-5xl';
  }
  return isComposite ? 'text-lg tracking-tight' : 'text-3xl';
}

const HEX_CLIP =
  'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

function HexTile({
  element,
  onClick,
  selected,
  emptyLabel,
  size = 'lg',
}: {
  element: ElementDef | null;
  onClick?: () => void;
  selected?: boolean;
  emptyLabel?: string;
  size?: 'lg' | 'md';
}) {
  const sizeClass = size === 'lg' ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-20 w-20';
  const iconText = element ? getElementIcon(element) : '';
  const emojiClass = element ? getIconSizeClass(iconText, size) : '';

  const inner = (
    <div
      className={`${sizeClass} flex flex-col items-center justify-center transition-transform ${
        selected ? 'scale-105' : ''
      }`}
      style={{ clipPath: HEX_CLIP }}
    >
      <div
        className={`flex h-full w-full flex-col items-center justify-center border-4 shadow-lg ${
          element
            ? 'border-emerald-300 bg-gradient-to-b from-white to-emerald-50'
            : 'border-dashed border-emerald-200 bg-white/70'
        } ${selected ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`}
        style={{ clipPath: HEX_CLIP }}
      >
        {element ? (
          <>
            <span className={`${emojiClass} leading-none`}>{iconText}</span>
            <span className="mt-1 text-xs font-bold text-emerald-800 sm:text-sm">
              {element.label}
            </span>
          </>
        ) : (
          <span className="px-2 text-center text-xs font-semibold text-emerald-600/80">
            {emptyLabel ?? 'Empty'}
          </span>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        aria-label={element ? element.label : emptyLabel}
      >
        {inner}
      </button>
    );
  }

  return inner;
}

function ElementCard({
  element,
  onSelect,
  disabled,
}: {
  element: ElementDef;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      layout
      whileHover={disabled ? undefined : { scale: 1.04, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onSelect}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-3 shadow-md transition-colors ${
        disabled
          ? 'cursor-not-allowed border-slate-200 opacity-50'
          : 'border-sky-200 hover:border-sky-400 hover:shadow-lg'
      }`}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 shadow-inner"
        style={{ clipPath: HEX_CLIP }}
      >
        <span className={`text-2xl leading-none ${getElementIcon(element).length > 2 ? 'tracking-tighter' : ''}`}>
          {getElementIcon(element)}
        </span>
      </div>
      <span className="text-left text-sm font-bold text-slate-800">{element.label}</span>
    </motion.button>
  );
}

function createChapterProgress(chapter: ChapterConfig) {
  return {
    available: [...chapter.startingElements],
    discoveries: [] as ElementId[],
    lessonKey: 'initial' as 'initial' | ChapterQuestId,
    wrongAttemptsCount: 0,
    failedExperiments: [] as FailedExperiment[],
    activeHint: null as string | null,
    slotA: null as ElementId | null,
    slotB: null as ElementId | null,
    feedback: null as string | null,
  };
}

export default function EcoGenesisLab({ userAge, onGameComplete }: GameProps) {
  const chapterCompleteRef = useRef(false);
  const gameCompleteCalledRef = useRef(false);
  const failTimerRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);
  const completeTimerRef = useRef<number | null>(null);

  const [chapterId, setChapterId] = useState<ChapterId>(1);
  const [available, setAvailable] = useState<ElementId[]>(CHAPTER_1.startingElements);
  const [discoveries, setDiscoveries] = useState<ElementId[]>([]);
  const [slotA, setSlotA] = useState<ElementId | null>(null);
  const [slotB, setSlotB] = useState<ElementId | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lessonKey, setLessonKey] = useState<'initial' | ChapterQuestId>('initial');
  const [discoveryPopup, setDiscoveryPopup] = useState<ElementDef | null>(null);
  const [bookEntry, setBookEntry] = useState<DiscoveryBookEntry | null>(null);
  const [chapterComplete, setChapterComplete] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [wrongAttemptsCount, setWrongAttemptsCount] = useState(0);
  const [failedExperiments, setFailedExperiments] = useState<FailedExperiment[]>([]);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const chapter = CHAPTERS[chapterId];
  const lessonText = chapter.lessons[lessonKey] ?? chapter.initialLesson;
  const nextQuestHint = getNextQuestHint(chapter, discoveries);
  const showHintButton = wrongAttemptsCount >= 3 && nextQuestHint !== null;

  const availableDefs = useMemo(
    () => available.map((id) => ELEMENT_DEFS[id]),
    [available]
  );

  const discoveryDefs = useMemo(
    () =>
      discoveries
        .filter((id) => findQuestByDiscovery(chapter, id))
        .map((id) => ELEMENT_DEFS[id]),
    [discoveries, chapter]
  );

  const recentFailures = failedExperiments.slice(0, 5);

  const clearSlots = useCallback(() => {
    setSlotA(null);
    setSlotB(null);
  }, []);

  const resetChapterProgress = useCallback((nextChapter: ChapterConfig) => {
    const progress = createChapterProgress(nextChapter);
    setAvailable(progress.available);
    setDiscoveries(progress.discoveries);
    setSlotA(progress.slotA);
    setSlotB(progress.slotB);
    setFeedback(progress.feedback);
    setLessonKey(progress.lessonKey);
    setWrongAttemptsCount(progress.wrongAttemptsCount);
    setFailedExperiments(progress.failedExperiments);
    setActiveHint(progress.activeHint);
    setDiscoveryPopup(null);
    setBookEntry(null);
    setIsResolving(false);
    chapterCompleteRef.current = false;
  }, []);

  const finishMission = useCallback(() => {
    if (gameCompleteCalledRef.current) return;
    gameCompleteCalledRef.current = true;
    setCelebrating(false);
    setChapterComplete(false);
    onGameComplete(3);
  }, [onGameComplete]);

  const handleChapterContinue = useCallback(() => {
    setChapterComplete(false);
    setCelebrating(false);

    const nextChapterId = getNextChapterId(chapterId);
    if (nextChapterId !== null) {
      setChapterId(nextChapterId);
      resetChapterProgress(CHAPTERS[nextChapterId]);
      return;
    }

    finishMission();
  }, [chapterId, resetChapterProgress, finishMission]);

  const recordFailedExperiment = useCallback((a: ElementId, b: ElementId) => {
    const key = comboKey(a, b);
    const label = formatCombo(a, b);

    setWrongAttemptsCount((count) => count + 1);
    setFailedExperiments((prev) => {
      const withoutDuplicate = prev.filter((entry) => entry.key !== key);
      return [{ key, label }, ...withoutDuplicate];
    });
  }, []);

  const addDiscovery = useCallback(
    (resultId: ElementId, currentChapter: ChapterConfig) => {
      setDiscoveries((prev) => (prev.includes(resultId) ? prev : [...prev, resultId]));
      setAvailable((prev) => (prev.includes(resultId) ? prev : [...prev, resultId]));
      setActiveHint(null);

      const quest = findQuestByDiscovery(currentChapter, resultId);
      if (quest) {
        setLessonKey(quest.id);
      }
    },
    []
  );

  const processCombination = useCallback(
    (a: ElementId, b: ElementId) => {
      setIsResolving(true);
      setFeedback(null);
      setActiveHint(null);

      const result = matchRecipe(chapter.recipes, a, b);

      if (result) {
        if (successTimerRef.current !== null) {
          window.clearTimeout(successTimerRef.current);
        }

        successTimerRef.current = window.setTimeout(() => {
          clearSlots();
          addDiscovery(result, chapter);
          setDiscoveryPopup(ELEMENT_DEFS[result]);
          setIsResolving(false);
          successTimerRef.current = null;

          if (result === chapter.finalDiscovery && !chapterCompleteRef.current) {
            chapterCompleteRef.current = true;
            window.setTimeout(() => {
              setDiscoveryPopup(null);
              if (chapter.completeMode === 'continue') {
                setChapterComplete(true);
              } else {
                setCelebrating(true);
              }
            }, 1400);
          }
        }, 400);

        return;
      }

      recordFailedExperiment(a, b);
      setFeedback('Try another combination!');

      if (failTimerRef.current !== null) {
        window.clearTimeout(failTimerRef.current);
      }

      failTimerRef.current = window.setTimeout(() => {
        clearSlots();
        setFeedback(null);
        setIsResolving(false);
        failTimerRef.current = null;
      }, 1200);
    },
    [addDiscovery, chapter, clearSlots, recordFailedExperiment]
  );

  const handleSelectElement = (id: ElementId) => {
    if (isResolving || celebrating || chapterComplete || discoveryPopup || bookEntry) {
      return;
    }

    if (!slotA) {
      setSlotA(id);
      setFeedback(null);
      return;
    }

    if (!slotB) {
      setSlotB(id);
      setFeedback(null);
      processCombination(slotA, id);
    }
  };

  useEffect(() => {
    return () => {
      if (failTimerRef.current !== null) {
        window.clearTimeout(failTimerRef.current);
      }
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
      if (completeTimerRef.current !== null) {
        window.clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!celebrating || chapter.completeMode !== 'finish') return;
    if (gameCompleteCalledRef.current) return;

    completeTimerRef.current = window.setTimeout(() => {
      finishMission();
      completeTimerRef.current = null;
    }, 1000);

    return () => {
      if (completeTimerRef.current !== null) {
        window.clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
      }
    };
  }, [celebrating, chapter.completeMode, finishMission]);

  const ageBadge =
    userAge < 6 ? 'Young Scientist' : userAge <= 8 ? 'Lab Explorer' : 'Eco Genius';

  const uiBlocked =
    isResolving || !!discoveryPopup || !!bookEntry || celebrating || chapterComplete;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-emerald-50 to-amber-50 px-3 py-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-lg text-amber-300/60"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
          >
            ✨
          </motion.span>
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">{ageBadge}</span>
            <span className="text-xs text-slate-400">· Age {userAge}</span>
          </motion.div>
          <h1 className="mt-3 text-3xl font-black text-emerald-900 sm:text-4xl">
            Eco Genesis Lab
          </h1>

          <div className="mx-auto mt-4 max-w-sm rounded-2xl border-2 border-sky-200 bg-white/90 px-5 py-4 text-left shadow-md">
            <p className="text-sm font-black uppercase tracking-wide text-sky-800">
              {chapter.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-sky-600">
              Goal: {chapter.goalLabel} {chapter.goalEmoji}
            </p>
            <ul className="mt-3 space-y-2">
              {chapter.quests.map((quest) => {
                const done = discoveries.includes(quest.discoveryId);
                return (
                  <li
                    key={quest.id}
                    className={`flex items-center gap-2 text-sm font-bold ${
                      done ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded border-2 text-xs ${
                        done
                          ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                          : 'border-slate-300 bg-white text-slate-400'
                      }`}
                    >
                      {done ? '✓' : ''}
                    </span>
                    {quest.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <section className="rounded-3xl border-2 border-sky-200 bg-white/90 p-4 shadow-lg lg:col-span-3">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-sky-800">
              <span>🧪</span> Available Elements
            </h2>
            <div className="flex flex-col gap-2">
              {availableDefs.map((el) => (
                <ElementCard
                  key={el.id}
                  element={el}
                  disabled={uiBlocked}
                  onSelect={() => handleSelectElement(el.id)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-b from-white to-emerald-50/80 p-5 shadow-lg lg:col-span-6">
            <h2 className="mb-4 text-center text-sm font-black uppercase tracking-wide text-emerald-800">
              ⚗️ Crafting Lab
            </h2>

            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
              <div className="text-center">
                <p className="mb-2 text-xs font-bold text-emerald-600">Slot A</p>
                <HexTile
                  element={slotA ? ELEMENT_DEFS[slotA] : null}
                  emptyLabel="Pick element"
                  size="lg"
                />
              </div>

              <motion.div
                animate={{ rotate: isResolving ? 180 : 0 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl font-black text-amber-700 shadow-md"
              >
                +
              </motion.div>

              <div className="text-center">
                <p className="mb-2 text-xs font-bold text-emerald-600">Slot B</p>
                <HexTile
                  element={slotB ? ELEMENT_DEFS[slotB] : null}
                  emptyLabel="Pick element"
                  size="lg"
                />
              </div>
            </div>

            <div className="mt-6 min-h-[3rem] text-center">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.p
                    key="feedback"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800"
                  >
                    {feedback}
                  </motion.p>
                )}
                {!feedback && activeHint && (
                  <motion.p
                    key="active-hint"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-800"
                  >
                    💡 {activeHint}
                  </motion.p>
                )}
                {!feedback && !activeHint && !slotA && !slotB && (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-emerald-700/80"
                  >
                    Tap two elements to combine them!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {showHintButton && !isResolving && !discoveryPopup && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveHint(nextQuestHint)}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-800 shadow-sm hover:bg-amber-100"
                >
                  <Lightbulb className="h-4 w-4" />
                  Need a Hint?
                </button>
              </div>
            )}

            {(slotA || slotB) && !isResolving && !discoveryPopup && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={clearSlots}
                  className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50"
                >
                  Clear slots
                </button>
              </div>
            )}
          </section>

          <div className="flex flex-col gap-4 lg:col-span-3">
            <section className="rounded-3xl border-2 border-violet-200 bg-white/90 p-4 shadow-lg">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-violet-800">
                <span>📖</span> Discovery Book
              </h2>
              {discoveryDefs.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 px-3 py-6 text-center text-sm text-violet-600/80">
                  Discoveries will appear here. Tap one to read more!
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {discoveryDefs.map((el) => (
                    <motion.div
                      key={el.id}
                      layout
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center"
                    >
                      <HexTile
                        element={el}
                        size="md"
                        onClick={() => {
                          const entry = findBookEntry(chapter, el.id);
                          if (entry) setBookEntry(entry);
                        }}
                      />
                      <span className="mt-1 text-[10px] font-bold text-violet-600">
                        Tap to read
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border-2 border-rose-200 bg-white/90 p-4 shadow-lg">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-rose-800">
                <span>🧫</span> Failed Experiments
              </h2>
              {recentFailures.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 px-3 py-4 text-center text-sm text-rose-600/80">
                  No failed experiments yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {recentFailures.map((entry) => (
                    <li
                      key={entry.key}
                      className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-sm font-semibold text-rose-800"
                    >
                      {entry.label}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        <motion.footer
          layout
          className="mt-5 rounded-3xl border-2 border-amber-200 bg-white/90 p-4 shadow-md sm:p-5"
        >
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
            Science Lesson
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={`${chapterId}-${lessonKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 text-base font-medium leading-relaxed text-slate-700 sm:text-lg"
            >
              {lessonText}
            </motion.p>
          </AnimatePresence>
        </motion.footer>
      </div>

      <AnimatePresence>
        {discoveryPopup && !celebrating && !chapterComplete && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-emerald-900/30 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="relative max-w-sm rounded-3xl border-4 border-emerald-300 bg-white p-8 text-center shadow-2xl"
            >
              <p className="text-sm font-black uppercase tracking-wide text-emerald-600">
                New Discovery!
              </p>
              <div className="mx-auto mt-4">
                <HexTile element={discoveryPopup} size="lg" />
              </div>
              <p className="mt-4 text-xl font-black text-slate-800">
                You made {discoveryPopup.label}!
              </p>
              <button
                type="button"
                onClick={() => setDiscoveryPopup(null)}
                className="mt-5 rounded-2xl bg-emerald-500 px-6 py-2.5 text-sm font-black text-white shadow-lg hover:bg-emerald-400"
              >
                Keep Exploring
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookEntry && !celebrating && !chapterComplete && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-violet-900/25 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm rounded-3xl border-4 border-violet-300 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <HexTile element={ELEMENT_DEFS[bookEntry.discoveryId]} size="md" />
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-wide text-violet-600">
                    Discovery Book
                  </p>
                  <h3 className="text-xl font-black text-slate-800">{bookEntry.name}</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-left">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-sky-700">
                    Recipe
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-700">{bookEntry.recipe}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Science Fact
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{bookEntry.fact}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookEntry(null)}
                className="mt-6 w-full rounded-2xl bg-violet-500 px-6 py-2.5 text-sm font-black text-white shadow-lg hover:bg-violet-400"
              >
                Close Book
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chapterComplete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-400/90 to-sky-500/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0.6, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              className="max-w-md rounded-3xl border-4 border-white bg-white p-8 text-center shadow-2xl"
            >
              <div className="text-6xl">{chapter.completeEmoji}</div>
              <h2 className="mt-4 text-2xl font-black text-emerald-800">
                {chapter.completeTitle}
              </h2>
              <p className="mt-2 font-medium text-slate-600">{chapter.completeMessage}</p>
              {chapter.completeShowStars && (
                <>
                  <div className="mt-5 flex justify-center gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, rotate: -30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2 + i * 0.15, type: 'spring' }}
                      >
                        <Star className="h-10 w-10 fill-amber-400 text-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-bold text-amber-600">3 Stars Earned!</p>
                </>
              )}
              <button
                type="button"
                onClick={handleChapterContinue}
                className="mt-6 rounded-2xl bg-emerald-500 px-8 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-400"
              >
                {chapter.continueButtonLabel}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {celebrating && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-400/90 to-sky-500/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0.6, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              className="max-w-md rounded-3xl border-4 border-white bg-white p-8 text-center shadow-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="text-6xl"
              >
                {chapter.completeEmoji}
              </motion.div>
              <h2 className="mt-4 text-2xl font-black text-emerald-800">
                {chapter.completeTitle}
              </h2>
              <p className="mt-2 font-medium text-slate-600">{chapter.completeMessage}</p>
              <div className="mt-5 flex justify-center gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 + i * 0.15, type: 'spring' }}
                  >
                    <Star className="h-10 w-10 fill-amber-400 text-amber-400" />
                  </motion.div>
                ))}
              </div>
              <p className="mt-3 text-sm font-bold text-amber-600">3 Stars Earned!</p>
              <button
                type="button"
                onClick={finishMission}
                className="mt-6 rounded-2xl bg-emerald-500 px-8 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-400"
              >
                {chapter.finishButtonLabel}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
