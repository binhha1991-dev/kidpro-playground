import { useState } from 'react';
import type { ComponentType } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import { games, type GameId, type GameRegistryItem } from './gameRegistry';
import type { GameProps } from './gameProps';
import { t, type Lang } from './i18n';
import { getProgress, saveGameResult, type ProgressStore } from './rewards';

type View = 'dashboard' | GameId;

interface ActiveGameProps {
  game: GameRegistryItem;
  onBack: () => void;
  lang: Lang;
  userAge: number;
  onGameComplete: (stars: number) => void;
}

function ActiveGame({ game, onBack, lang, userAge, onGameComplete }: ActiveGameProps) {
  const Game = game.component as ComponentType<GameProps>;

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="m-4 rounded-2xl bg-white px-4 py-2 font-black text-emerald-700 shadow hover:bg-emerald-50"
      >
        ← {t(lang, 'back')}
      </button>

      <Game userAge={userAge} lang={lang} onGameComplete={onGameComplete} />
    </>
  );
}

function AppShell() {
  const [view, setView] = useState<View>('dashboard');
  const [lang, setLang] = useState<Lang>('en');
  const [progress, setProgress] = useState<ProgressStore>(() => getProgress());
  const { age, addStars } = usePlayer();

  const activeGame =
    view === 'dashboard'
      ? undefined
      : games.find((game) => game.id === view && game.status === 'ready');

  const handleGameComplete = (gameId: GameId, stars: number) => {
    addStars(stars);
    saveGameResult({ gameId, stars });
    setProgress(getProgress());
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} setLang={setLang} />

      {view === 'dashboard' && (
        <Dashboard
          lang={lang}
          progress={progress}
          onNavigate={(game) => setView(game)}
        />
      )}

      {activeGame && (
        <ActiveGame
          game={activeGame}
          lang={lang}
          onBack={() => setView('dashboard')}
          userAge={age}
          onGameComplete={(stars) => handleGameComplete(activeGame.id, stars)}
        />
      )}

      {view !== 'dashboard' && !activeGame && (
        <div className="mx-auto max-w-xl p-8 text-center">
          <h2 className="text-2xl font-black text-slate-800">{t(lang, 'gameUnavailable')}</h2>
          <p className="mt-2 text-slate-500">{t(lang, 'gameUnavailableHint')}</p>
          <button
            type="button"
            onClick={() => setView('dashboard')}
            className="mt-5 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-emerald-950 shadow hover:bg-emerald-300"
          >
            {t(lang, 'back')}
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
