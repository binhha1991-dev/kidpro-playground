export interface ThemeItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface GameTheme {
  name: string;
  items: ThemeItem[];
  bgColor: string;
  accentColor: string;
}

// Fruits theme
const FruitApple = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="48" fill="#EF4444"/>
    <path d="M 50 15 Q 45 10 50 5 Q 55 10 50 15" fill="#22C55E"/>
    <circle cx="35" cy="35" r="8" fill="#FFFFFF" opacity="0.4"/>
  </svg>
);

const FruitBanana = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M 20 70 Q 30 20 80 30" stroke="#FBBF24" strokeWidth="20" fill="none" strokeLinecap="round"/>
    <circle cx="85" cy="28" r="6" fill="#92400E"/>
  </svg>
);

const FruitGrapes = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="30" cy="30" r="12" fill="#A855F7"/>
    <circle cx="50" cy="25" r="12" fill="#A855F7"/>
    <circle cx="70" cy="30" r="12" fill="#A855F7"/>
    <circle cx="40" cy="48" r="12" fill="#A855F7"/>
    <circle cx="60" cy="48" r="12" fill="#A855F7"/>
    <circle cx="50" cy="65" r="12" fill="#A855F7"/>
    <path d="M 50 15 L 55 5" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const FruitCitrus = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="45" fill="#FB923C"/>
    <circle cx="50" cy="50" r="40" fill="#FDBA74"/>
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={i} x1="50" y1="50" x2={50 + 35 * Math.cos((i * Math.PI) / 4)} y2={50 + 35 * Math.sin((i * Math.PI) / 4)} stroke="#FB923C" strokeWidth="2"/>
    ))}
  </svg>
);

const FruitStrawberry = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M 50 20 L 60 35 L 65 50 Q 65 70 50 75 Q 35 70 35 50 L 40 35 Z" fill="#EC4899"/>
    <circle cx="42" cy="40" r="3" fill="#FBBF24"/>
    <circle cx="50" cy="38" r="3" fill="#FBBF24"/>
    <circle cx="58" cy="40" r="3" fill="#FBBF24"/>
    <circle cx="45" cy="50" r="3" fill="#FBBF24"/>
    <circle cx="55" cy="50" r="3" fill="#FBBF24"/>
    <path d="M 45 18 L 50 10 L 55 18" fill="#22C55E"/>
  </svg>
);

export const FRUITS_THEME: GameTheme = {
  name: 'Fruits',
  items: [
    { id: 'apple', label: 'Apple', icon: <FruitApple /> },
    { id: 'banana', label: 'Banana', icon: <FruitBanana /> },
    { id: 'grapes', label: 'Grapes', icon: <FruitGrapes /> },
    { id: 'citrus', label: 'Citrus', icon: <FruitCitrus /> },
    { id: 'strawberry', label: 'Strawberry', icon: <FruitStrawberry /> },
  ],
  bgColor: 'from-amber-50 to-orange-50',
  accentColor: 'text-orange-600',
};

// Cosmic theme
const CosmicStar = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <filter id="glow-star">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <polygon points="50,10 61,40 92,40 67,60 78,90 50,70 22,90 33,60 8,40 39,40" fill="#FCD34D" filter="url(#glow-star)"/>
  </svg>
);

const CosmicHeart = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <filter id="glow-heart">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path d="M50 85 C20 70 10 55 10 40 C10 25 20 15 30 15 C40 15 50 25 50 25 C50 25 60 15 70 15 C80 15 90 25 90 40 C90 55 80 70 50 85 Z" fill="#F472B6" filter="url(#glow-heart)"/>
  </svg>
);

const CosmicCircle = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <filter id="glow-circle">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="40" fill="#10B981" filter="url(#glow-circle)"/>
    <circle cx="50" cy="50" r="30" fill="#6EE7B7" opacity="0.5"/>
  </svg>
);

const CosmicSquare = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <filter id="glow-square">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect x="15" y="15" width="70" height="70" fill="#3B82F6" filter="url(#glow-square)" rx="5"/>
    <rect x="25" y="25" width="50" height="50" fill="#93C5FD" opacity="0.4" rx="3"/>
  </svg>
);

const CosmicTriangle = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <filter id="glow-triangle">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <polygon points="50,15 85,80 15,80" fill="#8B5CF6" filter="url(#glow-triangle)"/>
    <polygon points="50,25 75,75 25,75" fill="#DDD6FE" opacity="0.5"/>
  </svg>
);

export const COSMIC_THEME: GameTheme = {
  name: 'Cosmic',
  items: [
    { id: 'star', label: 'Star', icon: <CosmicStar /> },
    { id: 'heart', label: 'Heart', icon: <CosmicHeart /> },
    { id: 'circle', label: 'Circle', icon: <CosmicCircle /> },
    { id: 'square', label: 'Square', icon: <CosmicSquare /> },
    { id: 'triangle', label: 'Triangle', icon: <CosmicTriangle /> },
  ],
  bgColor: 'from-indigo-50 to-blue-50',
  accentColor: 'text-indigo-600',
};

// Animals theme
const AnimalCat = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="55" r="35" fill="#F59E0B"/>
    <circle cx="35" cy="35" r="8" fill="#F59E0B"/>
    <circle cx="65" cy="35" r="8" fill="#F59E0B"/>
    <polygon points="30,25 25,10 35,20" fill="#F59E0B"/>
    <polygon points="70,25 75,10 65,20" fill="#F59E0B"/>
    <circle cx="40" cy="50" r="4" fill="#000"/>
    <circle cx="60" cy="50" r="4" fill="#000"/>
    <path d="M 50 60 L 45 68 M 50 60 L 50 70 M 50 60 L 55 68" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const AnimalPuppy = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="60" r="30" fill="#D97706"/>
    <circle cx="50" cy="45" r="25" fill="#D97706"/>
    <circle cx="32" cy="38" r="10" fill="#D97706"/>
    <circle cx="68" cy="38" r="10" fill="#D97706"/>
    <circle cx="40" cy="45" r="5" fill="#000"/>
    <circle cx="60" cy="45" r="5" fill="#000"/>
    <ellipse cx="50" cy="65" rx="6" ry="8" fill="#FCD34D"/>
  </svg>
);

const AnimalPanda = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="35" fill="#FFFFFF"/>
    <circle cx="35" cy="40" r="12" fill="#000"/>
    <circle cx="65" cy="40" r="12" fill="#000"/>
    <circle cx="50" cy="70" r="8" fill="#000"/>
    <circle cx="40" cy="48" r="4" fill="#FFFFFF"/>
    <circle cx="60" cy="48" r="4" fill="#FFFFFF"/>
  </svg>
);

const AnimalChick = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="55" r="30" fill="#FCD34D"/>
    <circle cx="50" cy="35" r="22" fill="#FCD34D"/>
    <circle cx="40" cy="32" r="5" fill="#000"/>
    <circle cx="60" cy="32" r="5" fill="#000"/>
    <polygon points="55,42 65,45 55,50" fill="#FB923C"/>
    <polygon points="45,70 40,80 50,75" fill="#FB923C"/>
    <polygon points="55,70 60,80 50,75" fill="#FB923C"/>
  </svg>
);

const AnimalBunny = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="60" r="28" fill="#F3E8FF"/>
    <circle cx="50" cy="40" r="22" fill="#F3E8FF"/>
    <ellipse cx="38" cy="20" rx="8" ry="18" fill="#F3E8FF"/>
    <ellipse cx="62" cy="20" rx="8" ry="18" fill="#F3E8FF"/>
    <circle cx="40" cy="38" r="4" fill="#000"/>
    <circle cx="60" cy="38" r="4" fill="#000"/>
    <circle cx="50" cy="50" r="3" fill="#000"/>
    <path d="M 48 56 L 46 62 M 50 58 L 50 64 M 52 56 L 54 62" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const ANIMALS_THEME: GameTheme = {
  name: 'Animals',
  items: [
    { id: 'cat', label: 'Cat', icon: <AnimalCat /> },
    { id: 'puppy', label: 'Puppy', icon: <AnimalPuppy /> },
    { id: 'panda', label: 'Panda', icon: <AnimalPanda /> },
    { id: 'chick', label: 'Chick', icon: <AnimalChick /> },
    { id: 'bunny', label: 'Bunny', icon: <AnimalBunny /> },
  ],
  bgColor: 'from-rose-50 to-pink-50',
  accentColor: 'text-rose-600',
};

export const ALL_THEMES = [FRUITS_THEME, COSMIC_THEME, ANIMALS_THEME];

export function getRandomTheme(): GameTheme {
  return ALL_THEMES[Math.floor(Math.random() * ALL_THEMES.length)];
}
