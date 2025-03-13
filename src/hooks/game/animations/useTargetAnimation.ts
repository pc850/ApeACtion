
import { useRef, useEffect } from 'react';
import { Position } from '../types';
import { generateRandomDirection } from '../animationUtils';
import { animateTargetFrame } from './targetCore';
import { 
  createDirectionChangeScheduler, 
  createForceMovementChecker,
  createStallDetector 
} from './directionUtils';

interface UseTargetAnimationProps {
  targetPosition: Position;
  setTargetPosition: React.Dispatch<React.SetStateAction<Position>>;
  direction: { dx: number; dy: number };
  setDirection: React.Dispatch<React.SetStateAction<{ dx: number; dy: number }>>;
  roundActive: boolean;
  showTarget: boolean;
  speedMultiplier: number;
  roundsCompleted: number;
  currentLevel: number;
  getCurrentLevelConfig: () => any;
  mainCircleRef: React.RefObject<HTMLDivElement>;
  gameConfig: {
    targetSize: number;
    animationSpeed: number;
  };
}

export const useTargetAnimation = ({
  targetPosition,
  setTargetPosition,
  direction,
  setDirection,
  roundActive,
  showTarget,
  speedMultiplier,
  roundsCompleted,
  currentLevel,
  getCurrentLevelConfig,
  mainCircleRef,
  gameConfig
}: UseTargetAnimationProps) => {
  const animationRef = useRef<number | null>(null);
  const lastBounceTime = useRef(0);
  const lastMovementTime = useRef(Date.now());
  
  // Direction change controller - no random changes for DVD movement
  const { scheduleDirectionChange, changeDirectionTimer } = createDirectionChangeScheduler(
    setDirection,
    direction,
    currentLevel,
    roundsCompleted,
    getCurrentLevelConfig,
    gameConfig,
    speedMultiplier
  );
  
  // Force movement controller - adjusted for DVD-like movement
  const { setupForceMovementCheck, forceMovementInterval } = createForceMovementChecker(
    setDirection,
    direction,
    roundActive,
    speedMultiplier,
    getCurrentLevelConfig,
    gameConfig,
    roundsCompleted,
    lastMovementTime
  );
  
  // Stall detection controller - adjusted for DVD-like movement
  const { setupStallDetection, stallDetectionInterval, lastPositionRef } = createStallDetector(
    setDirection,
    setTargetPosition,
    targetPosition,
    roundActive,
    showTarget,
    getCurrentLevelConfig,
    gameConfig,
    speedMultiplier,
    currentLevel,
    roundsCompleted
  );
  
  // The main animation function - pure DVD-like animation
  const animateTarget = () => {
    if (!mainCircleRef.current || !roundActive || !showTarget) return;
    
    // Get current level config
    const levelConfig = getCurrentLevelConfig();
    const targetSize = levelConfig.targetSize;
    
    // DVD-like animation - constant predictable movement with perfect bounces
    const result = animateTargetFrame(
      targetPosition,
      direction,
      mainCircleRef,
      targetSize,
      currentLevel,
      roundsCompleted
    );
    
    // Update position
    setTargetPosition(result.newPosition);
    
    // If we had a bounce, update direction
    if (result.didBounce && result.newDirection) {
      setDirection(result.newDirection);
      lastBounceTime.current = Date.now();
    }
    
    // Update last movement time
    lastMovementTime.current = Date.now();
    
    // Request next animation frame
    animationRef.current = requestAnimationFrame(animateTarget);
  };

  // Start animation when component becomes active
  useEffect(() => {
    if (showTarget && roundActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      // Initialize with a random direction if not already set
      if (direction.dx === 0 && direction.dy === 0) {
        setDirection(generateRandomDirection(speedMultiplier, roundsCompleted));
      }
      
      // Start the animation
      animationRef.current = requestAnimationFrame(animateTarget);
      
      // Start direction change scheduling
      scheduleDirectionChange();
      
      // Setup continuous movement checks
      setupForceMovementCheck();
      setupStallDetection();
      
      // Initialize movement timestamp and position ref
      lastMovementTime.current = Date.now();
      lastPositionRef.current = targetPosition;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showTarget, roundActive, direction, speedMultiplier]);

  // Clean up all timers
  useEffect(() => {
    return () => {
      if (changeDirectionTimer) {
        clearTimeout(changeDirectionTimer);
      }
      if (forceMovementInterval) {
        clearInterval(forceMovementInterval);
      }
      if (stallDetectionInterval) {
        clearInterval(stallDetectionInterval);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    animateTarget,
    scheduleDirectionChange,
    animationRef
  };
};
