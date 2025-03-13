
import { Target } from 'lucide-react';
import { Position } from '@/hooks/useClickGame';

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
      className="absolute rounded-full bg-[#FFDEE2] cursor-pointer hover:scale-105 transition-transform z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 10px rgba(217, 70, 239, 0.5)',
        pointerEvents: 'auto', // Ensure clicks are always detected
      }}
    >
      {/* Inner circle for nipple effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#D946EF]" />
      
      {/* Add areola effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF9AAA]"
        style={{
          width: `${size * 0.6}px`,
          height: `${size * 0.6}px`,
          opacity: 0.7
        }}
      />
      
      {/* Small highlights to give 3D effect */}
      <div 
        className="absolute rounded-full bg-white" 
        style={{
          width: `${size * 0.15}px`,
          height: `${size * 0.15}px`,
          top: `${size * 0.2}px`,
          left: `${size * 0.2}px`,
          opacity: 0.3
        }}
      />
      
      {/* Secondary highlight for more dimension */}
      <div 
        className="absolute rounded-full bg-white" 
        style={{
          width: `${size * 0.1}px`,
          height: `${size * 0.1}px`,
          top: `${size * 0.5}px`,
          left: `${size * 0.6}px`,
          opacity: 0.2
        }}
      />
      
      {/* Target indicator */}
      <div className="absolute -top-1 -right-1">
        <Target className="w-4 h-4 text-primary animate-pulse" />
      </div>
    </div>
  );
};

export default BreastTarget;
