
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
  
  // Direction change controller
  const { scheduleDirectionChange, changeDirectionTimer } = createDirectionChangeScheduler(
    setDirection,
    direction,
    currentLevel,
    roundsCompleted,
    getCurrentLevelConfig,
    gameConfig,
    speedMultiplier
  );
  
  // Force movement controller
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
  
  // Stall detection controller
  const { setupStallDetection, stallDetectionInterval, lastPositionRef } = createStallDetector(
    setDirection,
    setTargetPosition,
    targetPosition,
    roundActive,
    showTarget,
    getCurrentLevelConfig,
    gameConfig,
    speedMultiplier,
    currentLevel
  );
  
  // The main animation function
  const animateTarget = () => {
    if (!mainCircleRef.current || !roundActive) return;
    
    // Check time since last position update
    const now = Date.now();
    const timeSinceLastUpdate = now - lastMovementTime.current;
    
    // If no motion for more than 50ms, force a strong direction change
    if (timeSinceLastUpdate > 50) {
      const levelConfig = getCurrentLevelConfig();
      const minSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier * 3.0;
      const newDirection = generateRandomDirection(speedMultiplier * 3.0, roundsCompleted);
      setDirection(newDirection);
      lastMovementTime.current = now;
    }
    
    // Get current level config
    const levelConfig = getCurrentLevelConfig();
    const targetSize = levelConfig.targetSize;
    
    // More frequent sudden movement bursts
    const burstInterval = Math.max(100, 300 - (currentLevel * 80));
    if (now - lastBounceTime.current > burstInterval) {
      const burstChance = 0.5 + (currentLevel * 0.1);
      if (Math.random() < burstChance) {
        const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
        const burstAngle = Math.random() * 2 * Math.PI;
        const burstMultiplier = 2.5 + (currentLevel * 0.25);
        setDirection({
          dx: Math.cos(burstAngle) * currentSpeed * burstMultiplier,
          dy: Math.sin(burstAngle) * currentSpeed * burstMultiplier
        });
        lastBounceTime.current = now;
      }
    }
    
    // Calculate new position and handle bouncing
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
      lastBounceTime.current = now;
    }
    
    // Update last movement time
    lastMovementTime.current = now;
    
    // Request next animation frame
    animationRef.current = requestAnimationFrame(animateTarget);
  };

  // Start animation when component becomes active
  useEffect(() => {
    if (showTarget && roundActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
  }, [showTarget, roundActive]);

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
