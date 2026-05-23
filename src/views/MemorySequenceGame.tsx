import MemorySequenceLogic from '../components/MemorySequenceLogic';

interface MemorySequenceGameProps {
  onBack: () => void;
}

export default function MemorySequenceGame({ onBack }: MemorySequenceGameProps) {
  return <MemorySequenceLogic onBack={onBack} />;
}
