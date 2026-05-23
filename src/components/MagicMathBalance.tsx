import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import { ArrowLeft, Trash2 } from 'lucide-react';

import {
  BUNDLES,
  BasketSVG,
  SeesawScale,
  BundleVisual,
} from './BalanceGameAssets';

import type { AssetTheme } from './BalanceGameAssets';

interface MagicMathBalanceProps {
  onBack: () => void;
}

type GameMode = 'counting' | 'addition' | 'logic';
type GamePhase = 'setup' | 'playing' | 'feedback';

interface BundleEntry {
  id: string;
  bundleId: string;
  weight: number;
}

interface GameState {
  leftBundles: BundleEntry[];
  rightBundles: BundleEntry[];
  targetWeight: number;
  mode: GameMode;
  phase: GamePhase;
  isBalanced: boolean;
  roundStars: number;
}

interface Particle {
  id: string;
  text: string;
  x: number;
  y: number;
}

export default function MagicMathBalance({ onBack }: MagicMathBalanceProps) {
  const { age, addStars, unlockAchievement } = usePlayer();

  const getGameMode = useCallback((): GameMode => {
    if (age <= 5) return 'counting';
    if (age <= 8) return 'addition';
    return 'logic';
  }, [age]);

  const selectedTheme = useMemo((): AssetTheme => {
    const themes: AssetTheme[] = ['fruits', 'animals', 'gemstones'];
    return themes[Math.floor(Math.random() * themes.length)];
  }, []);

  const [gameState, setGameState] = useState<GameState>({
    leftBundles: [],
    rightBundles: [],
    targetWeight: 0,
    mode: 'counting',
    phase: 'setup',
    isBalanced: false,
    roundStars: 0,
  });

  const [currentRound, setCurrentRound] = useState(1);
  const [totalStars, setTotalStars] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [, setStuckTimer] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize game
  useEffect(() => {
    setGameState((prev) => ({ ...prev, mode: getGameMode() }));
    generateNewRound();
  }, []);

  // Stuck timer for hints
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    const timer = setInterval(() => {
      setStuckTimer((t) => {
        if (t >= 15) {
          setShowHint(true);
          return t;
        }
        return t + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.phase]);

  const generateBundlesForWeight = (weight: number): BundleEntry[] => {
    const bundles: BundleEntry[] = [];
    let remaining = weight;

    // Greedy approach: use biggest bundles first
    while (remaining >= 10) {
      bundles.push({ id: `bundle-${Date.now()}-${Math.random()}`, bundleId: 'box', weight: 10 });
      remaining -= 10;
    }
    while (remaining >= 5) {
      bundles.push({ id: `bundle-${Date.now()}-${Math.random()}`, bundleId: 'bag', weight: 5 });
      remaining -= 5;
    }
    while (remaining >= 1) {
      bundles.push({ id: `bundle-${Date.now()}-${Math.random()}`, bundleId: 'single', weight: 1 });
      remaining -= 1;
    }

    return bundles;
  };

  const generateNewRound = useCallback(() => {
    const mode = getGameMode();

    if (mode === 'counting') {
      const count = Math.floor(Math.random() * 5) + 1;
      const leftBundles = generateBundlesForWeight(count);

      setGameState((prev) => ({
        ...prev,
        leftBundles,
        rightBundles: [],
        targetWeight: count,
        mode: 'counting',
        phase: 'playing',
        isBalanced: false,
      }));
    } else if (mode === 'addition') {
      const total = Math.floor(Math.random() * 16) + 5;
      const leftCount = Math.floor(Math.random() * (total - 1)) + 1;
      const rightCount = Math.floor(Math.random() * Math.min(leftCount, 3)) + 1;

      const leftBundles = generateBundlesForWeight(leftCount);
      const rightBundles = generateBundlesForWeight(rightCount);

      setGameState((prev) => ({
        ...prev,
        leftBundles,
        rightBundles,
        targetWeight: total,
        mode: 'addition',
        phase: 'playing',
        isBalanced: false,
      }));
    } else {
      const target = Math.floor(Math.random() * 41) + 10;
      const leftBundles = generateBundlesForWeight(target);

      setGameState((prev) => ({
        ...prev,
        leftBundles,
        rightBundles: [],
        targetWeight: target,
        mode: 'logic',
        phase: 'playing',
        isBalanced: false,
      }));
    }

    setStuckTimer(0);
    setShowHint(false);
  }, [getGameMode]);

  const getLeftWeight = () => gameState.leftBundles.reduce((sum, b) => sum + b.weight, 0);
  const getRightWeight = () => gameState.rightBundles.reduce((sum, b) => sum + b.weight, 0);

  const getTilt = () => {
    const leftW = getLeftWeight();
    const rightW = getRightWeight();
    const diff = leftW - rightW;
    const maxTilt = 25;
    return Math.max(-maxTilt, Math.min(maxTilt, diff * 1.5));
  };

  const isBalanced = getLeftWeight() === getRightWeight() && getRightWeight() > 0;

  useEffect(() => {
    if (!isBalanced || gameState.phase !== 'playing') return;

    setTimeout(() => {
      const starReward = 10 * currentRound;
      setGameState((prev) => ({ ...prev, phase: 'feedback', isBalanced: true, roundStars: starReward }));
      setTotalStars((prev) => prev + starReward);
      addStars(starReward);

      if (currentRound === 1) {
        unlockAchievement('first_play');
      }
    }, 500);
  }, [isBalanced, gameState.phase, currentRound, addStars]);

  const handleAddBundle = (multiplier: number) => {
    if (gameState.phase !== 'playing') return;

    const bundleId = BUNDLES.find((b) => b.multiplier === multiplier)?.id || 'single';

    emitParticle('+ ' + multiplier, window.innerWidth / 2, window.innerHeight / 2);

    setGameState((prev) => ({
      ...prev,
      rightBundles: [
        ...prev.rightBundles,
        { id: `bundle-${Date.now()}-${Math.random()}`, bundleId, weight: multiplier },
      ],
    }));

    setStuckTimer(0);
  };

  const handleRemoveFromRight = (index: number) => {
    setGameState((prev) => ({
      ...prev,
      rightBundles: prev.rightBundles.filter((_, i) => i !== index),
    }));
  };

  const emitParticle = (text: string, x: number, y: number) => {
    const id = `particle-${Date.now()}-${Math.random()}`;
    setParticles((prev) => [...prev, { id, text, x, y }]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1500);
  };

  const handleNextRound = () => {
    setCurrentRound((r) => r + 1);
    generateNewRound();
  };

  const tilt = getTilt();
  const leftW = getLeftWeight();
  const rightW = getRightWeight();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-emerald-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Dashboard</span>
        </button>
        <div className="text-center">
          <p className="text-xs text-emerald-600 uppercase tracking-wider">Round</p>
          <p className="text-2xl font-black text-emerald-900">{currentRound}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-emerald-600 uppercase tracking-wider">Stars</p>
          <p className="text-2xl font-black text-amber-500">{totalStars}</p>
        </div>
      </div>

      {/* Particles layer */}
      <div className="fixed inset-0 pointer-events-none">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 1, y: 0, x: 0 }}
              animate={{ opacity: 0, y: -80, x: (Math.random() - 0.5) * 40 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="fixed text-xl font-bold text-emerald-600"
              style={{ left: particle.x, top: particle.y }}
            >
              {particle.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 gap-6">
        {/* Mode info */}
        <div className="text-center">
          <p className="text-sm text-emerald-600 font-bold uppercase">
            {gameState.mode === 'counting' && 'Counting Mode'}
            {gameState.mode === 'addition' && 'Addition Mode'}
            {gameState.mode === 'logic' && 'Logic Mode'}
          </p>
          <p className="text-xs text-emerald-500 mt-1">
            Theme: {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}
          </p>
        </div>

        {/* Scale with baskets */}
        {gameState.phase === 'playing' && (
          <motion.div
            className="w-full max-w-4xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <div className="relative h-72 flex items-center justify-center">
              {/* Scale SVG with physics */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: tilt }}
                transition={{ type: 'spring', stiffness: 80, damping: 12 }}
              >
                <SeesawScale tilt={0} />
              </motion.div>

              {/* Left basket with bundles */}
              <motion.div
                className="absolute left-4 top-1/4 w-40 h-32 flex flex-col items-center"
                animate={{ y: tilt > 0 ? 8 : -8 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10 }}
              >
                <div className="w-32 h-28 relative">
                  <BasketSVG side="left" />
                  <div className="absolute inset-0 flex flex-wrap content-start overflow-hidden p-2 gap-1 justify-center">
                    {gameState.leftBundles.slice(0, 12).map((bundle) => {
                      const bundleObj = BUNDLES.find((b) => b.id === bundle.bundleId);
                      return bundleObj ? (
                        <motion.div
                          key={bundle.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 0.7, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                          className="scale-75"
                        >
                          <BundleVisual bundle={bundleObj} />
                        </motion.div>
                      ) : null;
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Right basket with bundles */}
              <motion.div
                className="absolute right-4 top-1/4 w-40 h-32 flex flex-col items-center"
                animate={{ y: tilt < 0 ? 8 : -8 }}
                transition={{ type: 'spring', stiffness: 100, damping: 10 }}
              >
                <div className="w-32 h-28 relative">
                  <BasketSVG side="right" />
                  <div className="absolute inset-0 flex flex-wrap content-start overflow-hidden p-2 gap-1 justify-center">
                    {gameState.rightBundles.slice(0, 12).map((bundle) => {
                      const bundleObj = BUNDLES.find((b) => b.id === bundle.bundleId);
                      return bundleObj ? (
                        <motion.div
                          key={bundle.id}
                          initial={{ scale: 0, opacity: 0, y: -20 }}
                          animate={{ scale: 0.7, opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                          className="scale-75 cursor-pointer"
                          onClick={() => handleRemoveFromRight(gameState.rightBundles.indexOf(bundle))}
                        >
                          <BundleVisual bundle={bundleObj} />
                        </motion.div>
                      ) : null;
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Balance indicator */}
              {isBalanced && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{ x: [0, -4, 4, -4, 4, 0], rotate: [0, 2, -2, 2, -2, 0] }}
                    transition={{ duration: 0.6, repeat: 3 }}
                    className="text-6xl"
                  >
                    ✨
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Weight display */}
            <div className="flex justify-between items-center mt-4 px-8">
              <div className="text-center">
                <motion.p className="text-3xl font-black text-emerald-700">{leftW}</motion.p>
                <p className="text-xs text-emerald-600 uppercase font-bold">Left</p>
              </div>
              <motion.div
                animate={{
                  scale: isBalanced ? [1, 1.2, 1] : 1,
                  color: isBalanced ? ['#059669', '#fbbf24', '#059669'] : '#078d50',
                }}
                transition={{ duration: 0.6, repeat: isBalanced ? 2 : 0 }}
                className="text-xl font-bold"
              >
                vs
              </motion.div>
              <div className="text-center">
                <motion.p className="text-3xl font-black text-emerald-700">{rightW}</motion.p>
                <p className="text-xs text-emerald-600 uppercase font-bold">Right</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Game controls */}
        {gameState.phase === 'playing' && (
          <motion.div className="w-full max-w-2xl space-y-4">
            <div className="bg-white rounded-2xl p-4 border-2 border-emerald-200">
              <p className="text-center text-slate-700 font-bold mb-2">
                {gameState.mode === 'counting' && 'Add the same number to balance!'}
                {gameState.mode === 'addition' && 'Add items to make both sides equal!'}
                {gameState.mode === 'logic' && 'Combine bundles to balance the scale!'}
              </p>
              <p className="text-center text-sm text-slate-500">
                Right side: {rightW} {gameState.mode === 'addition' ? `/ Target: ${gameState.targetWeight}` : ''}
              </p>

              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <p className="text-xs text-yellow-800 text-center font-bold">
                    💡 Hint: You need {gameState.targetWeight - rightW} more weight on the right!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Bundle selection */}
            <div className="bg-white rounded-2xl p-4 border-2 border-emerald-200">
              <p className="text-center text-sm font-bold text-slate-700 mb-3">Click bundles to add weight:</p>
              <div className="flex gap-3 justify-center flex-wrap">
                {BUNDLES.map((bundle) => (
                  <motion.button
                    key={bundle.id}
                    onClick={() => handleAddBundle(bundle.multiplier)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="transition-transform"
                  >
                    <BundleVisual bundle={bundle} />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => setGameState((prev) => ({ ...prev, rightBundles: [] }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Right
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Feedback phase */}
        {gameState.phase === 'feedback' && gameState.isBalanced && (
          <motion.div
            className="text-center max-w-md space-y-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.1, 0.95, 1.1, 0.95, 1] }}
              transition={{ duration: 0.8, repeat: 2 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <h3 className="text-3xl font-black text-emerald-600">Perfectly Balanced!</h3>
            <p className="text-slate-600">
              You earned <span className="font-bold text-amber-500">{gameState.roundStars} stars</span>!
            </p>
            <motion.button
              onClick={handleNextRound}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black py-3 px-6 rounded-2xl hover:shadow-lg transition-all"
            >
              Next Challenge!
            </motion.button>
            <motion.button
              onClick={() => {
                setCurrentRound(1);
                setTotalStars(0);
                generateNewRound();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-slate-200 text-slate-700 font-black py-3 px-6 rounded-2xl hover:bg-slate-300 transition-all"
            >
              Start Over
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
