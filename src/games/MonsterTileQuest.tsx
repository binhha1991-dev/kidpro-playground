import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, RotateCcw, Shuffle, Sparkles, Star } from 'lucide-react';

interface GameProps {
  userAge: number;
  onGameComplete: (stars: number) => void;
}

const puzzleImages = [
  '/images/puzzles/monster-starter-pack1.png',
  '/images/puzzles/monster-starter-pack2.png',
  '/images/puzzles/monster-starter-pack3.png',
  '/images/puzzles/monster-starter-pack4.png',
  '/images/puzzles/monster-starter-pack5.png',
] as const;

type PuzzleImage = (typeof puzzleImages)[number];

type DifficultyConfig = {
  gridSize: 3 | 4 | 5;
  label: string;
  shuffleMoves: number;
  starThresholds: { three: number; two: number };
  showPreviewDefault: boolean;
  previewToggle: boolean;
};

function getDifficulty(userAge: number): DifficultyConfig {
  if (userAge < 6) {
    return {
      gridSize: 3,
      label: 'Little Explorer',
      shuffleMoves: 220,
      starThresholds: { three: 30, two: 50 },
      showPreviewDefault: true,
      previewToggle: false,
    };
  }

  if (userAge <= 8) {
    return {
      gridSize: 4,
      label: 'Puzzle Adventurer',
      shuffleMoves: 320,
      starThresholds: { three: 80, two: 130 },
      showPreviewDefault: true,
      previewToggle: false,
    };
  }

  return {
    gridSize: 5,
    label: 'Tile Master',
    shuffleMoves: 460,
    starThresholds: { three: 160, two: 240 },
    showPreviewDefault: false,
    previewToggle: true,
  };
}

function getRandomPuzzleImage(currentImage?: PuzzleImage): PuzzleImage {
  const choices = currentImage
    ? puzzleImages.filter((image) => image !== currentImage)
    : puzzleImages;
  return choices[Math.floor(Math.random() * choices.length)] ?? puzzleImages[0];
}

function getPuzzleImageIndex(image: PuzzleImage): number {
  return puzzleImages.indexOf(image) + 1;
}

function getPuzzleImageName(image: PuzzleImage): string {
  return image.split('/').pop() ?? `Puzzle ${getPuzzleImageIndex(image)}`;
}

function createSolvedBoard(gridSize: number): number[] {
  const total = gridSize * gridSize;
  return Array.from({ length: total }, (_, index) => index);
}

function getEmptyValue(gridSize: number): number {
  return gridSize * gridSize - 1;
}

function getEmptyIndex(board: number[]): number {
  return board.indexOf(board.length - 1);
}

function canMoveTile(board: number[], tileIndex: number, gridSize: number): boolean {
  const emptyIndex = getEmptyIndex(board);
  const tileRow = Math.floor(tileIndex / gridSize);
  const tileCol = tileIndex % gridSize;
  const emptyRow = Math.floor(emptyIndex / gridSize);
  const emptyCol = emptyIndex % gridSize;
  return Math.abs(tileRow - emptyRow) + Math.abs(tileCol - emptyCol) === 1;
}

function moveTile(board: number[], tileIndex: number): number[] {
  const emptyIndex = getEmptyIndex(board);
  const next = [...board];
  [next[tileIndex], next[emptyIndex]] = [next[emptyIndex], next[tileIndex]];
  return next;
}

function isSolved(board: number[]): boolean {
  return board.every((value, index) => value === index);
}

function shuffleBoard(gridSize: number, shuffleMoves: number): number[] {
  let board = createSolvedBoard(gridSize);
  let previousEmpty = -1;

  for (let step = 0; step < shuffleMoves; step += 1) {
    const emptyIndex = getEmptyIndex(board);
    const row = Math.floor(emptyIndex / gridSize);
    const col = emptyIndex % gridSize;
    const neighbors: number[] = [];

    if (row > 0) neighbors.push(emptyIndex - gridSize);
    if (row < gridSize - 1) neighbors.push(emptyIndex + gridSize);
    if (col > 0) neighbors.push(emptyIndex - 1);
    if (col < gridSize - 1) neighbors.push(emptyIndex + 1);

    const choices = neighbors.filter((index) => index !== previousEmpty);
    const pick = choices[Math.floor(Math.random() * choices.length)] ?? neighbors[0];
    board = moveTile(board, pick);
    previousEmpty = emptyIndex;
  }

  if (isSolved(board)) {
    return shuffleBoard(gridSize, shuffleMoves);
  }

  return board;
}

function getTileBackgroundStyle(tileValue: number, gridSize: number, image: PuzzleImage) {
  const emptyValue = getEmptyValue(gridSize);
  if (tileValue === emptyValue) return undefined;

  const row = Math.floor(tileValue / gridSize);
  const col = tileValue % gridSize;
  const step = gridSize > 1 ? 100 / (gridSize - 1) : 0;

  return {
    backgroundImage: `url(${image})`,
    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
    backgroundPosition: `${col * step}% ${row * step}%`,
    backgroundRepeat: 'no-repeat' as const,
  };
}

function calculateStars(moves: number, thresholds: { three: number; two: number }): number {
  if (moves <= thresholds.three) return 3;
  if (moves <= thresholds.two) return 2;
  return 1;
}

export default function MonsterTileQuest({ userAge, onGameComplete }: GameProps) {
  const difficulty = useMemo(() => getDifficulty(userAge), [userAge]);
  const { gridSize } = difficulty;
  const emptyValue = getEmptyValue(gridSize);

  const completeCalledRef = useRef(false);
  const initialBoardRef = useRef<number[]>(createSolvedBoard(gridSize));
  const [selectedImage, setSelectedImage] = useState<PuzzleImage>(() => getRandomPuzzleImage());

  const [board, setBoard] = useState<number[]>(() => {
    const shuffled = shuffleBoard(gridSize, difficulty.shuffleMoves);
    initialBoardRef.current = shuffled;
    return shuffled;
  });
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [showPreview, setShowPreview] = useState(difficulty.showPreviewDefault);

  const setupPuzzle = useCallback(() => {
    const shuffled = shuffleBoard(gridSize, difficulty.shuffleMoves);
    initialBoardRef.current = shuffled;
    setBoard(shuffled);
    setMoves(0);
    setCompleted(false);
    setEarnedStars(0);
    completeCalledRef.current = false;
  }, [difficulty.shuffleMoves, gridSize]);

  const startNewGame = useCallback(() => {
    setSelectedImage((currentImage) => getRandomPuzzleImage(currentImage));
    setShowPreview(difficulty.showPreviewDefault);
    setupPuzzle();
  }, [difficulty.showPreviewDefault, setupPuzzle]);

  const resetPuzzle = useCallback(() => {
    setBoard([...initialBoardRef.current]);
    setMoves(0);
    setCompleted(false);
    setEarnedStars(0);
    completeCalledRef.current = false;
  }, []);

  useEffect(() => {
    setShowPreview(difficulty.showPreviewDefault);
    setupPuzzle();
  }, [difficulty.showPreviewDefault, setupPuzzle]);

  const handleTileClick = (tileIndex: number) => {
    if (completed) return;
    if (!canMoveTile(board, tileIndex, gridSize)) return;

    const nextBoard = moveTile(board, tileIndex);
    const nextMoves = moves + 1;
    setBoard(nextBoard);
    setMoves(nextMoves);

    if (isSolved(nextBoard)) {
      const stars = calculateStars(nextMoves, difficulty.starThresholds);
      setEarnedStars(stars);
      setCompleted(true);
    }
  };

  const finishGame = useCallback(() => {
    if (completeCalledRef.current) return;
    completeCalledRef.current = true;
    onGameComplete(earnedStars);
  }, [earnedStars, onGameComplete]);

  useEffect(() => {
    if (!completed || completeCalledRef.current) return;

    const timer = window.setTimeout(() => {
      finishGame();
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [completed, finishGame]);

  const gapClass = gridSize === 3 ? 'gap-1.5 sm:gap-2' : 'gap-1 sm:gap-1.5';
  const tileRounded = gridSize === 3 ? 'rounded-xl sm:rounded-2xl' : 'rounded-lg sm:rounded-xl';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-sky-50 to-amber-50 px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 shadow-sm">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-bold text-violet-700">{difficulty.label}</span>
            <span className="text-xs text-slate-400">· Age {userAge}</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-violet-900 sm:text-4xl">
            Monster Tile Quest
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-slate-600 sm:text-base">
            Slide the tiles into the empty space and rebuild the monster picture!
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-6">
          <section className="rounded-3xl border-2 border-violet-200 bg-white/90 p-4 shadow-lg sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-black text-sky-800">
                  Moves: {moves}
                </span>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-black text-violet-800">
                  {gridSize}×{gridSize} Grid
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-800">
                  Image {getPuzzleImageIndex(selectedImage)}: {getPuzzleImageName(selectedImage)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {difficulty.previewToggle && (
                  <button
                    type="button"
                    onClick={() => setShowPreview((value) => !value)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    {showPreview ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    Preview
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetPuzzle}
                  disabled={completed}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-sm hover:bg-amber-100 disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restart Puzzle
                </button>
                <button
                  type="button"
                  onClick={startNewGame}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-100"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  New Random Image
                </button>
              </div>
            </div>

            <div
              className={`mx-auto grid aspect-square w-full max-w-md ${gapClass}`}
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {board.map((tileValue, boardIndex) => {
                const row = Math.floor(boardIndex / gridSize);
                const col = boardIndex % gridSize;
                const isEmpty = tileValue === emptyValue;

                if (isEmpty) {
                  return (
                    <div
                      key={`empty-${boardIndex}`}
                      className={`${tileRounded} border-2 border-dashed border-violet-200 bg-violet-50/60`}
                      style={{ gridRow: row + 1, gridColumn: col + 1 }}
                    />
                  );
                }

                const movable = !completed && canMoveTile(board, boardIndex, gridSize);

                return (
                  <motion.button
                    key={tileValue}
                    type="button"
                    layout
                    layoutId={`tile-${tileValue}`}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    onClick={() => handleTileClick(boardIndex)}
                    disabled={!movable}
                    className={`${tileRounded} relative aspect-square border-2 border-white shadow-md outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                      movable
                        ? 'cursor-pointer hover:brightness-105 active:scale-[0.98]'
                        : 'cursor-default'
                    }`}
                    style={{
                      gridRow: row + 1,
                      gridColumn: col + 1,
                      ...getTileBackgroundStyle(tileValue, gridSize, selectedImage),
                    }}
                    aria-label={`Move tile ${tileValue + 1}`}
                  />
                );
              })}
            </div>

            <p className="mt-4 text-center text-sm text-slate-500">
              Tap a tile next to the empty space to slide it.
            </p>
          </section>

          {(showPreview || !difficulty.previewToggle) && (
            <aside className="rounded-3xl border-2 border-amber-200 bg-white/90 p-4 shadow-lg sm:p-5">
              <h2 className="text-sm font-black uppercase tracking-wide text-amber-800">
                Picture Preview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Image {getPuzzleImageIndex(selectedImage)}: {getPuzzleImageName(selectedImage)}
              </p>
              <div className="mt-3 overflow-hidden rounded-2xl border-2 border-amber-100 shadow-inner">
                <img
                  src={selectedImage}
                  alt="Monster puzzle preview"
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="mt-4 rounded-2xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800">
                ⭐ 3 stars: {difficulty.starThresholds.three} moves or fewer
                <br />⭐ 2 stars: up to {difficulty.starThresholds.two} moves
                <br />⭐ 1 star: finish the puzzle!
              </div>
            </aside>
          )}
        </div>
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-violet-900/35 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.7, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              className="max-w-md rounded-3xl border-4 border-violet-300 bg-white p-8 text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="text-5xl"
              >
                🎉
              </motion.div>
              <h2 className="mt-3 text-2xl font-black text-violet-900">Picture Complete!</h2>
              <p className="mt-2 text-sm font-medium text-slate-600">
                You solved the monster tile puzzle in {moves} moves!
              </p>
              <div className="mx-auto mt-4 max-w-xs overflow-hidden rounded-2xl border-2 border-violet-100 shadow-inner">
                <img
                  src={selectedImage}
                  alt="Completed monster puzzle"
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="mt-5 flex justify-center gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-10 w-10 ${
                      index < earnedStars
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm font-bold text-amber-600">
                {earnedStars} Star{earnedStars === 1 ? '' : 's'} Earned!
              </p>
              <button
                type="button"
                onClick={finishGame}
                className="mt-6 rounded-2xl bg-violet-500 px-8 py-3 text-sm font-black text-white shadow-lg hover:bg-violet-400"
              >
                Back to Games
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
