
import { useState, useRef, useEffect } from 'react';
import { useTokens } from '@/context/TokenContext';
import { Position, GameState, GameConfig } from './game/types';
import { 
  generateRandomPosition, 
  generateRandomDirection, 
  calculateBounce 
} from './game/animationUtils';
import { 
  startRound as startRoundLogic, 
  handleTargetClick as handleTargetClickLogic,
  handleMainCircleClick as handleMainCircleClickLogic
} from './game/gameLogic';

// Add a padding value to prevent edge glitches
const EDGE_PADDING = 5;

// Re-export types correctly with 'export type'
export type { Position, GameState, GameConfig };

export const useClickGame = (containerRef: React.RefObject<HTMLDivElement>, mainCircleRef: React.RefObject<HTMLDivElement>) => {
  const { addTokens } = useTokens();
  const [scale, setScale] = useState(1);
  const [consecutiveClicks, setConsecutiveClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Game state
  const [roundActive, setRoundActive] = useState(false);
  const [targetsHit, setTargetsHit] = useState(0);
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, y: 0 });
  const [showTarget, setShowTarget] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [direction, setDirection] = useState({ dx: 0, dy: 0 });
  const [changeDirectionTimer, setChangeDirectionTimer] = useState<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  
  const gameConfig: GameConfig = {
    maxTargets: 5, // User requested 5 targets per round
    animationSpeed: 2, // Base speed - will be multiplied by speedMultiplier
    targetSize: 48, // Size of the breast target in pixels
  };

  // Reset consecutive clicks if user hasn't clicked for a while
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      if (Date.now() - lastClickTime > 2000 && consecutiveClicks > 0) {
        setConsecutiveClicks(0);
      }
    }, 2000);
    
    return () => clearTimeout(resetTimer);
  }, [lastClickTime, consecutiveClicks]);
  
  // Schedule periodic direction changes
  const scheduleDirectionChange = () => {
    // Clear any existing timer
    if (changeDirectionTimer) {
      clearTimeout(changeDirectionTimer);
    }
    
    // Set a new timer to change direction randomly
    // Make direction changes more frequent as rounds increase
    const changeInterval = Math.max(300, 1000 - (roundsCompleted * 100));
    const timer = setTimeout(() => {
      // Don't change direction too drastically to avoid glitches
      const currentAngle = Math.atan2(direction.dy, direction.dx);
      const angleChange = (Math.random() * Math.PI / 2) - Math.PI / 4; // Max 45 degrees change
      const newAngle = currentAngle + angleChange;
      
      const newSpeed = Math.max(1.5, gameConfig.animationSpeed * speedMultiplier * (1 + (roundsCompleted * 0.2)));
      setDirection({
        dx: Math.cos(newAngle) * newSpeed,
        dy: Math.sin(newAngle) * newSpeed
      });
      
      scheduleDirectionChange(); // Schedule the next change
    }, changeInterval + Math.random() * 1000);
    
    setChangeDirectionTimer(timer);
  };
  
  // Clean up the direction change timer
  useEffect(() => {
    return () => {
      if (changeDirectionTimer) {
        clearTimeout(changeDirectionTimer);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [changeDirectionTimer]);
  
  // Animate the target with the current direction - make it smoother on edges
  const animateTarget = () => {
    if (!mainCircleRef.current || !roundActive) return;
    
    const mainCircle = mainCircleRef.current.getBoundingClientRect();
    const centerX = mainCircle.width / 2;
    const centerY = mainCircle.height / 2;
    const radius = (mainCircle.width / 2) * 0.8 - (gameConfig.targetSize / 2) - EDGE_PADDING;
    
    // Add some random jitter to the movement for higher difficulties
    // Reduce jitter for smoother motion
    const jitterFactor = Math.min(0.3, roundsCompleted * 0.05);
    const jitterX = (Math.random() * 2 - 1) * jitterFactor;
    const jitterY = (Math.random() * 2 - 1) * jitterFactor;
    
    setTargetPosition(prev => {
      // Calculate new position with controlled jitter
      let newX = prev.x + direction.dx + jitterX;
      let newY = prev.y + direction.dy + jitterY;
      
      // Calculate distance from center
      const dx = newX - centerX;
      const dy = newY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If target would go outside the circle, bounce it back
      if (distance > radius) {
        // Calculate the normal vector to the circle at the point of intersection
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Calculate the reflection using the normal vector
        const bounce = calculateBounce(direction.dx, direction.dy, nx, ny);
        
        // Update direction with slight randomness to prevent repetitive patterns
        const randomFactor = 1 + (Math.random() * 0.2 - 0.1); // ±10% variation
        setDirection({
          dx: bounce.dx * randomFactor,
          dy: bounce.dy * randomFactor
        });
        
        // Place the target exactly at the edge of the valid area plus a bit inward
        // to prevent getting stuck on the edge
        const safeDistance = radius - 2;
        newX = centerX + safeDistance * nx;
        newY = centerY + safeDistance * ny;
      }
      
      return { x: newX, y: newY };
    });
    
    // Always ensure animation continues to run by immediately requesting next frame
    animationRef.current = requestAnimationFrame(animateTarget);
  };
  
  // Start a new round of the game
  const startRound = () => {
    startRoundLogic(
      setRoundActive,
      setTargetsHit,
      setRoundScore,
      setSpeedMultiplier,
      setDirection,
      setTargetPosition,
      setShowTarget,
      scheduleDirectionChange,
      animateTarget,
      roundsCompleted,
      mainCircleRef,
      animationRef
    );
  };
  
  // Start animation when target becomes visible or when round is active
  useEffect(() => {
    if (showTarget && roundActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animateTarget);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showTarget, roundActive]);
  
  // Handle clicking on the breast target
  const handleTargetClick = (e: React.MouseEvent) => {
    handleTargetClickLogic(
      e,
      containerRef,
      setLastClickTime,
      lastClickTime,
      setConsecutiveClicks,
      consecutiveClicks,
      setRoundScore,
      addTokens,
      setTargetsHit,
      targetsHit,
      gameConfig,
      setRoundsCompleted,
      setSpeedMultiplier,
      setTargetPosition,
      mainCircleRef,
      animationRef,
      animateTarget
    );
  };
  
  // Handle clicking on the main circle (base click)
  const handleMainCircleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMainCircleClickLogic(
      e,
      roundActive,
      setScale,
      containerRef,
      addTokens,
      startRound
    );
  };

  return {
    gameState: {
      roundActive,
      targetsHit,
      targetPosition,
      showTarget,
      roundScore,
      consecutiveClicks,
      lastClickTime,
      scale
    },
    gameConfig,
    handleTargetClick,
    handleMainCircleClick
  };
};
