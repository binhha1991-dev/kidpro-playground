import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  Bug,
  FileText,
  Image,
  Mail,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Skull,
  Sparkles,
  Zap,
} from 'lucide-react';

type GameProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type EntityKind = 'safe' | 'virus' | 'shield';
type SafeIcon = 'file' | 'image' | 'mail';
type VirusIcon = 'skull' | 'zap' | 'bug';

type Entity = {
  id: string;
  kind: EntityKind;
  icon: SafeIcon | VirusIcon | 'shield';
  lane: number;
  speed: number;
  hiddenVirus: boolean;
  suspicious: boolean;
};

type Burst = {
  id: string;
  lane: number;
  text: string;
  color: string;
};

const LANES = 5;

function makeId() {
  return Math.random().toString(36).slice(2);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function SafeDataIcon({ icon }: { icon: SafeIcon }) {
  if (icon === 'file') return <FileText size={34} strokeWidth={2.8} />;
  if (icon === 'image') return <Image size={34} strokeWidth={2.8} />;
  return <Mail size={34} strokeWidth={2.8} />;
}

function VirusIconView({ icon }: { icon: VirusIcon }) {
  if (icon === 'skull') return <Skull size={34} strokeWidth={2.8} />;
  if (icon === 'zap') return <Zap size={34} strokeWidth={2.8} />;
  return <Bug size={34} strokeWidth={2.8} />;
}

export default function CyberFirewallPro({ userAge, onGameComplete }: GameProps) {
  const completedRef = useRef(false);
  const spawnTimerRef = useRef<number | null>(null);
  const shieldTimerRef = useRef<number | null>(null);

  const config = useMemo(() => {
    if (userAge < 6) {
      return {
        title: 'Tiny Firewall Guard',
        waveSize: 15,
        speedMin: 4.8,
        speedMax: 5.6,
        virusRate: 0.28,
        shieldRate: 0.14,
        hiddenVirusRate: 0,
        gateHeight: 3,
        spawnGap: 1200,
        allowPause: true,
      };
    }

    if (userAge <= 8) {
      return {
        title: 'System Defender',
        waveSize: 18,
        speedMin: 3.6,
        speedMax: 4.5,
        virusRate: 0.42,
        shieldRate: 0.1,
        hiddenVirusRate: 0.08,
        gateHeight: 2,
        spawnGap: 900,
        allowPause: true,
      };
    }

    return {
      title: 'Cyber Firewall PRO',
      waveSize: 22,
      speedMin: 2.6,
      speedMax: 3.35,
      virusRate: 0.5,
      shieldRate: 0.08,
      hiddenVirusRate: 0.3,
      gateHeight: 1,
      spawnGap: 640,
      allowPause: true,
    };
  }, [userAge]);

  const [entities, setEntities] = useState<Entity[]>([]);
  const [gateLane, setGateLane] = useState(2);
  const [spawned, setSpawned] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [safePassed, setSafePassed] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [health, setHealth] = useState(100);
  const [shieldActive, setShieldActive] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [message, setMessage] = useState('Move the shield to block viruses. Let safe data pass.');
  const [completed, setCompleted] = useState(false);

  const laneHeight = 100 / LANES;

  function resetGame() {
    if (spawnTimerRef.current) window.clearTimeout(spawnTimerRef.current);
    if (shieldTimerRef.current) window.clearTimeout(shieldTimerRef.current);

    setEntities([]);
    setGateLane(2);
    setSpawned(0);
    setProcessed(0);
    setSafePassed(0);
    setBlocked(0);
    setCombo(0);
    setBestCombo(0);
    setHealth(100);
    setShieldActive(false);
    setSlowMode(false);
    setPaused(false);
    setBursts([]);
    setMessage('Move the shield to block viruses. Let safe data pass.');
    setCompleted(false);
    completedRef.current = false;
  }

  useEffect(() => {
    resetGame();

    return () => {
      if (spawnTimerRef.current) window.clearTimeout(spawnTimerRef.current);
      if (shieldTimerRef.current) window.clearTimeout(shieldTimerRef.current);
    };
  }, [userAge]);

  function createEntity(index: number): Entity {
    const shieldRoll = Math.random() < config.shieldRate;
    const virusRoll = Math.random() < config.virusRate;
    const lane = randomInt(0, LANES - 1);
    const baseSpeed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
    const speed = slowMode ? baseSpeed * 1.35 : baseSpeed;

    if (shieldRoll) {
      return {
        id: makeId(),
        kind: 'shield',
        icon: 'shield',
        lane,
        speed,
        hiddenVirus: false,
        suspicious: false,
      };
    }

    if (virusRoll) {
      const patternSuspicious = userAge >= 9 && (lane === 2 || index % 5 === 0);
      const hiddenVirus = userAge >= 9 && Math.random() < config.hiddenVirusRate;
      const suspicious = hiddenVirus || patternSuspicious;

      return {
        id: makeId(),
        kind: 'virus',
        icon: hiddenVirus
          ? randomItem(['file', 'image', 'mail'] as SafeIcon[])
          : randomItem(['skull', 'zap', 'bug'] as VirusIcon[]),
        lane,
        speed,
        hiddenVirus,
        suspicious,
      };
    }

    return {
      id: makeId(),
      kind: 'safe',
      icon: randomItem(['file', 'image', 'mail'] as SafeIcon[]),
      lane,
      speed,
      hiddenVirus: false,
      suspicious: false,
    };
  }

  useEffect(() => {
    if (completed || paused || spawned >= config.waveSize) return;

    spawnTimerRef.current = window.setTimeout(() => {
      setEntities((current) => [...current, createEntity(spawned)]);
      setSpawned((current) => current + 1);
    }, config.spawnGap);

    return () => {
      if (spawnTimerRef.current) window.clearTimeout(spawnTimerRef.current);
    };
  }, [spawned, completed, paused, slowMode, config.waveSize, config.spawnGap]);

  function gateCoversLane(lane: number) {
    const half = Math.floor(config.gateHeight / 2);

    if (config.gateHeight === 1) return lane === gateLane;
    if (config.gateHeight === 2) return lane === gateLane || lane === gateLane + 1;

    return lane >= gateLane - half && lane <= gateLane + half;
  }

  function addBurst(lane: number, text: string, color: string) {
    const burst = { id: makeId(), lane, text, color };
    setBursts((current) => [...current, burst]);

    window.setTimeout(() => {
      setBursts((current) => current.filter((item) => item.id !== burst.id));
    }, 850);
  }

  function addCombo(amount = 1) {
    setCombo((current) => {
      const next = current + amount;
      setBestCombo((best) => Math.max(best, next));
      return next;
    });
  }

  function breakCombo() {
    setCombo(0);
  }

  function activateShield() {
    setShieldActive(true);
    setMessage('Shield power-up active! System protected for 5 seconds.');

    if (shieldTimerRef.current) window.clearTimeout(shieldTimerRef.current);

    shieldTimerRef.current = window.setTimeout(() => {
      setShieldActive(false);
      setMessage('Shield faded. Keep guarding!');
    }, 5000);
  }

  function resolveEntity(entity: Entity) {
    if (completed || paused) return;

    const hitGate = gateCoversLane(entity.lane);

    setEntities((current) => current.filter((item) => item.id !== entity.id));
    setProcessed((current) => current + 1);

    if (entity.kind === 'shield') {
      if (hitGate) {
        activateShield();
        addCombo(1);
        addBurst(entity.lane, 'SHIELD!', 'text-cyan-200');
      } else {
        addBurst(entity.lane, 'miss', 'text-slate-400');
      }

      return;
    }

    if (entity.kind === 'safe') {
      if (hitGate) {
        breakCombo();
        setMessage('Safe data hit the shield. Move away and let safe data pass.');
        addBurst(entity.lane, 'BLOCKED', 'text-yellow-300');
      } else {
        setSafePassed((current) => current + 1);
        addCombo(1);
        setMessage('Safe data passed through safely!');
        addBurst(entity.lane, '+DATA', 'text-emerald-300');
      }

      return;
    }

    if (entity.kind === 'virus') {
      if (hitGate) {
        setBlocked((current) => current + 1);
        addCombo(entity.hiddenVirus ? 2 : 1);
        setMessage(
          entity.hiddenVirus ? 'Hidden virus detected and blocked!' : 'Virus blocked by firewall!'
        );
        addBurst(entity.lane, entity.hiddenVirus ? 'DETECTED!' : 'BLOCK!', 'text-pink-300');
      } else if (shieldActive) {
        setBlocked((current) => current + 1);
        addCombo(1);
        setMessage('Shield stopped a virus leak!');
        addBurst(entity.lane, 'SHIELD BLOCK', 'text-cyan-200');
      } else {
        breakCombo();
        setHealth((current) => Math.max(0, current - (userAge >= 9 ? 18 : 15)));
        setMessage('Virus entered! System integrity dropped.');
        addBurst(entity.lane, 'DAMAGE!', 'text-red-400');
      }
    }
  }

  useEffect(() => {
    if (completedRef.current) return;

    const waveDone = spawned >= config.waveSize && processed >= config.waveSize;
    const systemDown = health <= 0;

    if (waveDone || systemDown) {
      completedRef.current = true;
      setCompleted(true);
      setPaused(false);

      const stars =
        health >= 85 && safePassed >= Math.floor(config.waveSize * 0.42) && bestCombo >= 5
          ? 3
          : health >= 55
            ? 2
            : 1;

      setMessage(
        systemDown
          ? 'System survived, but needs repairs!'
          : 'Wave complete! Firewall mission finished!'
      );
      onGameComplete(stars);
    }
  }, [spawned, processed, health, safePassed, bestCombo, config.waveSize, onGameComplete]);

  function moveGateToLane(lane: number) {
    const maxLane = config.gateHeight === 2 ? LANES - 2 : LANES - 1;
    setGateLane(Math.max(0, Math.min(maxLane, lane)));
  }

  function moveGateUp() {
    moveGateToLane(gateLane - 1);
  }

  function moveGateDown() {
    moveGateToLane(gateLane + 1);
  }

  const maxGateLane = config.gateHeight === 2 ? LANES - 2 : LANES - 1;
  const gateTop = gateLane * laneHeight;
  const progress = Math.min(100, (processed / config.waveSize) * 100);

  return (
    <div className="min-h-[720px] w-full rounded-3xl bg-slate-900 p-4 text-white shadow-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header
          className="rounded-3xl border border-cyan-300/20 bg-slate-950 p-4 text-center shadow-[0_0_32px_rgba(34,211,238,0.16)]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Cyber Firewall PRO
          </p>
          <h2 className="mt-1 text-2xl font-black">{config.title}</h2>
          <p className="mt-1 font-semibold text-slate-300">{message}</p>
        </header>

        <main className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <section className="relative h-[540px] overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950 shadow-[inset_0_0_45px_rgba(34,211,238,0.1)]">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px)',
                backgroundSize: '38px 38px',
              }}
            />

            {Array.from({ length: LANES }).map((_, lane) => {
              const isCovered = gateCoversLane(lane);

              return (
                <button
                  key={lane}
                  type="button"
                  onClick={() => moveGateToLane(lane)}
                  className={`absolute left-0 right-0 z-10 border-b border-cyan-300/10 transition ${
                    isCovered ? 'bg-cyan-300/10' : 'hover:bg-cyan-300/5'
                  }`}
                  style={{
                    top: `${lane * laneHeight}%`,
                    height: `${laneHeight}%`,
                  }}
                  aria-label={`Move shield to lane ${lane + 1}`}
                />
              );
            })}

            <div className="absolute bottom-4 left-4 right-4 z-30">
              <div className="mb-1 flex justify-between text-xs font-bold uppercase tracking-wide text-slate-400">
                <span>Wave Progress</span>
                <span>
                  {processed}/{config.waveSize}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  className="h-full rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="absolute bottom-0 left-1/2 top-0 z-20 w-1 -translate-x-1/2 bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,1)]" />

            <motion.div
              className="absolute left-1/2 z-30 w-8 -translate-x-1/2 rounded-full border-2 border-cyan-100 bg-cyan-300 shadow-[0_0_28px_rgba(34,211,238,1)]"
              style={{
                top: `${gateTop + 2}%`,
                height: `${laneHeight * config.gateHeight - 4}%`,
              }}
            >
              <div className="flex h-full items-center justify-center">
                <Shield size={24} className="text-slate-950" />
              </div>
            </motion.div>

            {shieldActive && (
              <motion.div
                className="absolute bottom-0 left-1/2 top-0 z-20 w-24 -translate-x-1/2 rounded-full bg-cyan-300/15"
                animate={{ opacity: [0.25, 0.65, 0.25] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
            )}

            {paused && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 text-4xl font-black text-cyan-200 backdrop-blur-sm">
                PAUSED
              </div>
            )}

            <AnimatePresence>
              {entities.map((entity) => {
                const isHiddenVirus = entity.hiddenVirus;
                const displaySafe =
                  entity.kind === 'safe' ||
                  entity.kind === 'shield' ||
                  (entity.kind === 'virus' && isHiddenVirus);

                return (
                  <motion.div
                    key={entity.id}
                    className={`absolute z-20 flex h-16 w-16 items-center justify-center rounded-2xl border ${
                      entity.kind === 'shield'
                        ? 'border-cyan-200 bg-cyan-300/20 text-cyan-200'
                        : displaySafe
                          ? 'border-emerald-300/50 bg-emerald-300/15 text-emerald-200'
                          : 'border-red-400/60 bg-red-500/15 text-red-300'
                    }`}
                    initial={{
                      left: '-8%',
                      top: `${entity.lane * laneHeight + laneHeight / 2}%`,
                      opacity: 1,
                      scale: userAge < 6 ? 1.15 : 1,
                    }}
                    animate={
                      paused
                        ? {}
                        : {
                            left: '108%',
                            opacity: 1,
                            scale:
                              isHiddenVirus && userAge >= 9
                                ? [1, 1, 1.18, 1.18]
                                : userAge < 6
                                  ? 1.15
                                  : 1,
                          }
                    }
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{
                      left: { duration: entity.speed, ease: 'linear' },
                      scale: {
                        duration: entity.speed,
                        times: [0, 0.62, 0.72, 1],
                      },
                    }}
                    style={{
                      transform: 'translate(-50%, -50%)',
                      boxShadow:
                        entity.kind === 'shield'
                          ? '0 0 22px rgba(34,211,238,0.8)'
                          : displaySafe
                            ? '0 0 20px rgba(52,211,153,0.55)'
                            : '0 0 20px rgba(248,113,113,0.65)',
                    }}
                    onAnimationComplete={() => resolveEntity(entity)}
                  >
                    {entity.suspicious && (
                      <motion.div
                        className="absolute -inset-2 rounded-3xl border-2 border-yellow-300"
                        animate={{ opacity: [0.15, 0.85, 0.15] }}
                        transition={{ duration: 0.65, repeat: Infinity }}
                      />
                    )}

                    {entity.kind === 'shield' ? (
                      <Shield size={36} strokeWidth={2.8} />
                    ) : entity.kind === 'virus' && !isHiddenVirus ? (
                      <VirusIconView icon={entity.icon as VirusIcon} />
                    ) : entity.kind === 'virus' && isHiddenVirus ? (
                      <div className="relative">
                        <SafeDataIcon icon={entity.icon as SafeIcon} />
                        <motion.div
                          className="absolute -right-3 -top-3 text-red-400"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0, 0, 1], scale: [0, 0, 1] }}
                          transition={{ duration: entity.speed, times: [0, 0.62, 1] }}
                        >
                          <Bug size={22} />
                        </motion.div>
                      </div>
                    ) : (
                      <SafeDataIcon icon={entity.icon as SafeIcon} />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <AnimatePresence>
              {bursts.map((burst) => (
                <motion.div
                  key={burst.id}
                  className={`pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-950/90 px-4 py-2 text-sm font-black ${burst.color}`}
                  style={{
                    top: `${burst.lane * laneHeight + laneHeight / 2}%`,
                    boxShadow: '0 0 18px rgba(255,255,255,0.25)',
                  }}
                  initial={{ opacity: 0, scale: 0.5, x: -30 }}
                  animate={{ opacity: 1, scale: 1.08, x: 25 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.7 }}
                >
                  {burst.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </section>

          <aside className="flex flex-col gap-4 rounded-[2rem] border border-cyan-300/20 bg-slate-950 p-4 shadow-[0_0_32px_rgba(34,211,238,0.12)]">
            <div className="rounded-3xl bg-slate-900 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-bold uppercase tracking-wide text-slate-400">
                <span>System Integrity</span>
                <span>{health}%</span>
              </div>
              <div className="h-5 overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  className={`h-full rounded-full ${
                    health > 65 ? 'bg-emerald-400' : health > 35 ? 'bg-yellow-300' : 'bg-red-400'
                  }`}
                  animate={{ width: `${health}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-slate-900 p-4 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">
                  Safe Data
                </p>
                <div className="mt-2 text-4xl font-black text-emerald-200">{safePassed}</div>
              </div>

              <div className="rounded-3xl bg-slate-900 p-4 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-pink-300">Blocked</p>
                <div className="mt-2 text-4xl font-black text-pink-200">{blocked}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-slate-900 p-4 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-yellow-300">Combo</p>
                <div className="mt-2 text-4xl font-black text-yellow-200">{combo}</div>
              </div>

              <div className="rounded-3xl bg-slate-900 p-4 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">Best</p>
                <div className="mt-2 text-4xl font-black text-cyan-200">{bestCombo}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={moveGateUp}
                disabled={completed || paused || gateLane <= 0}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowUp size={18} />
                Move Up
              </button>

              <button
                type="button"
                onClick={moveGateDown}
                disabled={completed || paused || gateLane >= maxGateLane}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowDown size={18} />
                Move Down
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaused((current) => !current)}
                disabled={completed}
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 font-black text-white transition hover:bg-slate-600 disabled:opacity-50"
              >
                {paused ? <Play size={18} /> : <Pause size={18} />}
                {paused ? 'Resume' : 'Pause'}
              </button>

              <button
                type="button"
                onClick={() => setSlowMode((current) => !current)}
                disabled={completed}
                className={`rounded-2xl px-4 py-3 font-black transition disabled:opacity-50 ${
                  slowMode ? 'bg-yellow-300 text-yellow-950' : 'bg-slate-700 text-white'
                }`}
              >
                Slow
              </button>
            </div>

            <div className="rounded-3xl bg-slate-900 p-4 text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                Shield Status
              </p>
              <motion.div
                animate={shieldActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={shieldActive ? { duration: 0.8, repeat: Infinity } : undefined}
                className={`mt-2 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-black ${
                  shieldActive
                    ? 'bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.7)]'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Shield size={22} />
                {shieldActive ? 'ACTIVE' : 'READY'}
              </motion.div>
            </div>

            <button
              type="button"
              onClick={resetGame}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.45)] transition hover:-translate-y-1 hover:bg-cyan-200"
            >
              <RotateCcw size={20} />
              New Wave
            </button>

            <div className="rounded-2xl bg-slate-900 p-4 text-sm font-semibold text-slate-300">
              Tap a lane or use Move Up / Move Down. Shield blocks viruses; safe data should avoid the shield. Yellow outline = suspicious packet.
            </div>

            <AnimatePresence>
              {completed && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-3xl border border-yellow-300/40 bg-yellow-300/15 p-4 text-center text-yellow-200"
                >
                  <div className="mb-2 flex justify-center">
                    <Sparkles size={34} />
                  </div>
                  <div className="text-xl font-black">Defense Complete!</div>
                  <p className="mt-1 text-sm font-bold">The firewall protected the system.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </main>
      </div>
    </div>
  );
}
