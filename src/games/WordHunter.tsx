import { useEffect, useMemo, useRef, useState } from 'react';

type GameProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type Direction = { dr: number; dc: number };

type WordItem = {
  word: string;
  emoji: string;
};

type Cell = {
  row: number;
  col: number;
  letter: string;
  key: string;
};

type PlacedWord = WordItem & {
  cells: string[];
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const WORDS: WordItem[] = [
  { emoji: '🦖', word: 'TREX' },
  { emoji: '🦕', word: 'DINO' },
  { emoji: '🐊', word: 'LIZARD' },
  { emoji: '🥚', word: 'EGG' },
  { emoji: '🌳', word: 'TREE' },
  { emoji: '🌿', word: 'FERN' },
  { emoji: '🌋', word: 'VOLCANO' },
  { emoji: '🪨', word: 'ROCK' },
  { emoji: '🏞️', word: 'RIVER' },
  { emoji: '☀️', word: 'SUN' },
  { emoji: '🐦', word: 'BIRD' },
  { emoji: '🐟', word: 'FISH' },
  { emoji: '💚', word: 'GREEN' },
  { emoji: '📏', word: 'LONG' },
  { emoji: '🌲', word: 'TALL' },
  { emoji: '⚡', word: 'FAST' },
  { emoji: '🦴', word: 'BONES' },
  { emoji: '🌎', word: 'EARTH' },
];

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function keyOf(row: number, col: number) {
  return `${row}-${col}`;
}

function sameCells(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]) || a.every((v, i) => v === b[b.length - 1 - i]);
}

export default function WordHunter({ userAge, onGameComplete }: GameProps) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const doneRef = useRef(false);

  const config = useMemo(() => {
    if (userAge < 6) {
      return {
        size: 5,
        count: 3,
        cellSize: 'clamp(2.6rem, 12vw, 4.1rem)',
        directions: [
          { dr: 0, dc: 1 },
          { dr: 1, dc: 0 },
        ],
        showPictureHints: true,
        showHintWords: true,
        title: 'Find the hidden picture words!',
        instruction: 'Look at the pictures, then find the matching words in the letter board.',
      };
    }

    if (userAge <= 8) {
      return {
        size: 7,
        count: 5,
        cellSize: 'clamp(2rem, 8vw, 3rem)',
        directions: [
          { dr: 0, dc: 1 },
          { dr: 1, dc: 0 },
        ],
        showPictureHints: true,
        showHintWords: true,
        title: 'Word Hunter Challenge!',
        instruction: 'Use the picture clues around the board to find every hidden word.',
      };
    }

    return {
      size: 10,
      count: 7,
      cellSize: 'clamp(1.45rem, 5.5vw, 2.25rem)',
      directions: [
        { dr: 0, dc: 1 },
        { dr: 1, dc: 0 },
        { dr: 1, dc: 1 },
        { dr: -1, dc: 1 },
        { dr: 0, dc: -1 },
        { dr: -1, dc: 0 },
      ],
      showPictureHints: false,
      showHintWords: false,
      title: 'Expert Word Hunt!',
      instruction: 'No picture clues this time. Find all hidden words by scanning carefully.',
    };
  }, [userAge]);

  function generate() {
    const board = Array.from({ length: config.size }, () => Array(config.size).fill(''));

    const words = shuffle(WORDS)
      .filter((item) => item.word.length <= config.size)
      .slice(0, config.count);

    const placed: PlacedWord[] = [];

    function canPlace(word: string, row: number, col: number, direction: Direction) {
      for (let i = 0; i < word.length; i++) {
        const nextRow = row + direction.dr * i;
        const nextCol = col + direction.dc * i;

        if (
          nextRow < 0 ||
          nextCol < 0 ||
          nextRow >= config.size ||
          nextCol >= config.size
        ) {
          return false;
        }

        if (board[nextRow][nextCol] && board[nextRow][nextCol] !== word[i]) {
          return false;
        }
      }

      return true;
    }

    function place(item: WordItem) {
      for (let attempt = 0; attempt < 120; attempt++) {
        const direction = shuffle(config.directions)[0];
        const row = Math.floor(Math.random() * config.size);
        const col = Math.floor(Math.random() * config.size);

        if (!canPlace(item.word, row, col, direction)) continue;

        const cells: string[] = [];

        for (let i = 0; i < item.word.length; i++) {
          const nextRow = row + direction.dr * i;
          const nextCol = col + direction.dc * i;

          board[nextRow][nextCol] = item.word[i];
          cells.push(keyOf(nextRow, nextCol));
        }

        return { ...item, cells };
      }

      return null;
    }

    for (const word of words) {
      const placedWord = place(word);
      if (placedWord) placed.push(placedWord);
    }

    for (let row = 0; row < config.size; row++) {
      for (let col = 0; col < config.size; col++) {
        if (!board[row][col]) board[row][col] = randomLetter();
      }
    }

    const nextGrid = board.map((row, rowIndex) =>
      row.map((letter, colIndex) => ({
        row: rowIndex,
        col: colIndex,
        letter,
        key: keyOf(rowIndex, colIndex),
      }))
    );

    setGrid(nextGrid);
    setPlacedWords(placed);
    setFoundWords([]);
    setSelected([]);
    setMistakes(0);
    setFeedback('idle');
    doneRef.current = false;
  }

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  function start(key: string) {
    setSelected([key]);
    setIsDragging(true);
    setFeedback('idle');
  }

  function move(key: string) {
    if (!isDragging || selected.length === 0) return;

    const [startRow, startCol] = selected[0].split('-').map(Number);
    const [endRow, endCol] = key.split('-').map(Number);

    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    const isStraight =
      rowDiff === 0 ||
      colDiff === 0 ||
      Math.abs(rowDiff) === Math.abs(colDiff);

    if (!isStraight) return;

    const rowStep = Math.sign(rowDiff);
    const colStep = Math.sign(colDiff);
    const length = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

    const cells: string[] = [];

    for (let i = 0; i <= length; i++) {
      cells.push(keyOf(startRow + rowStep * i, startCol + colStep * i));
    }

    setSelected(cells);
  }

  function end() {
    if (!isDragging) return;

    setIsDragging(false);

    const match = placedWords.find(
      (word) => !foundWords.includes(word.word) && sameCells(selected, word.cells)
    );

    if (match) {
      const nextFoundWords = [...foundWords, match.word];
      setFoundWords(nextFoundWords);
      setFeedback('correct');

      if (nextFoundWords.length === placedWords.length && !doneRef.current) {
        doneRef.current = true;
        const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
        onGameComplete(stars);
      }
    } else if (selected.length > 1) {
      setMistakes((current) => current + 1);
      setFeedback('wrong');
    }

    setTimeout(() => setSelected([]), 400);
  }

  const foundSet = new Set(
    placedWords.flatMap((word) => (foundWords.includes(word.word) ? word.cells : []))
  );

  const selectedSet = new Set(selected);
  const remainingCount = placedWords.length - foundWords.length;

  return (
    <div
      className="min-h-[520px] rounded-3xl bg-gradient-to-br from-emerald-50 via-lime-50 to-yellow-50 p-4 text-slate-800 shadow-inner"
      onMouseUp={end}
      onMouseLeave={end}
      onTouchEnd={end}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-4 text-center">
          <h2 className="text-2xl font-black text-emerald-700">{config.title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">{config.instruction}</p>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">
          {config.showPictureHints && (
            <HintPanel
              title="Picture clues"
              words={placedWords.slice(0, Math.ceil(placedWords.length / 2))}
              foundWords={foundWords}
              showHintWords={config.showHintWords}
            />
          )}

          <main className="mx-auto rounded-[2rem] border-4 border-white bg-white/70 p-3 shadow-xl backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3 px-1 text-sm font-bold text-slate-600">
              <span>Found: {foundWords.length}/{placedWords.length}</span>
              <span>Mistakes: {mistakes}</span>
              <span>Left: {remainingCount}</span>
            </div>

            <div
              className="grid select-none gap-1 rounded-2xl bg-emerald-100 p-2"
              style={{
                gridTemplateColumns: `repeat(${config.size}, ${config.cellSize})`,
                touchAction: 'none',
              }}
            >
              {grid.flat().map((cell) => {
                const isSelected = selectedSet.has(cell.key);
                const isFound = foundSet.has(cell.key);

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onMouseDown={() => start(cell.key)}
                    onMouseEnter={() => move(cell.key)}
                    onTouchStart={() => start(cell.key)}
                    onTouchMove={(event) => {
                      const touch = event.touches[0];
                      const element = document.elementFromPoint(touch.clientX, touch.clientY);
                      const key = element?.getAttribute('data-cell-key');
                      if (key) move(key);
                    }}
                    data-cell-key={cell.key}
                    className={`aspect-square rounded-xl text-center text-base font-black shadow-sm transition ${
                      isFound
                        ? 'bg-emerald-300 text-emerald-900 ring-2 ring-emerald-500'
                        : isSelected
                          ? 'scale-105 bg-pink-300 text-pink-900 ring-2 ring-pink-500'
                          : 'bg-white text-slate-700 hover:bg-yellow-100'
                    }`}
                  >
                    {cell.letter}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 min-h-8 text-center text-base font-black">
              {feedback === 'correct' && <p className="text-emerald-600">Nice! 🎉</p>}
              {feedback === 'wrong' && <p className="text-rose-500">Try again!</p>}
              {feedback === 'idle' && <p className="text-slate-400">Drag across letters to select a word.</p>}
            </div>

            <div className="mt-3 text-center">
              <button
                onClick={generate}
                className="rounded-full bg-yellow-300 px-5 py-2 text-sm font-black text-yellow-900 shadow-md transition hover:scale-105 hover:bg-yellow-400"
              >
                New Puzzle
              </button>
            </div>
          </main>

          {config.showPictureHints && (
            <HintPanel
              title="Find these"
              words={placedWords.slice(Math.ceil(placedWords.length / 2))}
              foundWords={foundWords}
              showHintWords={config.showHintWords}
            />
          )}

          {!config.showPictureHints && (
            <aside className="rounded-3xl border-4 border-white bg-white/70 p-4 text-center shadow-xl lg:col-span-1">
              <div className="text-4xl">🧠</div>
              <h3 className="mt-2 text-lg font-black text-purple-700">No clues!</h3>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                Scan rows, columns, diagonals, and backwards words.
              </p>
              <div className="mt-4 rounded-2xl bg-purple-100 p-3 text-sm font-black text-purple-700">
                Hidden words: {placedWords.length}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

type HintPanelProps = {
  title: string;
  words: PlacedWord[];
  foundWords: string[];
  showHintWords: boolean;
};

function HintPanel({ title, words, foundWords, showHintWords }: HintPanelProps) {
  if (words.length === 0) return <div />;

  return (
    <aside className="rounded-3xl border-4 border-white bg-white/75 p-4 shadow-xl backdrop-blur">
      <h3 className="mb-3 text-center text-lg font-black text-emerald-700">{title}</h3>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {words.map((word) => {
          const isFound = foundWords.includes(word.word);

          return (
            <div
              key={word.word}
              className={`rounded-2xl p-3 text-center shadow transition ${
                isFound
                  ? 'bg-emerald-100 opacity-50'
                  : 'bg-yellow-100 hover:scale-105 hover:bg-yellow-200'
              }`}
            >
              <div className="text-4xl drop-shadow-sm">{word.emoji}</div>

              {showHintWords && (
                <div
                  className={`mt-1 text-sm font-black tracking-wide ${
                    isFound ? 'line-through text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  {word.word}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
