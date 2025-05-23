
import { Target } from 'lucide-react';
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
        "relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-visible cursor-pointer",
        "clickable-element shadow-xl",
        roundActive ? "pointer-events-auto" : ""
      )}
      style={{ 
        transform: `scale(${scale})`,
        transition: 'transform 150ms ease-out',
        background: 'linear-gradient(135deg, #FF69B4, #D946EF)',
      }}
    >
      {/* Main Circle Icon/Content - Using the provided avatar image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src="/lovable-uploads/7d108e50-92ba-4ab1-b24f-7732c35cd587.png" 
          alt="Avatar"
          className="w-56 h-56 object-cover rounded-full"
        />
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
