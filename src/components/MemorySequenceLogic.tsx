import { useState, useEffect, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getRandomTheme } from './GameThemes';
import type { GameTheme } from './GameThemes';
import { ArrowLeft, Zap } from 'lucide-react';

interface MemorySequenceLogicProps {
  onBack: () => void;
}

type GamePhase = 'ready' | 'watching' | 'flipping' | 'recall' | 'feedback' | 'completed';

export default function MemorySequenceLogic({ onBack }: MemorySequenceLogicProps) {
  const { age, addStars, unlockAchievement } = usePlayer();

  // Difficulty settings based on age
  const getDifficultySettings = useCallback(() => {
    if (age <= 6) {
      return { itemCount: 3, displayTime: 10, buttonSize: 'xl', difficulty: 'Starter' };
    } else if (age <= 8) {
      return { itemCount: 5, displayTime: 7, buttonSize: 'lg', difficulty: 'Explorer' };
    } else {
      return { itemCount: 7, displayTime: 4, buttonSize: 'md', difficulty: 'Champion' };
    }
  }, [age]);

  const settings = getDifficultySettings();

  const [phase, setPhase] = useState<GamePhase>('ready');
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [theme, setTheme] = useState<GameTheme | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundStars, setRoundStars] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.displayTime);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Initialize game
  useEffect(() => {
    setTheme(getRandomTheme());
  }, []);

  // Timer for watching phase
  useEffect(() => {
    if (phase !== 'watching') return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('flipping');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Transition from flipping to recall
  useEffect(() => {
    if (phase !== 'flipping') return;

    const timer = setTimeout(() => {
      setPhase('recall');
    }, 600 + Math.max(sequence.length - 1, 0) * 100);

    return () => clearTimeout(timer);
  }, [phase, sequence.length]);

  // Auto-evaluate when user sequence is complete
  useEffect(() => {
    if (phase !== 'recall' || userSequence.length !== sequence.length || sequence.length === 0) return;

    const isMatch = userSequence.every((item, idx) => item === sequence[idx]);

    const timer = setTimeout(() => {
      setPhase('feedback');
      setIsCorrect(isMatch);

      if (isMatch) {
        const starReward = 10 * currentRound;
        setRoundStars(starReward);
        addStars(starReward);
        if (currentRound === 1) {
          unlockAchievement('first_play');
        }
        if (currentRound >= 5) {
          unlockAchievement('memory_master');
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSequence, sequence, phase, currentRound, addStars]);

  // Start new round
  const startRound = useCallback(() => {
    const selectedTheme = theme || getRandomTheme();
    setTheme(selectedTheme);

    const newItem = selectedTheme.items[Math.floor(Math.random() * selectedTheme.items.length)];
    const newSequence = [...sequence, newItem.id];
    setSequence(newSequence);
    setUserSequence([]);
    setPhase('watching');
    setTimeLeft(settings.displayTime);
    setIsCorrect(null);
  }, [sequence, settings.displayTime, theme]);

  // Handle skip timer button
  const handleSkipTimer = () => {
    setPhase('flipping');
  };

  // Handle answer selection
  const handleAnswerClick = (itemId: string) => {
    if (phase !== 'recall') return;
    setUserSequence((prev) => [...prev, itemId]);
  };

  // Get active theme items
  const activeItems = theme?.items.slice(0, settings.itemCount) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Dashboard</span>
        </button>
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Round</p>
          <p className="text-2xl font-black text-slate-800">{currentRound}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Stars</p>
          <p className="text-2xl font-black text-amber-500">{roundStars}</p>
        </div>
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 gap-8">

        {/* Phase: Ready */}
        {phase === 'ready' && (
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-3xl bg-sky-100 flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg">
              🧩
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Memory Sequence</h2>
            <p className="text-slate-600 mb-6">
              Watch the sequence appear, then click the items in the exact same order!
            </p>
            <div className="space-y-2 mb-8 text-sm text-slate-600">
              <p>
                <span className="font-bold text-sky-600">{settings.itemCount} items</span> to remember
              </p>
              <p>
                <span className="font-bold text-emerald-600">{settings.displayTime}s</span> to memorize
              </p>
              <p>
                Difficulty: <span className="font-bold text-orange-600">{settings.difficulty}</span>
              </p>
            </div>
            <button
              onClick={startRound}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-500 text-white font-black py-3 px-6 rounded-2xl hover:shadow-lg transition-all active:scale-95"
            >
              Start Game!
            </button>
          </div>
        )}

        {/* Phase: Watching */}
        {phase === 'watching' && (
          <div className="w-full max-w-2xl">
            {/* Countdown bar and skip button */}
            <div className="mb-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-blue-500 animate-countdown"
                      style={{ animation: `countdown-bar ${settings.displayTime}s linear forwards` }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSkipTimer}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-all active:scale-95 whitespace-nowrap"
                >
                  <Zap className="w-4 h-4" />
                  I'm Ready! 🚀
                </button>
              </div>
              <p className="text-center text-sm text-slate-500">
                {timeLeft}s left to memorize!
              </p>
            </div>

            {/* Grid of items */}
            <div
              className={`grid gap-4 mb-8 ${
                settings.itemCount === 3
                  ? 'grid-cols-3'
                  : settings.itemCount === 5
                    ? 'grid-cols-3 sm:grid-cols-5'
                    : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-7'
              }`}
            >
              {sequence.map((itemId, idx) => {
                const item = activeItems.find((i) => i.id === itemId);
                const delay = idx * 400;

                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-2xl bg-white border-2 border-sky-200 shadow-md flex items-center justify-center p-4 ${
                      settings.buttonSize === 'xl'
                        ? 'text-5xl'
                        : settings.buttonSize === 'lg'
                          ? 'text-4xl'
                          : 'text-3xl'
                    }`}
                    style={{
                      animation: `pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    {item?.icon}
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-slate-400">
              Look at the sequence carefully!
            </p>
          </div>
        )}

        {/* Phase: Flipping */}
        {phase === 'flipping' && (
          <div className="text-center">
            <p className="text-slate-600 mb-4">Hiding items...</p>
            <div
              className={`grid gap-4 ${
                settings.itemCount === 3
                  ? 'grid-cols-3'
                  : settings.itemCount === 5
                    ? 'grid-cols-3 sm:grid-cols-5'
                    : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-7'
              }`}
            >
              {sequence.map((itemId, idx) => {
                const item = activeItems.find((i) => i.id === itemId);

                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-2xl bg-white border-2 border-sky-200 shadow-md flex items-center justify-center p-4 animate-flip-down ${
                      settings.buttonSize === 'xl'
                        ? 'text-5xl'
                        : settings.buttonSize === 'lg'
                          ? 'text-4xl'
                          : 'text-3xl'
                    }`}
                    style={{
                      animation: `flip-down 0.4s ease-in forwards ${idx * 100}ms`,
                    }}
                  >
                    {item?.icon}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Phase: Recall */}
        {phase === 'recall' && (
          <div className="w-full max-w-3xl">
            {/* Your Answer section */}
            <div className="mb-8">
              <p className="text-center text-slate-700 font-bold mb-4">Your Answer:</p>
              <div className={`flex gap-2 mb-6 justify-center flex-wrap`}>
                {Array.from({ length: sequence.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square w-16 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50 flex items-center justify-center transition-all ${
                      idx < userSequence.length ? 'border-solid border-sky-500 bg-white' : ''
                    } ${
                      settings.buttonSize === 'xl'
                        ? 'w-20 text-4xl'
                        : settings.buttonSize === 'lg'
                          ? 'w-16 text-3xl'
                          : 'w-14 text-2xl'
                    }`}
                  >
                    {idx < userSequence.length &&
                      activeItems.find((item) => item.id === userSequence[idx])?.icon}
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-slate-500">
                {userSequence.length} of {sequence.length} selected
              </p>
            </div>

            {/* Selection grid - all unique items */}
            <div className="mb-4">
              <p className="text-center text-sm text-slate-600 mb-3 font-semibold">Click the items below:</p>
              <div
                className={`grid gap-3 ${
                  settings.itemCount === 3
                    ? 'grid-cols-3'
                    : settings.itemCount === 5
                      ? 'grid-cols-3 sm:grid-cols-5'
                      : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-7'
                }`}
              >
                {activeItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAnswerClick(item.id)}
                    disabled={phase !== 'recall'}
                    className={`aspect-square rounded-2xl border-2 shadow-md flex items-center justify-center p-3 transition-all ${
                      settings.buttonSize === 'xl'
                        ? 'text-5xl'
                        : settings.buttonSize === 'lg'
                          ? 'text-4xl'
                          : 'text-3xl'
                    } bg-white border-sky-200 hover:bg-sky-50 hover:border-sky-400 active:scale-95`}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase: Feedback */}
        {phase === 'feedback' && (
          <div className="text-center max-w-md">
            {isCorrect ? (
              <>
                <div className="mb-6">
                  <div className="text-6xl animate-pulse-scale mb-4">🎉</div>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <Confetti key={i} delay={i * 50} />
                  ))}
                </div>
                <h3 className="text-3xl font-black text-emerald-600 mb-2">Excellent!</h3>
                <p className="text-slate-600 mb-4">
                  You got it right and earned <span className="font-bold text-amber-500">{roundStars} stars</span>!
                </p>
                <button
                  onClick={() => {
                    setCurrentRound((r) => r + 1);
                    startRound();
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black py-3 px-6 rounded-2xl hover:shadow-lg transition-all active:scale-95"
                >
                  Next Challenge!
                </button>
              </>
            ) : (
              <>
                <div className="mb-6 animate-shake">
                  <div className="text-6xl">😔</div>
                </div>
                <h3 className="text-3xl font-black text-rose-600 mb-2">Oops!</h3>
                <p className="text-slate-600 mb-4">That wasn't quite right. Let's see the correct order:</p>

                {/* Show correct sequence */}
                <div className="mb-6 p-4 bg-sky-50 rounded-2xl border-2 border-sky-200">
                  <p className="text-xs text-slate-500 mb-2 uppercase font-bold">Correct sequence:</p>
                  <div className={`grid gap-2 ${settings.itemCount === 3 ? 'grid-cols-3' : settings.itemCount === 5 ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-4 sm:grid-cols-7'}`}>
                    {sequence.map((itemId, idx) => {
                      const item = activeItems.find((i) => i.id === itemId);
                      return (
                        <div key={`${itemId}-${idx}`} className="aspect-square rounded-lg bg-white border border-sky-300 flex items-center justify-center text-2xl">
                          {item?.icon}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUserSequence([]);
                    setPhase('recall');
                  }}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-500 text-white font-black py-3 px-6 rounded-2xl hover:shadow-lg transition-all active:scale-95 mb-3"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setPhase('ready');
                    setSequence([]);
                    setUserSequence([]);
                    setCurrentRound(1);
                    setRoundStars(0);
                  }}
                  className="w-full bg-slate-200 text-slate-700 font-black py-3 px-6 rounded-2xl hover:bg-slate-300 transition-all active:scale-95"
                >
                  Start Over
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Confetti({ delay }: { delay: number }) {
  const x = Math.random() * 100;
  const duration = 2 + Math.random() * 0.5;
  const emoji = ['🎉', '⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)];

  return (
    <div
      className="confetti-piece text-2xl"
      style={{
        left: `${x}%`,
        top: '-20px',
        animation: `confetti-fall ${duration}s linear forwards`,
        animationDelay: `${delay}ms`,
      }}
    >
      {emoji}
    </div>
  );
}
