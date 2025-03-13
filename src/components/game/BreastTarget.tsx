
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
      {/* Use the provided breast cartoon image */}
      <img 
        src="/lovable-uploads/56fe55c3-6006-450d-8d92-b7b4b0ce3fc9.png"
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
