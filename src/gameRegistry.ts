import type { ComponentType } from 'react';
import type { GameProps } from './gameProps';

import DinoAuditor from './games/DinoAuditor';
import WordHunter from './games/WordHunter';
import PatternBuilder from './games/PatternBuilder';
import DinoBotProgrammer from './games/DinoBotProgrammer';
import TangleLengthGame from './games/TangleLengthGame';
import GearConnectLogicSvg from './games/GearConnectLogicSvg';
import CipherMachine from './games/CipherMachine';
import BinaryPowerLab from './games/BinaryPowerLab';
import CyberRoutingExpertPro from './games/CyberRoutingExpertPro';
import SortingFactoryProMax from './games/SortingFactoryProMax';
import CyberFirewallPro from './games/CyberFirewallPro';
import SpellingGarden from './games/SpellingGarden';
import MagicMathBalance from './games/MagicMathBalance';
import MemorySequence from './games/MemorySequence';

export type GameCategory = 'Logic & Memory' | 'Words & Language' | 'Numbers & Shapes';

export type GameStatus = 'ready' | 'wip' | 'hidden';

export type GameId = string;

type LegacyViewComponent = ComponentType<{ onBack: () => void }>;

type StandaloneGameComponent = ComponentType<GameProps>;


export type GameRegistryItem = {
  id: GameId;
  title: string;
  description: string;
  category: GameCategory;
  icon: string;
  status: GameStatus;
  component: LegacyViewComponent | StandaloneGameComponent;
  legacyView?: boolean;
  notes?: string;
};

export const games: GameRegistryItem[] = [
  {
    id: 'binary-power-lab',
    title: 'Binary Power Lab',
    description: 'Build and decode numbers with binary light switches.',
    category: 'Numbers & Shapes',
    icon: '💡',
    status: 'ready',
    component: BinaryPowerLab,
  },
  {
    id: 'cyber-routing-pro',
    title: 'Cyber Routing Pro',
    description: 'Plan router paths and guide data packets to the right servers.',
    category: 'Logic & Memory',
    icon: '📡',
    status: 'ready',
    component: CyberRoutingExpertPro,
  },
  {
    id: 'sorting-factory-pro-max',
    title: 'Sorting Factory',
    description: 'Sort robots from shortest to tallest using smart neighbor swaps.',
    category: 'Logic & Memory',
    icon: '🤖',
    status: 'ready',
    component: SortingFactoryProMax,
  },
  {
    id: 'cyber-firewall-pro',
    title: 'Cyber Firewall',
    description: 'Let safe data pass and block viruses with a moving firewall gate.',
    category: 'Logic & Memory',
    icon: '🛡️',
    status: 'ready',
    component: CyberFirewallPro,
  },
  {
    id: 'cipher-machine',
    title: 'Cipher Machine',
    description: 'Use a decoder disk to unlock secret words.',
    category: 'Words & Language',
    icon: '🔐',
    status: 'ready',
    component: CipherMachine,
  },
  {
    id: 'gear-connect-logic',
    title: 'Gear Connect Logic',
    description: 'Build a gear machine and run it to power the goal device.',
    category: 'Logic & Memory',
    icon: '⚙️',
    status: 'ready',
    component: GearConnectLogicSvg,
  },

  {
    id: 'pattern-builder',
    title: 'Pattern Builder',
    description: 'Complete the missing pattern.',
    category: 'Logic & Memory',
    icon: '🚂',
    status: 'ready',
    component: PatternBuilder,
    notes: 'Needs deeper pattern pool and better replayability.',
  },
  {
    id: 'word-hunter',
    title: 'Word Hunter',
    description: 'Find hidden words in the dinosaur grid.',
    category: 'Words & Language',
    icon: '🔍',
    status: 'ready',
    component: WordHunter,
    notes: 'Needs larger vocabulary pool and better themes.',
  },
  {
    id: 'dino-auditor',
    title: 'Dino Auditor',
    description: 'Count fossils carefully and choose the correct total.',
    category: 'Numbers & Shapes',
    icon: '🦖',
    status: 'wip',
    component: DinoAuditor,
    notes: 'Needs more counting modes and better question variety.',
  },
  {
    id: 'dino-bot',
    title: 'Dino Bot Programmer',
    description: 'Memorize paths and program your robot to reach the goal.',
    category: 'Logic & Memory',
    icon: '🤖',
    status: 'ready',
    component: DinoBotProgrammer,
    notes: 'Strong concept, needs tutorial/progression polish.',
  },
  {
    id: 'memory-sequence',
    title: 'Memory Sequence',
    description: 'Watch the pattern light up, then repeat it back.',
    category: 'Logic & Memory',
    icon: '🧠',
    status: 'ready',
    component: MemorySequence,
  },
  {
    id: 'magic-math-balance',
    title: 'Magic Math Balance',
    description: 'Balance a magical scale by adding the perfect amount.',
    category: 'Numbers & Shapes',
    icon: '⚖️',
    status: 'ready',
    component: MagicMathBalance,
  },
  {
    id: 'spelling-garden',
    title: 'Spelling Garden',
    description: 'Help flowers grow by spelling words with floating letters.',
    category: 'Words & Language',
    icon: '🌸',
    status: 'ready',
    component: SpellingGarden,
    notes: 'Packaged into src/games. Needs bigger vocabulary structure later.',
  },
  {
    id: 'tangle-length',
    title: 'Tangle Length',
    description: 'Which rope is longest or shortest?',
    category: 'Logic & Memory',
    icon: '🧵',
    status: 'hidden',
    component: TangleLengthGame,
    notes: 'Replayability is currently low; keep for future redesign.',
  },
];

export const visibleGames = games.filter((game) => game.status !== 'hidden');

export const readyGames = games.filter((game) => game.status === 'ready');

export const wipGames = games.filter((game) => game.status === 'wip');

export const hiddenGames = games.filter((game) => game.status === 'hidden');
