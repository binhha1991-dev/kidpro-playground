import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Achievement {
  id: string;
  label: string;
  icon: string;
  earned: boolean;
}

interface PlayerState {
  age: number;
  totalStars: number;
  achievements: Achievement[];
  setAge: (age: number) => void;
  addStars: (count: number) => void;
  unlockAchievement: (id: string) => void;
}

const defaultAchievements: Achievement[] = [
  { id: 'first_play', label: 'First Play', icon: '🎮', earned: false },
  { id: 'star_collector', label: 'Star Collector', icon: '⭐', earned: false },
  { id: 'memory_master', label: 'Memory Master', icon: '🧠', earned: false },
  { id: 'word_wizard', label: 'Word Wizard', icon: '📖', earned: false },
  { id: 'math_hero', label: 'Math Hero', icon: '🔢', earned: false },
];

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [age, setAge] = useState(8);
  const [totalStars, setTotalStars] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);

  function addStars(count: number) {
    setTotalStars((prev) => prev + count);
  }

  function unlockAchievement(id: string) {
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, earned: true } : a))
    );
  }

  return (
    <PlayerContext.Provider value={{ age, totalStars, achievements, setAge, addStars, unlockAchievement }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
