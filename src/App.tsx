import { useState } from 'react';
import type { ComponentType } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import { games, type GameId, type GameRegistryItem } from './gameRegistry';

type View = 'dashboard' | GameId;

type GameComponent = ComponentType<{
  userAge: number;
  onGameComplete: (stars: number) => void;
}>;

interface ActiveGameProps {
  game: GameRegistryItem;
  onBack: () => void;
  userAge: number;
  onGameComplete: (stars: number) => void;
}

function ActiveGame({ game, onBack, userAge, onGameComplete }: ActiveGameProps) {
  const Game = game.component as GameComponent;

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="m-4 rounded-2xl bg-white px-4 py-2 font-black text-emerald-700 shadow hover:bg-emerald-50"
      >
        ← Back to Dashboard
      </button>

      <Game userAge={userAge} onGameComplete={onGameComplete} />
    </>
  );
}

function AppShell() {
  const [view, setView] = useState<View>('dashboard');
  const { age, addStars } = usePlayer();

  const activeGame =
    view === 'dashboard'
      ? undefined
      : games.find((game) => game.id === view && game.status === 'ready');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {view === 'dashboard' && <Dashboard onNavigate={(game) => setView(game)} />}

      {activeGame && (
        <ActiveGame
          game={activeGame}
          onBack={() => setView('dashboard')}
          userAge={age}
          onGameComplete={(stars) => {
            addStars(stars);
          }}
        />
      )}

      {view !== 'dashboard' && !activeGame && (
        <div className="mx-auto max-w-xl p-8 text-center">
          <h2 className="text-2xl font-black text-slate-800">Game unavailable</h2>
          <p className="mt-2 text-slate-500">
            This game is still being improved or has been temporarily hidden.
          </p>
          <button
            type="button"
            onClick={() => setView('dashboard')}
            className="mt-5 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-emerald-950 shadow hover:bg-emerald-300"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppShell />
    </PlayerProvider>
  );
}