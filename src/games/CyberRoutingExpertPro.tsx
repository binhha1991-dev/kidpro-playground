import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Play, RotateCcw, Save, Server, Wifi } from 'lucide-react';

type GameProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type PacketColor = 'cyan' | 'pink' | 'amber';
type NodeType = 'router' | 'entry' | 'server';
type Direction = 'up' | 'right' | 'down' | 'left';
type Phase = 'planning' | 'running' | 'complete';

type NetworkNode = {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  color?: PacketColor;
  exits?: Partial<Record<Direction, string>>;
};

type Packet = {
  id: string;
  color: PacketColor;
  fromId: string;
  toId: string;
  routeDirs: Record<string, Direction>;
};

type Level = {
  title: string;
  nodes: NetworkNode[];
  entryId: string;
  packetColors: PacketColor[];
  goal: number;
  maxActivePackets: number;
  idealSteps: Partial<Record<PacketColor, number>>;
};

type PreviewSegment = {
  from: NetworkNode;
  to: NetworkNode;
  color: PacketColor;
};

type PreviewResult = {
  color: PacketColor;
  segments: PreviewSegment[];
  status: 'safe' | 'lost' | 'loop' | 'blocked';
  endLabel: string;
  steps: number;
};

const COLOR_META: Record<PacketColor, { hex: string; label: string }> = {
  cyan: { hex: '#22d3ee', label: 'Cyan' },
  pink: { hex: '#f472b6', label: 'Pink' },
  amber: { hex: '#fbbf24', label: 'Amber' },
};

const DIRECTIONS: Direction[] = ['up', 'right', 'down', 'left'];

const ROTATION: Record<Direction, number> = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
};

function makeId() {
  return Math.random().toString(36).slice(2);
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

const EASY_LEVELS: Level[] = [
  {
    title: 'Two Server Router Table',
    entryId: 'entry',
    packetColors: ['cyan', 'pink'],
    goal: 8,
    maxActivePackets: 2,
    idealSteps: { cyan: 3, pink: 3 },
    nodes: [
      { id: 'entry', x: 8, y: 50, type: 'entry', exits: { right: 'a' } },
      { id: 'a', x: 34, y: 50, type: 'router', exits: { up: 'b', down: 'c' } },
      { id: 'b', x: 60, y: 28, type: 'router', exits: { right: 'cyanServer', down: 'c' } },
      { id: 'c', x: 60, y: 72, type: 'router', exits: { right: 'pinkServer', up: 'b' } },
      { id: 'cyanServer', x: 88, y: 28, type: 'server', color: 'cyan' },
      { id: 'pinkServer', x: 88, y: 72, type: 'server', color: 'pink' },
    ],
  },
];

const MEDIUM_LEVELS: Level[] = [
  {
    title: 'Routing Table Crossroad',
    entryId: 'entry',
    packetColors: ['cyan', 'pink'],
    goal: 10,
    maxActivePackets: 3,
    idealSteps: { cyan: 3, pink: 3 },
    nodes: [
      { id: 'entry', x: 6, y: 50, type: 'entry', exits: { right: 'a' } },
      { id: 'a', x: 24, y: 50, type: 'router', exits: { up: 'b', right: 'd', down: 'c' } },
      { id: 'b', x: 48, y: 24, type: 'router', exits: { right: 'cyanServer', down: 'd', left: 'a' } },
      { id: 'c', x: 48, y: 76, type: 'router', exits: { right: 'pinkServer', up: 'd', left: 'a' } },
      { id: 'd', x: 58, y: 50, type: 'router', exits: { up: 'b', down: 'c', left: 'a' } },
      { id: 'cyanServer', x: 88, y: 24, type: 'server', color: 'cyan' },
      { id: 'pinkServer', x: 88, y: 76, type: 'server', color: 'pink' },
    ],
  },
];

const HARD_LEVELS: Level[] = [
  {
    title: 'Three Color Routing Table',
    entryId: 'entry',
    packetColors: ['cyan', 'pink', 'amber'],
    goal: 12,
    maxActivePackets: 4,
    idealSteps: { cyan: 4, pink: 4, amber: 3 },
    nodes: [
      { id: 'entry', x: 5, y: 50, type: 'entry', exits: { right: 'a' } },
      { id: 'a', x: 20, y: 50, type: 'router', exits: { up: 'b', right: 'e', down: 'd' } },
      { id: 'b', x: 38, y: 24, type: 'router', exits: { right: 'c', down: 'e', left: 'a' } },
      { id: 'c', x: 60, y: 22, type: 'router', exits: { right: 'cyanServer', down: 'e', left: 'b' } },
      { id: 'd', x: 38, y: 76, type: 'router', exits: { right: 'g', up: 'e', left: 'a' } },
      { id: 'e', x: 55, y: 50, type: 'router', exits: { up: 'c', right: 'amberServer', down: 'g', left: 'a' } },
      { id: 'g', x: 60, y: 78, type: 'router', exits: { right: 'pinkServer', up: 'e', left: 'd' } },
      { id: 'cyanServer', x: 91, y: 20, type: 'server', color: 'cyan' },
      { id: 'amberServer', x: 91, y: 50, type: 'server', color: 'amber' },
      { id: 'pinkServer', x: 91, y: 80, type: 'server', color: 'pink' },
    ],
  },
];

export default function CyberRoutingExpertPro({ userAge, onGameComplete }: GameProps) {
  const tickRef = useRef<number | null>(null);
  const spawnRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const config = useMemo(() => {
    if (userAge < 6) {
      return { levels: EASY_LEVELS, speed: 1250, spawnDelay: 850, title: 'Junior Router' };
    }

    if (userAge <= 8) {
      return { levels: MEDIUM_LEVELS, speed: 980, spawnDelay: 650, title: 'Network Guide' };
    }

    return { levels: HARD_LEVELS, speed: 760, spawnDelay: 480, title: 'Cyber Routing Expert' };
  }, [userAge]);

  const [level, setLevel] = useState<Level>(() => randomItem(config.levels));
  const [phase, setPhase] = useState<Phase>('planning');
  const [draftDirs, setDraftDirs] = useState<Record<string, Direction>>({});
  const [savedRoutes, setSavedRoutes] = useState<Partial<Record<PacketColor, Record<string, Direction>>>>({});
  const [queue, setQueue] = useState<PacketColor[]>([]);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [delivered, setDelivered] = useState<Record<PacketColor, number>>({ cyan: 0, pink: 0, amber: 0 });
  const [lost, setLost] = useState(0);
  const [rotations, setRotations] = useState(0);
  const [message, setMessage] = useState('Select a packet color, set its route, then save it.');
  const [previewColor, setPreviewColor] = useState<PacketColor>('cyan');
  const [savedStepTotal, setSavedStepTotal] = useState(0);

  function getNode(id: string) {
    return level.nodes.find((node) => node.id === id);
  }

  function getDefaultDirs(nextLevel: Level) {
    const dirs: Record<string, Direction> = {};

    nextLevel.nodes
      .filter((node) => node.type === 'router')
      .forEach((node) => {
        const exits = Object.keys(node.exits ?? {}) as Direction[];
        dirs[node.id] = exits[0] ?? 'right';
      });

    return dirs;
  }

  function buildQueue(nextLevel: Level) {
    return shuffle(Array.from({ length: nextLevel.goal }, () => randomItem(nextLevel.packetColors)));
  }

  function setupRound() {
    if (tickRef.current) window.clearTimeout(tickRef.current);
    if (spawnRef.current) window.clearTimeout(spawnRef.current);

    const next = randomItem(config.levels);
    const defaultDirs = getDefaultDirs(next);

    setLevel(next);
    setDraftDirs(defaultDirs);
    setSavedRoutes({});
    setQueue(buildQueue(next));
    setPackets([]);
    setDelivered({ cyan: 0, pink: 0, amber: 0 });
    setLost(0);
    setRotations(0);
    setPhase('planning');
    setMessage('Select a packet color, set its route, then save it.');
    setPreviewColor(next.packetColors[0]);
    setSavedStepTotal(0);
    completedRef.current = false;
  }

  useEffect(() => {
    setupRound();

    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
      if (spawnRef.current) window.clearTimeout(spawnRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAge]);

  function simulateRoute(color: PacketColor, dirs: Record<string, Direction>): PreviewResult {
    const segments: PreviewSegment[] = [];
    const entry = getNode(level.entryId);
    let currentId = entry?.exits?.right;
    let guard = 0;
    const visited = new Set<string>();

    if (entry && currentId) {
      const first = getNode(currentId);
      if (first) segments.push({ from: entry, to: first, color });
    }

    while (currentId && guard < 24) {
      guard += 1;
      const node = getNode(currentId);
      if (!node) return { color, segments, status: 'blocked', endLabel: 'Broken link', steps: segments.length };

      const visitKey = `${currentId}`;
      if (visited.has(visitKey)) return { color, segments, status: 'loop', endLabel: 'Loop detected', steps: segments.length };
      visited.add(visitKey);

      if (node.type === 'server') {
        const safe = node.color === color;
        return {
          color,
          segments,
          status: safe ? 'safe' : 'lost',
          endLabel: safe ? `${COLOR_META[color].label} server` : 'Wrong server',
          steps: segments.length,
        };
      }

      const dir = dirs[node.id] ?? 'right';
      const nextId = node.exits?.[dir];
      if (!nextId) return { color, segments, status: 'blocked', endLabel: 'No route', steps: segments.length };

      const nextNode = getNode(nextId);
      if (!nextNode) return { color, segments, status: 'blocked', endLabel: 'Broken link', steps: segments.length };

      segments.push({ from: node, to: nextNode, color });
      currentId = nextId;
    }

    return { color, segments, status: 'loop', endLabel: 'Route too long', steps: segments.length };
  }

  const selectedPreview = useMemo(
    () => simulateRoute(previewColor, draftDirs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, draftDirs, previewColor]
  );

  const savedPreviewResults = useMemo(
    () =>
      level.packetColors.map((color) => {
        const route = savedRoutes[color];
        return route ? simulateRoute(color, route) : null;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, savedRoutes]
  );

  const allRoutesSaved = level.packetColors.every((color) => Boolean(savedRoutes[color]));
  const allSavedRoutesSafe = savedPreviewResults.every((result) => result?.status === 'safe');
  const idealStepTotal = level.packetColors.reduce((sum, color) => sum + (level.idealSteps[color] ?? 99), 0);

  function selectPreviewColor(color: PacketColor) {
    if (phase !== 'planning') return;

    setPreviewColor(color);
    setDraftDirs(savedRoutes[color] ? { ...savedRoutes[color]! } : getDefaultDirs(level));
    setMessage(savedRoutes[color] ? `Loaded saved ${COLOR_META[color].label} route.` : `Set a route for ${COLOR_META[color].label} packets.`);
  }

  function rotateRouter(nodeId: string) {
    if (phase !== 'planning') return;

    const node = getNode(nodeId);
    if (!node?.exits) return;

    const available = Object.keys(node.exits) as Direction[];

    setDraftDirs((current) => {
      const oldDir = current[nodeId] ?? available[0] ?? 'right';
      const oldIndex = DIRECTIONS.indexOf(oldDir);
      const nextDir =
        DIRECTIONS.slice(oldIndex + 1)
          .concat(DIRECTIONS.slice(0, oldIndex + 1))
          .find((dir) => available.includes(dir)) ?? available[0];

      return { ...current, [nodeId]: nextDir };
    });

    setRotations((value) => value + 1);
  }

  function saveCurrentRoute() {
    if (phase !== 'planning') return;

    const preview = simulateRoute(previewColor, draftDirs);

    if (preview.status !== 'safe') {
      setMessage(`Route not safe yet: ${preview.endLabel}. Adjust before saving.`);
      return;
    }

    setSavedRoutes((current) => ({ ...current, [previewColor]: { ...draftDirs } }));
    setMessage(`${COLOR_META[previewColor].label} route saved. Steps: ${preview.steps}.`);
  }

  function startRun() {
    if (phase !== 'planning') return;

    if (!allRoutesSaved) {
      setMessage('Save a route for every packet color before executing.');
      return;
    }

    const stepTotal = level.packetColors.reduce((sum, color) => {
      const route = savedRoutes[color];
      if (!route) return sum + 99;
      return sum + simulateRoute(color, route).steps;
    }, 0);

    setSavedStepTotal(stepTotal);
    setPhase('running');
    setMessage(allSavedRoutesSafe ? 'Routing table saved. Executing all packets.' : 'Warning: at least one saved route is unsafe.');
  }

  function spawnOnePacket() {
    if (phase !== 'running') return;

    setQueue((current) => {
      if (current.length === 0) return current;

      setPackets((active) => {
        if (active.length >= level.maxActivePackets) return active;

        const [nextColorPacket] = current;
        const routeDirs = savedRoutes[nextColorPacket];
        const entry = getNode(level.entryId);
        const firstTarget = entry?.exits?.right;

        if (!entry || !firstTarget || !routeDirs) return active;

        return [
          ...active,
          {
            id: makeId(),
            color: nextColorPacket,
            fromId: level.entryId,
            toId: firstTarget,
            routeDirs,
          },
        ];
      });

      return current.slice(1);
    });
  }

  useEffect(() => {
    if (phase !== 'running') return;
    if (queue.length === 0 || packets.length >= level.maxActivePackets) return;

    spawnRef.current = window.setTimeout(spawnOnePacket, config.spawnDelay);

    return () => {
      if (spawnRef.current) window.clearTimeout(spawnRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, queue.length, packets.length, level, config.spawnDelay]);

  function resolvePacket(packet: Packet): Packet | null {
    const arrived = getNode(packet.toId);
    if (!arrived) return null;

    if (arrived.type === 'server') {
      if (arrived.color === packet.color) {
        setDelivered((current) => ({ ...current, [packet.color]: current[packet.color] + 1 }));
        setMessage(`${COLOR_META[packet.color].label} packet delivered!`);
      } else {
        setLost((current) => current + 1);
        setMessage('Wrong server! Packet lost.');
      }

      return null;
    }

    const dir = packet.routeDirs[arrived.id] ?? 'right';
    const nextId = arrived.exits?.[dir];

    if (!nextId) {
      setLost((current) => current + 1);
      setMessage('Saved route points nowhere. Packet lost.');
      return null;
    }

    return { ...packet, fromId: arrived.id, toId: nextId };
  }

  useEffect(() => {
    if (phase !== 'running') return;
    if (packets.length === 0) return;

    tickRef.current = window.setTimeout(() => {
      setPackets((current) => current.map(resolvePacket).filter(Boolean) as Packet[]);
    }, config.speed);

    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packets, phase, config.speed]);

  const deliveredTotal = delivered.cyan + delivered.pink + delivered.amber;
  const finishedAllPackets = phase === 'running' && queue.length === 0 && packets.length === 0;

  function calculateStars() {
    if (lost === 0 && savedStepTotal <= idealStepTotal) return 3;
    if (lost === 0 && savedStepTotal <= idealStepTotal + 2) return 2;
    if (lost <= 2) return 2;
    return 1;
  }

  useEffect(() => {
    if (!finishedAllPackets || completedRef.current) return;

    completedRef.current = true;
    setPhase('complete');
    setMessage(lost === 0 ? 'Network complete! Routing table worked.' : 'Network finished, but some packets were lost.');
    onGameComplete(calculateStars());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedAllPackets, lost]);

  const connections = useMemo(() => {
    const lines: { from: NetworkNode; to: NetworkNode }[] = [];

    level.nodes.forEach((node) => {
      Object.values(node.exits ?? {}).forEach((targetId) => {
        const target = level.nodes.find((item) => item.id === targetId);
        if (target) lines.push({ from: node, to: target });
      });
    });

    return lines;
  }, [level]);

  return (
    <div className="min-h-[720px] w-full rounded-3xl bg-[#020617] p-4 text-white shadow-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="rounded-3xl border border-cyan-300/20 bg-slate-950 p-4 text-center shadow-[0_0_32px_rgba(34,211,238,0.15)]">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Cyber Routing Expert Pro</p>
          <h2 className="mt-1 text-2xl font-black">
            {config.title}: {level.title}
          </h2>
          <p className="mt-1 font-semibold text-slate-300">{message}</p>
        </header>

        <main className="grid gap-4 lg:grid-cols-[1fr_310px]">
          <section
            className="relative h-[540px] overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#020617] shadow-[inset_0_0_45px_rgba(34,211,238,0.08)]"
            style={{
              backgroundImage: 'radial-gradient(rgba(34,211,238,0.18) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <svg className="absolute inset-0 h-full w-full">
              {connections.map((line, index) => (
                <line
                  key={`${line.from.id}-${line.to.id}-${index}`}
                  x1={`${line.from.x}%`}
                  y1={`${line.from.y}%`}
                  x2={`${line.to.x}%`}
                  y2={`${line.to.y}%`}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                  strokeDasharray="8 8"
                  strokeLinecap="round"
                />
              ))}

              {selectedPreview.segments.map((line, index) => (
                <motion.line
                  key={`preview-${previewColor}-${index}`}
                  x1={`${line.from.x}%`}
                  y1={`${line.from.y}%`}
                  x2={`${line.to.x}%`}
                  y2={`${line.to.y}%`}
                  stroke={COLOR_META[line.color].hex}
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: phase === 'planning' ? 0.72 : 0.25, pathLength: 1 }}
                  style={{ filter: `drop-shadow(0 0 12px ${COLOR_META[line.color].hex})` }}
                />
              ))}
            </svg>

            {level.nodes.map((node) => {
              const direction = draftDirs[node.id] ?? 'right';

              if (node.type === 'server') {
                const color = node.color ?? 'cyan';

                return (
                  <div
                    key={node.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    <div
                      className="rounded-3xl border bg-slate-950 p-4"
                      style={{
                        borderColor: COLOR_META[color].hex,
                        color: COLOR_META[color].hex,
                        boxShadow: `0 0 24px ${COLOR_META[color].hex}66`,
                      }}
                    >
                      <Server size={42} />
                    </div>
                  </div>
                );
              }

              if (node.type === 'entry') {
                return (
                  <div
                    key={node.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-emerald-300/50 bg-emerald-300/15 p-4 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.45)]"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    <Wifi size={38} />
                  </div>
                );
              }

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => rotateRouter(node.id)}
                  disabled={phase !== 'planning'}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-slate-950 p-3 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <motion.div animate={{ rotate: ROTATION[direction] }}>
                    <ArrowUp size={34} />
                  </motion.div>
                </button>
              );
            })}

            <AnimatePresence>
              {packets.map((packet) => {
                const packetFrom = getNode(packet.fromId);
                const packetTo = getNode(packet.toId);
                if (!packetFrom || !packetTo) return null;

                return (
                  <motion.div
                    key={packet.id + packet.fromId + packet.toId + packet.color}
                    className="absolute z-30 h-5 w-9 rounded-md"
                    initial={{ left: `${packetFrom.x}%`, top: `${packetFrom.y}%`, opacity: 1, scale: 0.9 }}
                    animate={{ left: `${packetTo.x}%`, top: `${packetTo.y}%`, opacity: 1, scale: [1, 1.12, 1] }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{ duration: config.speed / 1000, ease: 'linear' }}
                    style={{
                      backgroundColor: COLOR_META[packet.color].hex,
                      boxShadow: `0 0 18px ${COLOR_META[packet.color].hex}`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                );
              })}
            </AnimatePresence>
          </section>

          <aside className="flex flex-col gap-4 rounded-[2rem] border border-cyan-300/20 bg-slate-950 p-4">
            <div className="rounded-3xl bg-slate-900 p-4">
              <h3 className="mb-2 text-center text-xl font-black text-cyan-200">Routing Table</h3>
              <div className="grid grid-cols-3 gap-2">
                {level.packetColors.map((color) => {
                  const saved = Boolean(savedRoutes[color]);
                  const routePreview = savedRoutes[color] ? simulateRoute(color, savedRoutes[color]!) : null;

                  return (
                    <button
                      key={color}
                      onClick={() => selectPreviewColor(color)}
                      disabled={phase !== 'planning'}
                      className={`rounded-2xl px-3 py-2 text-sm font-black ${previewColor === color ? 'bg-white text-slate-900' : 'bg-slate-800'} disabled:opacity-70`}
                      style={{ color: previewColor === color ? '#020617' : COLOR_META[color].hex }}
                    >
                      {COLOR_META[color].label}
                      <span className="ml-1">{saved ? (routePreview?.status === 'safe' ? '✅' : '⚠️') : '○'}</span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-center text-sm font-bold text-slate-400">
                Draft {COLOR_META[previewColor].label}: {selectedPreview.endLabel} · {selectedPreview.steps} steps
              </p>

              <button
                onClick={saveCurrentRoute}
                disabled={phase !== 'planning'}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-5 py-3 font-black text-yellow-950 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={20} />
                Save {COLOR_META[previewColor].label} Route
              </button>
            </div>

            {phase === 'planning' && (
              <button
                onClick={startRun}
                disabled={!allRoutesSaved}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-emerald-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play size={20} /> Execute All Packets
              </button>
            )}

            {phase === 'running' && (
              <div className="rounded-2xl bg-emerald-400/15 px-4 py-3 text-center font-black text-emerald-200">
                Packets running: {packets.length}/{level.maxActivePackets}
              </div>
            )}

            {phase === 'complete' && (
              <div className="rounded-2xl bg-yellow-300/15 px-4 py-3 text-center font-black text-yellow-200">
                Result: {'⭐'.repeat(calculateStars())}
              </div>
            )}

            <div className="rounded-3xl bg-slate-900 p-4 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Progress</p>
              <div className="mt-2 text-5xl font-black text-white">
                {deliveredTotal}/{level.goal}
              </div>
              <p className="mt-2 font-semibold text-slate-400">Lost packets: {lost}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Rotations: {rotations}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Route efficiency: {savedStepTotal || '-'} / ideal {idealStepTotal}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-900 p-4">
              <h3 className="mb-2 font-black text-slate-200">Packet Queue</h3>
              <div className="flex flex-wrap gap-2">
                {queue.slice(0, 14).map((color, index) => (
                  <div
                    key={`${color}-${index}`}
                    className="h-5 w-8 rounded-md"
                    style={{
                      backgroundColor: COLOR_META[color].hex,
                      boxShadow: `0 0 10px ${COLOR_META[color].hex}`,
                    }}
                  />
                ))}
                {queue.length === 0 && packets.length === 0 && <span className="font-bold text-slate-500">Queue empty</span>}
              </div>
            </div>

            <button
              type="button"
              onClick={setupRound}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.45)] transition hover:-translate-y-1 hover:bg-cyan-200"
            >
              <RotateCcw size={20} /> New Network
            </button>

            <div className="rounded-2xl bg-slate-900 p-3 text-center text-sm font-semibold text-slate-400">
              Select a packet color, set its route, save it, then execute the full routing table.
              Short safe routes earn more stars.
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
