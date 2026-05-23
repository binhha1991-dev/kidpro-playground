export type AssetTheme = 'fruits' | 'animals' | 'gemstones';

export interface BalanceItem {
  id: string;
  label: string;
  weight: number;
  icon: React.ReactNode;
  color: string;
}

export interface Bundle {
  id: string;
  multiplier: number;
  label: string;
  icon: React.ReactNode;
}

// Fruits
export const StrawberryIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="55" r="35" fill="#EF4444"/>
    <path d="M 30 25 L 40 15 L 50 10 L 60 15 L 70 25 Q 50 20 30 25" fill="#22C55E"/>
    <circle cx="40" cy="50" r="5" fill="#FCD34D" opacity="0.6"/>
    <circle cx="60" cy="50" r="5" fill="#FCD34D" opacity="0.6"/>
    <circle cx="50" cy="65" r="5" fill="#FCD34D" opacity="0.6"/>
  </svg>
);

export const GrapeIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="35" cy="35" r="12" fill="#7C3AED"/>
    <circle cx="50" cy="30" r="12" fill="#7C3AED"/>
    <circle cx="65" cy="35" r="12" fill="#7C3AED"/>
    <circle cx="40" cy="50" r="12" fill="#7C3AED"/>
    <circle cx="55" cy="48" r="12" fill="#7C3AED"/>
    <circle cx="50" cy="65" r="12" fill="#7C3AED"/>
    <path d="M 50 18 L 50 10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const WatermelonIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="38" fill="#EF4444"/>
    <circle cx="50" cy="50" r="35" fill="#22C55E"/>
    <circle cx="35" cy="40" r="4" fill="#000"/>
    <circle cx="50" cy="45" r="4" fill="#000"/>
    <circle cx="65" cy="40" r="4" fill="#000"/>
    <circle cx="42" cy="60" r="4" fill="#000"/>
    <circle cx="58" cy="60" r="4" fill="#000"/>
  </svg>
);

// Animals
export const ChickIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="45" r="30" fill="#FCD34D"/>
    <circle cx="40" cy="35" r="8" fill="#FCD34D" opacity="0.7"/>
    <circle cx="60" cy="35" r="8" fill="#FCD34D" opacity="0.7"/>
    <circle cx="42" cy="32" r="3" fill="#000"/>
    <circle cx="58" cy="32" r="3" fill="#000"/>
    <polygon points="50,55 45,62 55,62" fill="#FB923C"/>
    <polygon points="35,50 30,52 35,54" fill="#FB923C"/>
  </svg>
);

export const PuppyIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="28" fill="#D97706"/>
    <circle cx="35" cy="30" r="12" fill="#D97706"/>
    <circle cx="65" cy="30" r="12" fill="#D97706"/>
    <circle cx="50" cy="35" r="6" fill="#D97706"/>
    <circle cx="45" cy="50" r="4" fill="#000"/>
    <circle cx="55" cy="50" r="4" fill="#000"/>
    <ellipse cx="50" cy="62" rx="6" ry="8" fill="#D97706"/>
    <circle cx="30" cy="65" r="4" fill="#D97706"/>
    <circle cx="70" cy="65" r="4" fill="#D97706"/>
  </svg>
);

export const PigletIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="32" fill="#F472B6"/>
    <circle cx="35" cy="35" r="8" fill="#F472B6"/>
    <circle cx="65" cy="35" r="8" fill="#F472B6"/>
    <ellipse cx="50" cy="55" rx="6" ry="8" fill="#F472B6"/>
    <circle cx="50" cy="65" r="5" fill="#F472B6"/>
    <circle cx="45" cy="48" r="3" fill="#000"/>
    <circle cx="55" cy="48" r="3" fill="#000"/>
    <circle cx="50" cy="60" r="2" fill="#000"/>
  </svg>
);

// Gemstones
export const RubyIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <polygon points="50,10 85,35 80,80 20,80 15,35" fill="#DC2626"/>
    <polygon points="50,10 85,35 50,55" fill="#EF4444" opacity="0.7"/>
    <polygon points="50,55 80,80 50,75" fill="#991B1B"/>
  </svg>
);

export const SapphireIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <polygon points="50,10 85,35 80,80 20,80 15,35" fill="#2563EB"/>
    <polygon points="50,10 85,35 50,55" fill="#60A5FA" opacity="0.7"/>
    <polygon points="50,55 80,80 50,75" fill="#1E40AF"/>
  </svg>
);

export const EmeraldIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <polygon points="50,10 85,35 80,80 20,80 15,35" fill="#059669"/>
    <polygon points="50,10 85,35 50,55" fill="#34D399" opacity="0.7"/>
    <polygon points="50,55 80,80 50,75" fill="#047857"/>
  </svg>
);

// Bundle icons
export const BundleItemIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="35" fill="#EF4444" opacity="0.8"/>
    <circle cx="50" cy="50" r="30" fill="#FFFFFF" opacity="0.3"/>
    <text x="50" y="60" fontSize="40" fontWeight="bold" textAnchor="middle" fill="#FFF">1</text>
  </svg>
);

export const BundleBagIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M 30 40 L 35 20 L 65 20 L 70 40 Q 70 60 50 70 Q 30 60 30 40" fill="#D97706" stroke="#B45309" strokeWidth="2"/>
    <path d="M 40 25 Q 50 15 60 25" stroke="#B45309" strokeWidth="2" fill="none"/>
    <text x="50" y="55" fontSize="28" fontWeight="bold" textAnchor="middle" fill="#FFF">5</text>
  </svg>
);

export const BundleBoxIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="20" y="25" width="60" height="55" fill="#92400E" stroke="#78350F" strokeWidth="2" rx="3"/>
    <rect x="25" y="30" width="50" height="45" fill="#B45309" rx="2"/>
    <line x1="50" y1="30" x2="50" y2="75" stroke="#78350F" strokeWidth="1"/>
    <line x1="25" y1="52" x2="75" y2="52" stroke="#78350F" strokeWidth="1"/>
    <text x="50" y="65" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#FFF">10</text>
  </svg>
);

// Basket SVG
export const BasketSVG = ({ side: _side }: { side: 'left' | 'right' }) => (
  <svg viewBox="0 0 150 120" className="w-full h-full">
    {/* Basket body */}
    <path
      d="M 20 40 L 30 20 L 120 20 L 130 40 L 130 100 Q 75 110 20 100 Z"
      fill="#D2691E"
      stroke="#8B4513"
      strokeWidth="2"
    />
    {/* Woven pattern */}
    <line x1="40" y1="20" x2="35" y2="100" stroke="#A0522D" strokeWidth="1" opacity="0.5"/>
    <line x1="60" y1="20" x2="55" y2="105" stroke="#A0522D" strokeWidth="1" opacity="0.5"/>
    <line x1="80" y1="20" x2="80" y2="105" stroke="#A0522D" strokeWidth="1" opacity="0.5"/>
    <line x1="100" y1="20" x2="105" y2="100" stroke="#A0522D" strokeWidth="1" opacity="0.5"/>
    <line x1="120" y1="20" x2="125" y2="95" stroke="#A0522D" strokeWidth="1" opacity="0.5"/>

    {/* Horizontal weave */}
    <line x1="25" y1="35" x2="130" y2="35" stroke="#A0522D" strokeWidth="0.8" opacity="0.4"/>
    <line x1="20" y1="50" x2="135" y2="50" stroke="#A0522D" strokeWidth="0.8" opacity="0.4"/>
    <line x1="15" y1="65" x2="135" y2="65" stroke="#A0522D" strokeWidth="0.8" opacity="0.4"/>
    <line x1="15" y1="80" x2="130" y2="80" stroke="#A0522D" strokeWidth="0.8" opacity="0.4"/>

    {/* Rim */}
    <ellipse cx="75" cy="20" rx="55" ry="12" fill="#8B4513" opacity="0.6"/>

    {/* Shadow */}
    <ellipse cx="75" cy="105" rx="55" ry="8" fill="#000" opacity="0.15"/>
  </svg>
);

export const FRUITS: BalanceItem[] = [
  { id: 'strawberry', label: 'Strawberry', weight: 1, icon: <StrawberryIcon />, color: 'from-red-50 to-red-100' },
  { id: 'grape', label: 'Grape', weight: 1, icon: <GrapeIcon />, color: 'from-purple-50 to-purple-100' },
  { id: 'watermelon', label: 'Watermelon', weight: 2, icon: <WatermelonIcon />, color: 'from-green-50 to-green-100' },
];

export const ANIMALS: BalanceItem[] = [
  { id: 'chick', label: 'Chick', weight: 1, icon: <ChickIcon />, color: 'from-yellow-50 to-yellow-100' },
  { id: 'puppy', label: 'Puppy', weight: 2, icon: <PuppyIcon />, color: 'from-orange-50 to-orange-100' },
  { id: 'piglet', label: 'Piglet', weight: 2, icon: <PigletIcon />, color: 'from-pink-50 to-pink-100' },
];

export const GEMSTONES: BalanceItem[] = [
  { id: 'ruby', label: 'Ruby', weight: 1, icon: <RubyIcon />, color: 'from-red-50 to-red-100' },
  { id: 'sapphire', label: 'Sapphire', weight: 1, icon: <SapphireIcon />, color: 'from-blue-50 to-blue-100' },
  { id: 'emerald', label: 'Emerald', weight: 2, icon: <EmeraldIcon />, color: 'from-emerald-50 to-emerald-100' },
];

export const THEMES = {
  fruits: FRUITS,
  animals: ANIMALS,
  gemstones: GEMSTONES,
};

export const BUNDLES: Bundle[] = [
  { id: 'single', multiplier: 1, label: 'Single', icon: <BundleItemIcon /> },
  { id: 'bag', multiplier: 5, label: 'Bag (x5)', icon: <BundleBagIcon /> },
  { id: 'box', multiplier: 10, label: 'Box (x10)', icon: <BundleBoxIcon /> },
];

export function BalanceItemVisual({ item, scale = 1 }: { item: BalanceItem; scale?: number }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-br ${item.color} border-2 border-white shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110`}
      style={{ transform: `scale(${scale})`, width: '3rem', height: '3rem' }}
    >
      <div className="w-8 h-8">{item.icon}</div>
    </div>
  );
}

export function BundleVisual({ bundle }: { bundle: Bundle }) {
  return (
    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300 shadow-md flex items-center justify-center cursor-pointer active:cursor-grabbing transition-transform hover:scale-110 hover:shadow-lg">
      <div className="w-12 h-12">{bundle.icon}</div>
    </div>
  );
}

export function SeesawScale({ tilt }: { tilt: number }) {
  return (
    <svg viewBox="0 0 500 320" className="w-full h-full">
      {/* Pole base */}
      <rect x="230" y="200" width="40" height="100" fill="#654321" rx="5"/>
      <ellipse cx="250" cy="200" rx="25" ry="15" fill="#8B4513"/>

      {/* Pivot point */}
      <circle cx="250" cy="200" r="15" fill="#3E2723"/>
      <circle cx="250" cy="200" r="10" fill="#5D4037"/>

      {/* Left plank */}
      <g transform={`rotate(${tilt} 250 200)`}>
        <rect x="80" y="180" width="170" height="40" fill="#D2691E" rx="8"/>
        <rect x="90" y="190" width="150" height="20" fill="#CD853F" rx="6"/>
      </g>

      {/* Right plank */}
      <g transform={`rotate(${-tilt} 250 200)`}>
        <rect x="250" y="180" width="170" height="40" fill="#D2691E" rx="8"/>
        <rect x="260" y="190" width="150" height="20" fill="#CD853F" rx="6"/>
      </g>

      {/* Ground */}
      <ellipse cx="250" cy="300" rx="180" ry="25" fill="#22C55E" opacity="0.3"/>
      <path d="M 70 300 Q 250 320 430 300" stroke="#16A34A" strokeWidth="3" fill="none" opacity="0.5"/>
    </svg>
  );
}

export function IntegratedBasketScale({ tilt }: { tilt: number; leftItems?: React.ReactNode; rightItems?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 600 350" className="w-full h-full">
      {/* Pole */}
      <rect x="280" y="180" width="40" height="120" fill="#654321" rx="5"/>
      <ellipse cx="300" cy="180" rx="30" ry="18" fill="#8B4513"/>

      {/* Pivot */}
      <circle cx="300" cy="180" r="18" fill="#3E2723"/>
      <circle cx="300" cy="180" r="12" fill="#5D4037"/>

      {/* Left arm with basket */}
      <g transform={`rotate(${tilt} 300 180)`}>
        <rect x="50" y="160" width="250" height="40" fill="#D2691E" rx="8"/>
        <rect x="60" y="170" width="230" height="20" fill="#CD853F" rx="6"/>

        {/* Left basket attachment point */}
        <g transform="translate(120, 200)">
          <foreignObject x="0" y="0" width="120" height="100">
            <div className="w-32 h-24" />
          </foreignObject>
        </g>
      </g>

      {/* Right arm with basket */}
      <g transform={`rotate(${-tilt} 300 180)`}>
        <rect x="300" y="160" width="250" height="40" fill="#D2691E" rx="8"/>
        <rect x="310" y="170" width="230" height="20" fill="#CD853F" rx="6"/>

        {/* Right basket attachment point */}
        <g transform="translate(380, 200)">
          <foreignObject x="0" y="0" width="120" height="100">
            <div className="w-32 h-24" />
          </foreignObject>
        </g>
      </g>

      {/* Ground */}
      <ellipse cx="300" cy="320" rx="220" ry="30" fill="#22C55E" opacity="0.3"/>
    </svg>
  );
}
