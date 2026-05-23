import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BatteryCharging,
  Bot,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  RotateCcw,
  Satellite,
  ShieldAlert,
  Star,
  Zap,
} from "lucide-react";

type GameProps = {
  userAge: number;
  onGameComplete: (stars: number) => void;
};

type Direction = "up" | "right" | "down" | "left";
type Command = "forward" | "left" | "right";
type Phase = "memory" | "programming" | "executing" | "complete";
type Mode = "easy" | "multi-goal" | "combat";

type Point = {
  row: number;
  col: number;
};

type DecorTile = Point & {
  icon: "rock" | "satellite";
};

type TrapTile = Point & {
  icon: "lava" | "zap";
};

type BotState = Point & {
  direction: Direction;
};

const DIRS: Record<Direction, Point> = {
  up: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

const DIRECTION_ROTATION: Record<Direction, number> = {
  up: 0,
  right: 90,
  down: 180,
  left: -90,
};

const COMMAND_META: Record<
  Command,
  {
    label: string;
    short: string;
    icon: string;
    color: string;
  }
> = {
  forward: {
    label: "Move Forward",
    short: "Forward",
    icon: "⬆️",
    color: "bg-emerald-400 text-emerald-950",
  },
  right: {
    label: "Turn Right",
    short: "Right",
    icon: "↪️",
    color: "bg-cyan-400 text-cyan-950",
  },
  left: {
    label: "Turn Left",
    short: "Left",
    icon: "↩️",
    color: "bg-yellow-300 text-yellow-950",
  },
};

function samePoint(a: Point, b: Point) {
  return a.row === b.row && a.col === b.col;
}

function pointKey(point: Point) {
  return `${point.row}-${point.col}`;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function turnLeft(direction: Direction): Direction {
  const order: Direction[] = ["up", "left", "down", "right"];
  return order[(order.indexOf(direction) + 1) % order.length];
}

function turnRight(direction: Direction): Direction {
  const order: Direction[] = ["up", "right", "down", "left"];
  return order[(order.indexOf(direction) + 1) % order.length];
}

function directionBetween(a: Point, b: Point): Direction {
  if (b.row < a.row) return "up";
  if (b.row > a.row) return "down";
  if (b.col > a.col) return "right";
  return "left";
}

function commandsFromPath(path: Point[], startDirection: Direction): Command[] {
  const commands: Command[] = [];
  let currentDirection = startDirection;

  for (let i = 0; i < path.length - 1; i++) {
    const neededDirection = directionBetween(path[i], path[i + 1]);

    while (currentDirection !== neededDirection) {
      const rightTurn = turnRight(currentDirection);

      if (rightTurn === neededDirection) {
        commands.push("right");
        currentDirection = rightTurn;
      } else {
        commands.push("left");
        currentDirection = turnLeft(currentDirection);
      }
    }

    commands.push("forward");
  }

  return commands;
}

function generateEasyPath(size: number): Point[] {
  const row = randomInt(0, size - 1);
  const startCol = 0;
  const endCol = randomInt(2, size - 1);

  return Array.from({ length: endCol - startCol + 1 }, (_, index) => ({
    row,
    col: startCol + index,
  }));
}

function generatePath(size: number, targetLength: number): Point[] {
  for (let attempt = 0; attempt < 120; attempt++) {
    const start: Point = { row: randomInt(0, size - 1), col: 0 };
    const path: Point[] = [start];
    const visited = new Set([pointKey(start)]);

    while (path.length < targetLength) {
      const current = path[path.length - 1];
      const candidates = shuffle([
        { row: current.row - 1, col: current.col },
        { row: current.row + 1, col: current.col },
        { row: current.row, col: current.col + 1 },
        { row: current.row, col: current.col - 1 },
      ]).filter(
        (point) =>
          point.row >= 0 &&
          point.row < size &&
          point.col >= 0 &&
          point.col < size &&
          !visited.has(pointKey(point))
      );

      if (candidates.length === 0) break;

      const preferred =
        candidates.find((point) => point.col > current.col) ?? candidates[0];

      path.push(preferred);
      visited.add(pointKey(preferred));
    }

    if (path.length >= targetLength && path[path.length - 1].col >= size - 2) {
      return path;
    }
  }

  return generateSimpleSnakePath(size, targetLength);
}

function generateSimpleSnakePath(size: number, targetLength: number): Point[] {
  const path: Point[] = [];
  const startRow = randomInt(0, size - 1);

  for (let col = 0; col < size; col++) {
    path.push({ row: startRow, col });
  }

  let row = startRow;

  while (path.length < targetLength) {
    const moveDown = row < size - 1;
    const nextRow = moveDown ? row + 1 : row - 1;

    if (nextRow < 0 || nextRow >= size) break;

    row = nextRow;
    path.push({ row, col: size - 1 });
  }

  return path.slice(0, targetLength);
}

export default function DinoBotProgrammer({
  userAge,
  onGameComplete,
}: GameProps) {
  const completedRef = useRef(false);
  const runTimerRef = useRef<number | null>(null);

  const config = useMemo(() => {
    if (userAge < 6) {
      return {
        size: 4,
        pathLength: 4,
        commands: ["forward"] as Command[],
        memoryMs: 5000,
        hintAlwaysVisible: true,
        traps: 0,
        mode: "easy" as Mode,
      };
    }

    if (userAge <= 8) {
      return {
        size: 5,
        pathLength: 8,
        commands: ["forward", "left", "right"] as Command[],
        memoryMs: 5200,
        hintAlwaysVisible: false,
        traps: 3,
        mode: "multi-goal" as Mode,
      };
    }

    return {
      size: 6,
      pathLength: 12,
      commands: ["forward", "left", "right"] as Command[],
      memoryMs: 4800,
      hintAlwaysVisible: false,
      traps: 5,
      mode: "combat" as Mode,
    };
  }, [userAge]);

  const [path, setPath] = useState<Point[]>([]);
  const [goal, setGoal] = useState<Point>({ row: 0, col: 0 });
  const [bot, setBot] = useState<BotState>({
    row: 0,
    col: 0,
    direction: "right",
  });
  const [startBot, setStartBot] = useState<BotState>({
    row: 0,
    col: 0,
    direction: "right",
  });
  const [solution, setSolution] = useState<Command[]>([]);
  const [program, setProgram] = useState<Command[]>([]);
  const [phase, setPhase] = useState<Phase>("memory");
  const [flashIndex, setFlashIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [decor, setDecor] = useState<DecorTile[]>([]);
  const [traps, setTraps] = useState<TrapTile[]>([]);
  const [checkpoints, setCheckpoints] = useState<Point[]>([]);
  const [collectedCheckpoints, setCollectedCheckpoints] = useState(0);
  const [visitedCheckpointKeys, setVisitedCheckpointKeys] = useState<Set<string>>(
    () => new Set()
  );
  const [weapon, setWeapon] = useState<Point | null>(null);
  const [hasWeapon, setHasWeapon] = useState(false);
  const [monster, setMonster] = useState<Point | null>(null);
  const [monsterAlive, setMonsterAlive] = useState(true);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("Watch the safe path!");

  function createRound() {
    if (runTimerRef.current) {
      window.clearTimeout(runTimerRef.current);
    }

    const nextPath =
      config.mode === "easy"
        ? generateEasyPath(config.size)
        : generatePath(config.size, config.pathLength);

    const first = nextPath[0];
    const second = nextPath[1] ?? { row: first.row, col: first.col + 1 };
    const startDirection = directionBetween(first, second);
    const nextStartBot = { ...first, direction: startDirection };
    const nextGoal = nextPath[nextPath.length - 1];
    const nextSolution = commandsFromPath(nextPath, startDirection);

    const nextCheckpoints =
      config.mode === "multi-goal"
        ? [
            nextPath[Math.floor(nextPath.length * 0.38)],
            nextPath[Math.floor(nextPath.length * 0.66)],
          ].filter(
            (point, index, arr) =>
              point &&
              !samePoint(point, first) &&
              !samePoint(point, nextGoal) &&
              arr.findIndex((item) => samePoint(item, point)) === index
          )
        : [];

    const nextWeapon =
      config.mode === "combat"
        ? nextPath[Math.max(1, Math.floor(nextPath.length * 0.28))]
        : null;

    const nextMonster =
      config.mode === "combat"
        ? nextPath[Math.max(2, Math.floor(nextPath.length * 0.62))]
        : null;

    const pathKeys = new Set(nextPath.map(pointKey));
    const specialKeys = new Set([
      ...nextCheckpoints.map(pointKey),
      nextWeapon ? pointKey(nextWeapon) : "",
      nextMonster ? pointKey(nextMonster) : "",
    ]);

    const emptyCells: Point[] = [];

    for (let row = 0; row < config.size; row++) {
      for (let col = 0; col < config.size; col++) {
        const point = { row, col };
        const key = pointKey(point);

        if (!pathKeys.has(key) && !specialKeys.has(key)) {
          emptyCells.push(point);
        }
      }
    }

    const trapCells = shuffle(emptyCells).slice(0, config.traps);
    const decorCells = shuffle(
      emptyCells.filter(
        (cell) => !trapCells.some((trap) => samePoint(trap, cell))
      )
    ).slice(0, Math.floor(config.size * 0.9));

    setPath(nextPath);
    setGoal(nextGoal);
    setBot(nextStartBot);
    setStartBot(nextStartBot);
    setSolution(nextSolution);
    setProgram([]);
    setPhase("memory");
    setFlashIndex(0);
    setShowHint(true);
    setMistakes(0);
    setCheckpoints(nextCheckpoints);
    setCollectedCheckpoints(0);
    setVisitedCheckpointKeys(new Set());
    setWeapon(nextWeapon);
    setHasWeapon(false);
    setMonster(nextMonster);
    setMonsterAlive(config.mode === "combat");
    setMessage(
      config.mode === "easy"
        ? "Watch the safe path!"
        : config.mode === "multi-goal"
          ? "Watch the path and collect stars in order!"
          : "Watch the path: collect weapon, clear monster, reach goal!"
    );

    setDecor(
      decorCells.map((cell, index) => ({
        ...cell,
        icon: index % 2 === 0 ? "rock" : "satellite",
      }))
    );

    setTraps(
      trapCells.map((cell, index) => ({
        ...cell,
        icon: index % 2 === 0 ? "lava" : "zap",
      }))
    );

    completedRef.current = false;
  }

  useEffect(() => {
    createRound();

    return () => {
      if (runTimerRef.current) window.clearTimeout(runTimerRef.current);
    };
  }, [userAge]);

  useEffect(() => {
    if (phase !== "memory" || path.length === 0) return;

    const interval = window.setInterval(() => {
      setFlashIndex((current) => (current + 1) % path.length);
    }, 320);

    const timeout = window.setTimeout(() => {
      setPhase("programming");
      setShowHint(config.hintAlwaysVisible);
      setMessage(
        config.mode === "easy"
          ? "Use Forward blocks to guide Dino-Bot!"
          : config.mode === "multi-goal"
            ? "Build the program. Visit each star in order, then reach the goal."
            : "Build the program. Get the weapon before the monster!"
      );
    }, config.memoryMs);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [phase, path, config.memoryMs, config.hintAlwaysVisible, config.mode]);

  function addCommand(command: Command) {
    if (phase !== "programming") return;
    setProgram((current) => [...current, command]);
    setMessage("Program blocks added!");
  }

  function removeLastCommand() {
    if (phase !== "programming") return;
    setProgram((current) => current.slice(0, -1));
  }

  function clearProgram() {
    if (phase !== "programming") return;
    setProgram([]);
  }

  function isTrap(point: Point) {
    return traps.some((trap) => samePoint(trap, point));
  }

  function failRun(text: string) {
    setMistakes((current) => current + 1);

    runTimerRef.current = window.setTimeout(() => {
      setPhase("programming");
      setBot(startBot);
      setCollectedCheckpoints(0);
      setVisitedCheckpointKeys(new Set());
      setHasWeapon(false);
      setMonsterAlive(config.mode === "combat");
      setMessage(text);
    }, 520);
  }

  function runProgram() {
    if (phase !== "programming" || program.length === 0) return;

    setPhase("executing");
    setMessage("Running Dino-Bot program...");
    setBot(startBot);
    setCollectedCheckpoints(0);
    setVisitedCheckpointKeys(new Set());
    setHasWeapon(false);
    setMonsterAlive(config.mode === "combat");

    let currentBot = { ...startBot };
    let currentCollected = 0;
    let currentVisited = new Set<string>();
    let currentHasWeapon = false;
    let currentMonsterAlive = config.mode === "combat";
    let index = 0;

    const step = () => {
      if (index >= program.length) {
        const reachedGoal = samePoint(currentBot, goal);
        const checkpointSuccess =
          config.mode !== "multi-goal" || currentCollected >= checkpoints.length;
        const combatSuccess =
          config.mode !== "combat" || !currentMonsterAlive || currentHasWeapon;
        const success = reachedGoal && checkpointSuccess && combatSuccess;

        if (success) {
          setPhase("complete");
          setMessage("Program success! Dino-Bot reached the goal!");

          if (!completedRef.current) {
            completedRef.current = true;
            const efficient = program.length <= solution.length + 3;
            const stars =
              mistakes === 0 && efficient
                ? 3
                : mistakes <= 1 && program.length <= solution.length + 6
                  ? 2
                  : 1;

            onGameComplete(stars);
          }
        } else {
          failRun(
            !reachedGoal
              ? "Not quite! Dino-Bot did not reach the goal."
              : config.mode === "multi-goal"
                ? "You reached the goal, but missed a star checkpoint."
                : "You reached the goal, but the monster was not cleared."
          );
        }

        return;
      }

      const command = program[index];

      if (command === "left") {
        currentBot = { ...currentBot, direction: turnLeft(currentBot.direction) };
      }

      if (command === "right") {
        currentBot = { ...currentBot, direction: turnRight(currentBot.direction) };
      }

      if (command === "forward") {
        const delta = DIRS[currentBot.direction];
        const nextPoint = {
          row: currentBot.row + delta.row,
          col: currentBot.col + delta.col,
        };

        const outOfBounds =
          nextPoint.row < 0 ||
          nextPoint.row >= config.size ||
          nextPoint.col < 0 ||
          nextPoint.col >= config.size;

        if (outOfBounds) {
          setBot({ ...currentBot, ...nextPoint });
          failRun("Dino-Bot left the grid! Try a safer program.");
          return;
        }

        if (isTrap(nextPoint)) {
          setBot({ ...currentBot, ...nextPoint });
          failRun("Zap! A trap reset Dino-Bot. Try again!");
          return;
        }

        if (config.mode === "multi-goal") {
          const expected = checkpoints[currentCollected];
          const nextCheckpoint = checkpoints.find((point) => samePoint(point, nextPoint));

          if (nextCheckpoint) {
            const key = pointKey(nextCheckpoint);

            if (expected && samePoint(nextPoint, expected)) {
              currentVisited = new Set([...currentVisited, key]);
              currentCollected += 1;
              setVisitedCheckpointKeys(new Set(currentVisited));
              setCollectedCheckpoints(currentCollected);
              setMessage(`Star ${currentCollected}/${checkpoints.length} collected!`);
            } else if (!currentVisited.has(key)) {
              setBot({ ...currentBot, ...nextPoint });
              failRun("Stars must be collected in order!");
              return;
            }
          }
        }

        if (config.mode === "combat" && weapon && samePoint(nextPoint, weapon)) {
          currentHasWeapon = true;
          setHasWeapon(true);
          setMessage("Weapon collected! Monster can be cleared now.");
        }

        if (
          config.mode === "combat" &&
          monster &&
          currentMonsterAlive &&
          samePoint(nextPoint, monster)
        ) {
          if (!currentHasWeapon) {
            setBot({ ...currentBot, ...nextPoint });
            failRun("Monster blocked Dino-Bot! Find the weapon first.");
            return;
          }

          currentMonsterAlive = false;
          setMonsterAlive(false);
          setMessage("Monster cleared! Continue to the goal.");
        }

        currentBot = { ...currentBot, ...nextPoint };
      }

      setBot(currentBot);
      index += 1;
      runTimerRef.current = window.setTimeout(step, 520);
    };

    runTimerRef.current = window.setTimeout(step, 420);
  }

  const pathKeys = useMemo(() => new Set(path.map(pointKey)), [path]);
  const flashKey = path[flashIndex] ? pointKey(path[flashIndex]) : "";
  const programLimit = solution.length + 8;

  const tileGap = config.size <= 4 ? "gap-3" : config.size <= 5 ? "gap-2.5" : "gap-2";
  const botSize = config.size <= 4 ? 54 : config.size <= 5 ? 48 : 42;
  const iconSize = config.size <= 4 ? 38 : config.size <= 5 ? 34 : 30;

  return (
    <div className="min-h-[680px] w-full rounded-3xl bg-slate-900 p-4 text-white shadow-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="rounded-3xl border border-cyan-400/30 bg-slate-950 p-4 text-center shadow-[0_0_30px_rgba(34,211,238,0.18)]">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Dino-Bot Programmer
          </p>
          <h2 className="mt-1 text-2xl font-black">
            Memorize the safe path, then code the robot!
          </h2>
          <p className="mt-1 font-semibold text-slate-300">{message}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[2rem] border border-cyan-400/30 bg-slate-950 p-4 shadow-[inset_0_0_36px_rgba(34,211,238,0.12)]">
            <div
              className={`mx-auto grid max-w-[620px] ${tileGap}`}
              style={{
                gridTemplateColumns: `repeat(${config.size}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: config.size * config.size }).map((_, index) => {
                const row = Math.floor(index / config.size);
                const col = index % config.size;
                const point = { row, col };
                const key = `${row}-${col}`;
                const isPath = pathKeys.has(key);
                const isFlash = phase === "memory" && key === flashKey;
                const isGoal = samePoint(point, goal);
                const hasBot = bot.row === row && bot.col === col;
                const trap = traps.find((item) => item.row === row && item.col === col);
                const decorTile = decor.find(
                  (item) => item.row === row && item.col === col
                );
                const checkpointIndex = checkpoints.findIndex((item) =>
                  samePoint(item, point)
                );
                const isCheckpoint = checkpointIndex >= 0;
                const checkpointDone = visitedCheckpointKeys.has(key);
                const isWeapon = weapon && samePoint(weapon, point);
                const isMonster = monster && monsterAlive && samePoint(monster, point);

                return (
                  <div
                    key={key}
                    className={`relative aspect-square rounded-2xl border ${
                      isFlash
                        ? "border-cyan-200 bg-cyan-300/70 shadow-[0_0_20px_rgba(34,211,238,0.9)]"
                        : showHint && isPath
                          ? "border-cyan-400/30 bg-cyan-400/20"
                          : "border-cyan-400/20 bg-slate-900"
                    }`}
                  >
                    {decorTile?.icon === "satellite" && (
                      <Satellite
                        size={22}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 opacity-45"
                      />
                    )}

                    {decorTile?.icon === "rock" && (
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl opacity-40">
                        🪨
                      </span>
                    )}

                    {trap?.icon === "lava" && (
                      <ShieldAlert
                        size={iconSize}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 drop-shadow opacity-70"
                      />
                    )}

                    {trap?.icon === "zap" && (
                      <Zap
                        size={iconSize}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-300 drop-shadow opacity-70"
                      />
                    )}

                    {isCheckpoint && (
                      <motion.div
                        animate={
                          checkpointDone
                            ? { scale: [1, 1.18, 1], rotate: [0, 8, -8, 0] }
                            : { scale: [1, 1.08, 1] }
                        }
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className={`absolute inset-0 flex items-center justify-center ${
                          checkpointDone ? "text-emerald-300" : "text-yellow-300"
                        }`}
                        style={{
                          filter: "drop-shadow(0 0 10px rgba(250,204,21,0.9))",
                        }}
                      >
                        <Star size={iconSize + 4} fill="currentColor" />
                        <span className="absolute text-xs font-black text-slate-950">
                          {checkpointIndex + 1}
                        </span>
                      </motion.div>
                    )}

                    {isWeapon && !hasWeapon && (
                      <motion.div
                        animate={{ scale: [1, 1.12, 1], rotate: [-5, 5, -5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 flex items-center justify-center text-3xl"
                      >
                        ⚔️
                      </motion.div>
                    )}

                    {isMonster && (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], rotate: [-6, 6, -6] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="absolute inset-0 flex items-center justify-center text-3xl"
                      >
                        👾
                      </motion.div>
                    )}

                    {isGoal && (
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.12, 1] }}
                        transition={{
                          rotate: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                          },
                          scale: {
                            duration: 1.3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }}
                        className="absolute inset-0 flex items-center justify-center text-yellow-300"
                        style={{
                          filter: "drop-shadow(0 0 10px rgba(250,204,21,0.9))",
                        }}
                      >
                        {userAge < 6 ? (
                          <Star size={iconSize + 4} />
                        ) : (
                          <BatteryCharging size={iconSize + 4} />
                        )}
                      </motion.div>
                    )}

                    <AnimatePresence>
                      {hasBot && (
                        <motion.div
                          layout
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            rotate: DIRECTION_ROTATION[bot.direction],
                          }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 18 }}
                          className="absolute inset-0 flex items-center justify-center text-cyan-300"
                          style={{
                            filter: "drop-shadow(0 0 12px rgba(34,211,238,1))",
                          }}
                        >
                          <Bot size={botSize} strokeWidth={2.8} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[2rem] border border-cyan-400/30 bg-slate-950 p-4 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
            <div>
              <h3 className="mb-3 text-xl font-black text-cyan-200">
                Action Blocks
              </h3>

              <div className="grid gap-3">
                {config.commands.map((command) => (
                  <button
                    key={command}
                    type="button"
                    onClick={() => addCommand(command)}
                    disabled={
                      phase !== "programming" || program.length >= programLimit
                    }
                    className={`rounded-2xl px-4 py-3 text-left font-black shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 ${COMMAND_META[command].color}`}
                  >
                    <span className="mr-2 text-2xl">
                      {COMMAND_META[command].icon}
                    </span>
                    {COMMAND_META[command].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-black text-cyan-200">Program Strip</h3>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-sm font-bold text-cyan-200">
                  {program.length}/{programLimit}
                </span>
              </div>

              <div className="flex min-h-24 flex-wrap gap-2 rounded-2xl border border-dashed border-cyan-400/30 bg-slate-950 p-3">
                {program.length === 0 && (
                  <div className="flex w-full items-center justify-center text-sm font-semibold text-slate-500">
                    Add command blocks here
                  </div>
                )}

                {program.map((command, index) => (
                  <motion.div
                    key={`${command}-${index}`}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`rounded-xl px-3 py-2 text-sm font-black ${COMMAND_META[command].color}`}
                  >
                    {COMMAND_META[command].icon} {COMMAND_META[command].short}
                  </motion.div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={removeLastCommand}
                  disabled={phase !== "programming" || program.length === 0}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 font-bold text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                  Undo
                </button>

                <button
                  type="button"
                  onClick={clearProgram}
                  disabled={phase !== "programming" || program.length === 0}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-700 px-4 py-3 font-bold text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={runProgram}
              disabled={phase !== "programming" || program.length === 0}
              className="flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-6 py-4 text-xl font-black text-white shadow-[0_0_20px_rgba(236,72,153,0.55)] transition hover:-translate-y-1 hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CirclePlay size={26} />
              RUN
            </button>

            <button
              type="button"
              onClick={createRound}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.4)] transition hover:-translate-y-1 hover:bg-cyan-200"
            >
              <RotateCcw size={20} />
              New Mission
            </button>

            <div className="rounded-2xl bg-slate-900 p-3 text-center text-sm font-semibold text-slate-300">
              {phase === "memory" && "Memory phase: glowing tiles show the route."}
              {phase === "programming" &&
                (config.mode === "easy"
                  ? `Tip: the safe solution uses ${solution.length} command blocks.`
                  : config.mode === "multi-goal"
                    ? `Collect stars in order: ${collectedCheckpoints}/${checkpoints.length}. Solution uses ${solution.length} blocks.`
                    : hasWeapon
                      ? `Weapon ready. Clear the monster, then reach the goal. Solution uses ${solution.length} blocks.`
                      : `Find the weapon before the monster. Solution uses ${solution.length} blocks.`)}
              {phase === "executing" && "Dino-Bot is following your program..."}
              {phase === "complete" && "Mission complete! Dino-Bot reached the goal."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}