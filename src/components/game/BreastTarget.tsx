
import { Target } from 'lucide-react';
import { Position } from '@/hooks/game/types';

interface BreastTargetProps {
  position: Position;
  size: number;
  onClick: (e: React.MouseEvent) => void;
}

const BreastTarget = ({ position, size, onClick }: BreastTargetProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
    onClick(e);
  };

  return (
    <div
      onClick={handleClick}
      className="absolute cursor-pointer hover:scale-105 transition-transform z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto', // Ensure clicks are always detected
      }}
    >
      {/* Use the provided breast image */}
      <img 
        src="/lovable-uploads/94e1915d-9252-41d5-a4a0-ab6115956b7f.png"
        alt="Breast Target"
        className="w-full h-full object-contain"
      />
      
      {/* Target indicator */}
      <div className="absolute -top-1 -right-1">
        <Target className="w-4 h-4 text-primary animate-pulse" />
      </div>
    </div>
  );
};

export default BreastTarget;
