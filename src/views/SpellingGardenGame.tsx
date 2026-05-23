import SpellingGarden from '../components/SpellingGarden';
import { usePlayer } from '../context/PlayerContext';

interface Props {
  onBack: () => void;
}

export default function SpellingGardenGame({ onBack }: Props) {
  const { age, addStars } = usePlayer();

  return (
    <div>
      <button
        onClick={onBack}
        className="m-4 rounded-2xl bg-white px-4 py-2 font-black text-emerald-700 shadow hover:bg-emerald-50"
      >
        ← Back to Dashboard
      </button>

      <SpellingGarden
        userAge={age}
        onGameComplete={(stars) => {
          addStars(stars);
        }}
      />
    </div>
  );
}