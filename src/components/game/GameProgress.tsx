
import { Progress } from '@/components/ui/progress';

interface GameProgressProps {
  currentTargets: number;
  maxTargets: number;
}

const GameProgress = ({ currentTargets, maxTargets }: GameProgressProps) => {
  return (
    <div className="w-full max-w-xs mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Progress</span>
        <span>{currentTargets}/{maxTargets}</span>
      </div>
      <Progress value={(currentTargets / maxTargets) * 100} />
    </div>
  );
};

export default GameProgress;
