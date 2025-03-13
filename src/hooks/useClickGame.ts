
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
  const lastBounceTime = useRef(0);
  
  const gameConfig: GameConfig = {
    maxTargets: 5, // User requested 5 targets per round
    animationSpeed: 15, // Base speed increased further, from 10 to 15
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
  
  // Schedule more frequent direction changes
  const scheduleDirectionChange = () => {
    // Clear any existing timer
    if (changeDirectionTimer) {
      clearTimeout(changeDirectionTimer);
    }
    
    // Set a new timer to change direction randomly
    // More frequent direction changes for harder gameplay
    const changeInterval = Math.max(150, 600 - (roundsCompleted * 100));
    const timer = setTimeout(() => {
      // Wider range of direction changes
      const currentAngle = Math.atan2(direction.dy, direction.dx);
      const angleChange = (Math.random() * Math.PI / 1.5) - Math.PI / 3; // Max 60 degrees change
      const newAngle = currentAngle + angleChange;
      
      // Apply higher speed
      const newSpeed = Math.max(10, gameConfig.animationSpeed * speedMultiplier * (1 + (roundsCompleted * 0.2)));
      setDirection({
        dx: Math.cos(newAngle) * newSpeed,
        dy: Math.sin(newAngle) * newSpeed
      });
      
      scheduleDirectionChange(); // Schedule the next change
    }, changeInterval + Math.random() * 300); // Less predictable timing
    
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
  
  // Enhanced animation with jitter, continuous acceleration and improved bounce
  const animateTarget = () => {
    if (!mainCircleRef.current || !roundActive) return;
    
    const mainCircle = mainCircleRef.current.getBoundingClientRect();
    const centerX = mainCircle.width / 2;
    const centerY = mainCircle.height / 2;
    // Slightly increased safe area for better bounce detection
    const radius = (mainCircle.width / 2) * 0.85 - (gameConfig.targetSize / 2) - EDGE_PADDING;
    
    // Add random jitter for less predictable motion
    const jitterFactor = Math.min(0.2, 0.1 + roundsCompleted * 0.02);
    const jitterX = (Math.random() * 2 - 1) * jitterFactor;
    const jitterY = (Math.random() * 2 - 1) * jitterFactor;
    
    // Occasionally add sudden movement bursts
    const now = Date.now();
    if (now - lastBounceTime.current > 1000) { // Once per second chance for speed burst
      if (Math.random() < 0.1) { // 10% chance of sudden direction change
        const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
        const burstAngle = Math.random() * 2 * Math.PI;
        setDirection({
          dx: Math.cos(burstAngle) * currentSpeed * 1.3, // 30% faster
          dy: Math.sin(burstAngle) * currentSpeed * 1.3
        });
        lastBounceTime.current = now;
      }
    }
    
    setTargetPosition(prev => {
      // Calculate new position with controlled jitter
      let newX = prev.x + direction.dx + jitterX;
      let newY = prev.y + direction.dy + jitterY;
      
      // Calculate distance from center
      const dx = newX - centerX;
      const dy = newY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If target would go outside the circle, bounce it back with improved detection
      if (distance > radius) {
        // Calculate the normal vector to the circle at the point of intersection
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Calculate the reflection using the normal vector with improved bounce algorithm
        const bounce = calculateBounce(direction.dx, direction.dy, nx, ny);
        
        // Update direction with randomness for unpredictable bounces
        const randomFactor = 1 + (Math.random() * 0.2 - 0.1); // ±10% variation
        setDirection({
          dx: bounce.dx * randomFactor,
          dy: bounce.dy * randomFactor
        });
        
        // Place the target exactly at the edge of the valid area plus a bit inward
        const safeDistance = radius - 5;
        newX = centerX + safeDistance * nx;
        newY = centerY + safeDistance * ny;
        
        // Update the last bounce time
        lastBounceTime.current = now;
      }
      
      return { x: newX, y: newY };
    });
    
    // Request next animation frame
    animationRef.current = requestAnimationFrame(animateTarget);
  };
  
  // Start a new round of the game
  const startRound = () => {
    // Reset the last bounce time when starting a new round
    lastBounceTime.current = 0;
    
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
