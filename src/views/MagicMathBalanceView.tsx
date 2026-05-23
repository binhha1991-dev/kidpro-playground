import MagicMathBalance from '../components/MagicMathBalance';

interface MagicMathBalanceViewProps {
  onBack: () => void;
}

export default function MagicMathBalanceView({ onBack }: MagicMathBalanceViewProps) {
  return <MagicMathBalance onBack={onBack} />;
}
