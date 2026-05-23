import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Fan,
  Lightbulb,
  MousePointerClick,
  Play,
  RotateCcw,
  Sparkles,
  Undo2,
  Zap,
} from 'lucide-react';

type GameProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type GearSize = 'small' | 'medium' | 'large';

type Pin = {
  id: string;
  x: number;
  y: number;
  dead?: boolean;
};

type Level = {
  title: string;
  pins: Pin[];
  motorPinId: string;
  goalPinId: string;
  goalGearSize: GearSize;
  parts: GearSize[];
  minGears: number;
};

type PlacedGear = {
  pinId: string;
  size: GearSize;
  powered: boolean;
  direction: 1 | -1;
  fixed?: boolean;
};

type PowerEdge = {
  from: string;
  to: string;
};

const BOARD_W = 1000;
const BOARD_H = 600;
const PIXELS_PER_UNIT = 8;
const MESH_TOLERANCE_UNITS = 1;

const GEAR_RADIUS: Record<GearSize, number> = {
  small: 6,
  medium: 8,
  large: 10,
};

const GEAR_LABEL: Record<GearSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

function px(value: number) {
  return value * PIXELS_PER_UNIT;
}

function touchDistance(a: GearSize, b: GearSize) {
  return GEAR_RADIUS[a] + GEAR_RADIUS[b];
}

function makeChainLevel(title: string, chain: GearSize[], y = 330): Level {
  const ids = 'abcdefghijklmnopqrstuvwxyz'.split('');
  let x = 84;

  const pins: Pin[] = chain.map((size, index) => {
    if (index > 0) {
      x += touchDistance(chain[index - 1], size) * PIXELS_PER_UNIT;
    }

    return {
      id: ids[index],
      x,
      y,
    };
  });

  return {
    title,
    pins,
    motorPinId: pins[0].id,
    goalPinId: pins[pins.length - 1].id,
    goalGearSize: chain[chain.length - 1],
    parts: chain.slice(1, -1),
    minGears: chain.length - 2,
  };
}

const LEVELS_EASY: Level[] = [
  makeChainLevel('Four Gear Power Line', ['medium', 'medium', 'medium', 'medium', 'medium', 'medium'], 330),
  makeChainLevel('Small Large Bridge', ['medium', 'small', 'large', 'small', 'large', 'medium'], 360),
];

const LEVELS_MEDIUM: Level[] = [
  makeChainLevel('Five Gear Radius Chain', ['medium', 'small', 'large', 'medium', 'small', 'large', 'medium'], 330),
  makeChainLevel('Workshop Size Mix', ['medium', 'large', 'small', 'large', 'small', 'medium', 'large'], 360),
];

const LEVELS_HARD: Level[] = [
  makeChainLevel('Six Gear Engineer Chain', ['medium', 'small', 'large', 'medium', 'medium', 'large', 'small', 'medium'], 330),
  makeChainLevel('Master Radius Line', ['medium', 'large', 'small', 'medium', 'large', 'small', 'medium', 'large'], 365),
];

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function distancePx(a: Pin, b: Pin) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distanceUnit(a: Pin, b: Pin) {
  return Math.round(distancePx(a, b) / PIXELS_PER_UNIT);
}

function canMesh(a: Pin, aSize: GearSize, b: Pin, bSize: GearSize) {
  return Math.abs(distancePx(a, b) / PIXELS_PER_UNIT - touchDistance(aSize, bSize)) <= MESH_TOLERANCE_UNITS;
}

function possibleRadiusPairsForDistance(dist: number) {
  const sizes: GearSize[] = ['small', 'medium', 'large'];
  const pairs: string[] = [];

  sizes.forEach((a) => {
    sizes.forEach((b) => {
      const sum = touchDistance(a, b);
      if (Math.abs(sum - dist) <= MESH_TOLERANCE_UNITS) {
        pairs.push(`${GEAR_LABEL[a][0]}+${GEAR_LABEL[b][0]}`);
      }
    });
  });

  return [...new Set(pairs)];
}

function GearShape({
  size,
  powered,
  motor = false,
  direction,
}: {
  size: GearSize;
  powered: boolean;
  motor?: boolean;
  direction: 1 | -1;
}) {
  const radius = px(GEAR_RADIUS[size]);
  const teeth = size === 'small' ? 12 : size === 'medium' ? 16 : 20;

  const points = Array.from({ length: teeth * 2 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / (teeth * 2);
    const r = index % 2 === 0 ? radius + 10 : radius;
    return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
  }).join(' ');

  return (
    <motion.g
      animate={powered || motor ? { rotate: direction * 360 } : { rotate: 0 }}
      transition={
        powered || motor
          ? {
              duration: size === 'large' ? 3.2 : size === 'medium' ? 2.2 : 1.45,
              repeat: Infinity,
              ease: 'linear',
            }
          : { duration: 0.2 }
      }
      style={{
        filter:
          powered || motor
            ? 'drop-shadow(0 0 14px rgba(34,211,238,0.95))'
            : 'drop-shadow(0 8px 8px rgba(0,0,0,0.45))',
      }}
    >
      <polygon
        points={points}
        fill={motor ? 'url(#motorGear)' : powered ? 'url(#poweredGear)' : 'url(#metalGear)'}
        stroke="#020617"
        strokeWidth="6"
      />
      <circle
        r={radius * 0.62}
        fill={motor ? '#0891b2' : powered ? '#10b981' : '#64748b'}
        stroke="#020617"
        strokeWidth="6"
      />
      <circle r={radius * 0.22} fill="#020617" />
      <ellipse
        cx={-radius * 0.24}
        cy={-radius * 0.32}
        rx={radius * 0.34}
        ry={radius * 0.17}
        fill="rgba(255,255,255,0.35)"
      />
      <line
        x1={0}
        y1={-radius * 0.48}
        x2={0}
        y2={radius * 0.48}
        stroke="#020617"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1={-radius * 0.48}
        y1={0}
        x2={radius * 0.48}
        y2={0}
        stroke="#020617"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </motion.g>
  );
}

function GearRadiusLabel({
  size,
  y,
  color = '#cbd5e1',
}: {
  size: GearSize;
  y: number;
  color?: string;
}) {
  return (
    <text
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="15"
      fontWeight="900"
      fill={color}
    >
      R={GEAR_RADIUS[size]}
    </text>
  );
}

export default function GearConnectLogicSvg({ userAge, onGameComplete }: GameProps) {
  const completedRef = useRef(false);

  const config = useMemo(() => {
    if (userAge < 6) return { levels: LEVELS_EASY, mode: 'Junior Mechanic' };
    if (userAge <= 8) return { levels: LEVELS_MEDIUM, mode: 'Workshop Builder' };
    return { levels: LEVELS_HARD, mode: 'Master Engineer' };
  }, [userAge]);

  const [level, setLevel] = useState<Level>(() => randomItem(config.levels));
  const [placed, setPlaced] = useState<PlacedGear[]>([]);
  const [parts, setParts] = useState<GearSize[]>([]);
  const [selectedPart, setSelectedPart] = useState<{ size: GearSize; index: number } | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [powerEdges, setPowerEdges] = useState<PowerEdge[]>([]);
  const [message, setMessage] = useState('Pick a gear, match radii, then press RUN.');
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);

  const distanceRows = useMemo(() => {
    return level.pins.slice(0, -1).map((pin, index) => {
      const next = level.pins[index + 1];
      const d = distanceUnit(pin, next);

      return {
        from: pin.id.toUpperCase(),
        to: next.id.toUpperCase(),
        d,
        pairs: possibleRadiusPairsForDistance(d),
      };
    });
  }, [level]);

  function resetWithLevel(nextLevel = randomItem(config.levels)) {
    setLevel(nextLevel);
    setPlaced([
      {
        pinId: nextLevel.motorPinId,
        size: 'medium',
        powered: true,
        direction: 1,
        fixed: true,
      },
      {
        pinId: nextLevel.goalPinId,
        size: nextLevel.goalGearSize,
        powered: false,
        direction: 1,
        fixed: true,
      },
    ]);
    setParts(nextLevel.parts);
    setSelectedPart(null);
    setSimulating(false);
    setPowerEdges([]);
    setMessage('Distance rule: gear radius + next gear radius ≈ pin distance.');
    setMistakes(0);
    setCompleted(false);
    completedRef.current = false;
  }

  useEffect(() => {
    resetWithLevel(randomItem(config.levels));
  }, [config]);

  function getPin(id: string) {
    return level.pins.find((pin) => pin.id === id);
  }

  function removeGear(pinId: string) {
    if (simulating || completed) return;

    const removed = placed.find((gear) => gear.pinId === pinId);
    if (!removed || removed.fixed) return;

    setPlaced((current) => current.filter((gear) => gear.pinId !== pinId));
    setParts((current) => [...current, removed.size]);
    setPowerEdges([]);
    setMessage('Gear removed. Use the distance table to choose a better size.');
  }

  function placeGear(pin: Pin) {
    if (!selectedPart || pin.dead || simulating || completed) return;
    if (pin.id === level.motorPinId || pin.id === level.goalPinId) return;
    if (placed.some((gear) => gear.pinId === pin.id)) return;

    setPlaced((current) => [
      ...current,
      {
        pinId: pin.id,
        size: selectedPart.size,
        powered: false,
        direction: 1,
      },
    ]);

    setParts((current) => current.filter((_, index) => index !== selectedPart.index));
    setSelectedPart(null);
    setPowerEdges([]);
    setMessage(`Placed ${GEAR_LABEL[selectedPart.size]} gear. Check R sums, then RUN.`);
  }

  function computeSimulation() {
    const gearMap = new Map<string, PlacedGear>(
      placed.map((gear) => [
        gear.pinId,
        {
          ...gear,
          powered: gear.pinId === level.motorPinId,
          direction: gear.pinId === level.motorPinId ? 1 : gear.direction,
        },
      ])
    );

    const edges: PowerEdge[] = [];
    const order: string[] = [level.motorPinId];

    let changed = true;

    while (changed) {
      changed = false;

      for (const source of gearMap.values()) {
        if (!source.powered) continue;

        const pinA = getPin(source.pinId);
        if (!pinA) continue;

        for (const target of gearMap.values()) {
          if (target.powered || source.pinId === target.pinId) continue;

          const pinB = getPin(target.pinId);
          if (!pinB || pinB.dead) continue;

          if (canMesh(pinA, source.size, pinB, target.size)) {
            target.powered = true;
            target.direction = source.direction === 1 ? -1 : 1;
            gearMap.set(target.pinId, target);
            edges.push({ from: source.pinId, to: target.pinId });
            order.push(target.pinId);
            changed = true;
          }
        }
      }
    }

    return {
      finalGears: [...gearMap.values()],
      edges,
      order,
      goalPowered: gearMap.get(level.goalPinId)?.powered ?? false,
    };
  }

  function runSimulation() {
    if (simulating || completed) return;

    setSimulating(true);
    setPowerEdges([]);
    setMessage('Running machine... watch the power flow!');

    const result = computeSimulation();

    setPlaced((current) =>
      current.map((gear) => ({
        ...gear,
        powered: gear.pinId === level.motorPinId,
        direction: gear.pinId === level.motorPinId ? 1 : gear.direction,
      }))
    );

    result.order.forEach((pinId, index) => {
      window.setTimeout(() => {
        setPlaced((current) =>
          current.map((gear) => {
            const solved = result.finalGears.find((finalGear) => finalGear.pinId === gear.pinId);

            if (gear.pinId === pinId && solved) {
              return {
                ...gear,
                powered: true,
                direction: solved.direction,
              };
            }

            return gear;
          })
        );

        setPowerEdges(result.edges.slice(0, Math.max(index, 0)));

        if (index === result.order.length - 1) {
          window.setTimeout(() => {
            setSimulating(false);

            if (result.goalPowered) {
              setCompleted(true);
              setMessage('Goal gear activated! Great radius matching!');

              if (!completedRef.current) {
                completedRef.current = true;
                const usedGears = placed.filter((gear) => !gear.fixed).length;
                const stars =
                  usedGears <= level.minGears && mistakes === 0
                    ? 3
                    : usedGears <= level.minGears + 1
                      ? 2
                      : 1;

                onGameComplete(stars);
              }
            } else {
              setMistakes((current) => current + 1);
              setMessage('Power stopped. Check if each pair has R1 + R2 ≈ distance.');
            }
          }, 450);
        }
      }, index * 430);
    });
  }

  const goalPowered = placed.some((gear) => gear.pinId === level.goalPinId && gear.powered);

  return (
    <div className="min-h-[720px] w-full rounded-3xl bg-slate-900 p-4 text-white shadow-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="rounded-3xl border border-cyan-400/20 bg-slate-950 p-4 text-center shadow-[0_0_32px_rgba(34,211,238,0.16)]">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Gear Connect Logic
          </p>
          <h2 className="mt-1 text-2xl font-black">{level.title}</h2>
          <p className="mt-1 font-semibold text-slate-300">
            {config.mode}: {message}
          </p>
        </header>

        <main className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <section className="rounded-[2rem] border border-slate-700 bg-slate-950 p-3 shadow-[inset_0_0_44px_rgba(15,23,42,0.95)]">
            <svg
              viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
              className="h-[560px] w-full rounded-[1.5rem]"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="metalGear" cx="45%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="48%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#334155" />
                </radialGradient>

                <radialGradient id="poweredGear" cx="45%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#d1fae5" />
                  <stop offset="55%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#047857" />
                </radialGradient>

                <radialGradient id="motorGear" cx="45%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#cffafe" />
                  <stop offset="55%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0e7490" />
                </radialGradient>

                <pattern id="gridDots" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="2" fill="rgba(148,163,184,0.35)" />
                </pattern>
              </defs>

              <rect width={BOARD_W} height={BOARD_H} fill="#020617" />
              <rect width={BOARD_W} height={BOARD_H} fill="url(#gridDots)" />

              {distanceRows.map((row) => {
                const a = getPin(row.from.toLowerCase());
                const b = getPin(row.to.toLowerCase());
                if (!a || !b) return null;

                return (
                  <line
                    key={`${row.from}-${row.to}-guide`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgba(34,211,238,0.25)"
                    strokeWidth="3"
                    strokeDasharray="8 8"
                    strokeLinecap="round"
                  />
                );
              })}

              <foreignObject x="700" y="20" width="276" height="238">
                <div className="rounded-2xl border border-cyan-300/50 bg-slate-950/95 p-3 text-xs font-bold text-slate-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                  <div className="mb-2 text-center text-sm font-black text-cyan-200">
                    Distance Table
                  </div>
                  <div className="grid grid-cols-4 gap-1 border-b border-slate-700 pb-1 text-[11px] uppercase text-slate-400">
                    <span>From</span>
                    <span>To</span>
                    <span>d</span>
                    <span>Pairs</span>
                  </div>
                  <div className="mt-1">
                    {distanceRows.map((row) => (
                      <div
                        key={`${row.from}-${row.to}`}
                        className="grid grid-cols-4 gap-1 rounded-lg px-1 py-1"
                      >
                        <span>{row.from}</span>
                        <span>{row.to}</span>
                        <span className="text-yellow-200">{row.d}</span>
                        <span className={row.pairs.length ? 'text-cyan-200' : 'text-slate-500'}>
                          {row.pairs.length ? row.pairs.join('/') : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 rounded-xl bg-slate-900 p-2 text-[11px] text-yellow-100">
                    Rule: R1 + R2 ≈ d
                  </div>
                </div>
              </foreignObject>

              {powerEdges.map((edge) => {
                const a = getPin(edge.from);
                const b = getPin(edge.to);

                if (!a || !b) return null;

                return (
                  <motion.line
                    key={`${edge.from}-${edge.to}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="#22d3ee"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    style={{
                      filter: 'drop-shadow(0 0 12px rgba(34,211,238,1))',
                    }}
                  />
                );
              })}

              {level.pins.map((pin) => {
                const gear = placed.find((item) => item.pinId === pin.id);
                const isMotor = pin.id === level.motorPinId;
                const isGoal = pin.id === level.goalPinId;
                const canPlace =
                  selectedPart &&
                  !pin.dead &&
                  !gear &&
                  !isMotor &&
                  !isGoal &&
                  !simulating &&
                  !completed;

                return (
                  <g key={pin.id}>
                    <motion.circle
                      cx={pin.x}
                      cy={pin.y}
                      r={canPlace ? 20 : 15}
                      fill={
                        pin.dead
                          ? '#7f1d1d'
                          : isMotor
                            ? '#06b6d4'
                            : isGoal
                              ? '#eab308'
                              : canPlace
                                ? '#10b981'
                                : '#334155'
                      }
                      stroke={
                        pin.dead ? '#f87171' : isMotor ? '#a5f3fc' : isGoal ? '#fef08a' : '#94a3b8'
                      }
                      strokeWidth="5"
                      animate={canPlace ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                      transition={{ repeat: canPlace ? Infinity : 0, duration: 1 }}
                      onClick={() => (gear ? removeGear(pin.id) : placeGear(pin))}
                      className="cursor-pointer"
                    />

                    {!gear && !pin.dead && (
                      <text
                        x={pin.x}
                        y={pin.y + 36}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="900"
                        fill={isMotor ? '#67e8f9' : isGoal ? '#facc15' : '#94a3b8'}
                      >
                        {isMotor ? 'MOTOR' : isGoal ? `GOAL R${GEAR_RADIUS[level.goalGearSize]}` : pin.id.toUpperCase()}
                      </text>
                    )}

                    {pin.dead && (
                      <foreignObject x={pin.x - 18} y={pin.y - 18} width="36" height="36">
                        <div className="flex h-full w-full items-center justify-center text-red-400">
                          <Zap size={30} />
                        </div>
                      </foreignObject>
                    )}

                    {gear && (
                      <g
                        transform={`translate(${pin.x}, ${pin.y})`}
                        onClick={() => removeGear(pin.id)}
                        className="cursor-pointer"
                      >
                        <GearShape
                          size={gear.size}
                          powered={gear.powered}
                          motor={isMotor}
                          direction={gear.direction}
                        />

                        <GearRadiusLabel
                          size={gear.size}
                          y={px(GEAR_RADIUS[gear.size]) + 28}
                          color={isGoal ? '#facc15' : isMotor ? '#67e8f9' : '#cbd5e1'}
                        />

                        {(isMotor || isGoal) && (
                          <text
                            y={-(px(GEAR_RADIUS[gear.size]) + 26)}
                            textAnchor="middle"
                            fontSize="14"
                            fontWeight="900"
                            fill={isMotor ? '#67e8f9' : '#facc15'}
                          >
                            {isMotor ? 'MOTOR' : 'GOAL'}
                          </text>
                        )}
                      </g>
                    )}

                    {isGoal && goalPowered && (
                      <foreignObject x={pin.x + 54} y={pin.y - 34} width="80" height="80">
                        <motion.div
                          animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                          transition={{
                            rotate: { duration: 1.3, repeat: Infinity, ease: 'linear' },
                            scale: { duration: 0.85, repeat: Infinity },
                          }}
                          className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-900/90 text-yellow-300"
                        >
                          {userAge < 6 ? <Lightbulb size={38} /> : <Fan size={38} />}
                        </motion.div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>
          </section>

          <aside className="flex flex-col gap-4 rounded-[2rem] border border-slate-700 bg-slate-950 p-4">
            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900 p-4">
              <div className="mb-2 flex items-center gap-2 text-cyan-200">
                <MousePointerClick size={20} />
                <h3 className="font-black">Build Mode</h3>
              </div>
              <p className="text-sm font-semibold text-slate-300">
                Rule: two gears mesh when <span className="text-cyan-200">R1 + R2 ≈ distance</span>.
                Use the distance table, then place 4–6 gears.
              </p>
            </div>

            <div className="rounded-3xl border border-dashed border-cyan-400/30 bg-slate-900 p-4">
              <h3 className="mb-3 text-xl font-black text-cyan-200">Parts Box</h3>

              <div className="flex flex-wrap justify-center gap-3">
                {parts.map((size, index) => {
                  const selected = selectedPart?.index === index && selectedPart.size === size;

                  return (
                    <button
                      key={`${size}-${index}`}
                      type="button"
                      onClick={() => setSelectedPart({ size, index })}
                      disabled={simulating || completed}
                      className={`rounded-3xl p-3 transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                        selected
                          ? 'bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.8)]'
                          : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      <svg viewBox="-110 -110 220 220" className="h-20 w-20">
                        <defs>
                          <radialGradient id="metalGear" cx="45%" cy="35%" r="70%">
                            <stop offset="0%" stopColor="#f8fafc" />
                            <stop offset="48%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#334155" />
                          </radialGradient>
                          <radialGradient id="poweredGear" cx="45%" cy="35%" r="70%">
                            <stop offset="0%" stopColor="#d1fae5" />
                            <stop offset="55%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#047857" />
                          </radialGradient>
                          <radialGradient id="motorGear" cx="45%" cy="35%" r="70%">
                            <stop offset="0%" stopColor="#cffafe" />
                            <stop offset="55%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#0e7490" />
                          </radialGradient>
                        </defs>
                        <GearShape size={size} powered={false} direction={1} />
                      </svg>
                      <p className="mt-1 text-sm font-black">{GEAR_LABEL[size]}</p>
                      <p className="text-xs font-black text-cyan-200">R = {GEAR_RADIUS[size]}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-4 text-sm font-semibold text-slate-300">
              <p className="font-black text-cyan-200">Radius Guide</p>
              <p>Small: R{GEAR_RADIUS.small}</p>
              <p>Medium: R{GEAR_RADIUS.medium}</p>
              <p>Large: R{GEAR_RADIUS.large}</p>
              <p className="mt-2 text-yellow-200">
                Example: Medium + Medium = {GEAR_RADIUS.medium + GEAR_RADIUS.medium}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={runSimulation}
                disabled={simulating || completed}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-lg font-black text-emerald-950 shadow-[0_0_18px_rgba(52,211,153,0.45)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play size={22} />
                RUN
              </button>

              <button
                type="button"
                onClick={() => resetWithLevel(level)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-700 px-4 py-4 font-black text-white transition hover:-translate-y-1"
              >
                <Undo2 size={20} />
                Reset
              </button>
            </div>

            <button
              type="button"
              onClick={() => resetWithLevel(randomItem(config.levels))}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950 transition hover:-translate-y-1"
            >
              <RotateCcw size={20} />
              New Workshop
            </button>

            <div className="rounded-3xl bg-slate-900 p-4 text-sm font-semibold text-slate-300">
              <p>Goal: power the yellow goal gear.</p>
              <p>Placed gears needed: {level.minGears}</p>
              <p>Mistakes: {mistakes}</p>
            </div>
          </aside>
        </main>
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-sm rounded-[2rem] bg-white p-8 text-center text-slate-800 shadow-2xl">
              <Sparkles className="mx-auto mb-3 h-14 w-14 text-amber-400" />
              <h2 className="mb-2 text-3xl font-black text-emerald-700">Machine Solved!</h2>
              <p className="mb-5 font-bold text-slate-600">
                Power reached the goal gear using radius matching.
              </p>
              <button
                onClick={() => resetWithLevel(randomItem(config.levels))}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-1"
              >
                Next Workshop
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
