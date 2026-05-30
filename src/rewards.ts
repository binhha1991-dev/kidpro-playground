const STORAGE_KEY = 'kidpro_progress_v1';

export type GameProgressEntry = {
  bestStars: number;
  lastStars: number;
  completedAt: string;
};

export type ProgressStore = Record<string, GameProgressEntry>;

function isGameProgressEntry(value: unknown): value is GameProgressEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.bestStars === 'number' &&
    typeof entry.lastStars === 'number' &&
    typeof entry.completedAt === 'string'
  );
}

export function getProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const store: ProgressStore = {};
    for (const [gameId, entry] of Object.entries(parsed)) {
      if (isGameProgressEntry(entry)) {
        store[gameId] = entry;
      }
    }
    return store;
  } catch {
    return {};
  }
}

export function saveGameResult({
  gameId,
  stars,
}: {
  gameId: string;
  stars: number;
}): void {
  const progress = getProgress();
  const existing = progress[gameId];
  const bestStars = Math.max(existing?.bestStars ?? 0, stars);

  progress[gameId] = {
    bestStars,
    lastStars: stars,
    completedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getBestStars(gameId: string): number {
  return getProgress()[gameId]?.bestStars ?? 0;
}
