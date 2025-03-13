
import { CircleUser } from 'lucide-react';
import { cn } from '@/lib/utils';
import BreastTarget from './BreastTarget';
import { Position } from '@/hooks/useClickGame';

interface MainCircleProps {
  scale: number;
  roundActive: boolean;
  showTarget: boolean;
  targetPosition: Position;
  targetSize: number;
  onCircleClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTargetClick: (e: React.MouseEvent) => void;
  mainCircleRef: React.RefObject<HTMLDivElement>;
}

const MainCircle = ({
  scale,
  roundActive,
  showTarget,
  targetPosition,
  targetSize,
  onCircleClick,
  onTargetClick,
  mainCircleRef
}: MainCircleProps) => {
  return (
    <div
      ref={mainCircleRef}
      onClick={onCircleClick}
      className={cn(
        "relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden cursor-pointer",
        "clickable-element shadow-xl",
        roundActive && "pointer-events-none opacity-90"
      )}
      style={{ 
        transform: `scale(${scale})`,
        transition: 'transform 150ms ease-out',
        background: 'linear-gradient(135deg, #FF69B4, #D946EF)',
      }}
    >
      {/* Main Circle Icon/Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <CircleUser className="w-32 h-32 text-white/80" />
      </div>
      
      {/* Breast Target */}
      {showTarget && roundActive && (
        <BreastTarget 
          position={targetPosition} 
          size={targetSize} 
          onClick={onTargetClick} 
        />
      )}
      
      {/* Pulsing Effect */}
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-soft pointer-events-none" />
      
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-transparent opacity-70 pointer-events-none" />
    </div>
  );
};

export default MainCircle;
