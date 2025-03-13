
import { useState, useRef, useEffect } from 'react';
import { useTokens } from '@/context/TokenContext';
import { createFloatingNumber } from '@/lib/animations';

// Position interface for the breast target
export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  roundActive: boolean;
  targetsHit: number;
  targetPosition: Position;
  showTarget: boolean;
  roundScore: number;
  consecutiveClicks: number;
  lastClickTime: number;
  scale: number;
}

export interface GameConfig {
  maxTargets: number;
  animationSpeed: number;
  targetSize: number;
}

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
  // Add a padding value to prevent edge glitches
  const edgePadding = 5;
  
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

  // Generate a random position within the main circle
  const generateRandomPosition = (): Position => {
    if (!mainCircleRef.current) return { x: 0, y: 0 };

    const mainCircle = mainCircleRef.current.getBoundingClientRect();
    const centerX = mainCircle.width / 2;
    const centerY = mainCircle.height / 2;
    // Reduce the usable radius to avoid spawning too close to the edge
    const radius = (mainCircle.width / 2) * 0.7; 
    
    // Generate random angle and distance from center (within the radius)
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    // Calculate position
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    
    return { x, y };
  };
  
  // Generate a random movement direction with smoother velocity
  const generateRandomDirection = () => {
    const angle = Math.random() * 2 * Math.PI;
    // Increase speed based on rounds completed, but ensure minimum speed
    const baseSpeed = Math.max(1.5, gameConfig.animationSpeed * speedMultiplier * (1 + (roundsCompleted * 0.2)));
    return {
      dx: Math.cos(angle) * baseSpeed,
      dy: Math.sin(angle) * baseSpeed
    };
  };
  
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
  
  // Smoother bounce algorithm for when the target hits the circle edge
  const calculateBounce = (dx: number, dy: number, nx: number, ny: number) => {
    // nx, ny is the normal vector to the edge
    const dot = dx * nx + dy * ny;
    return {
      dx: dx - 2 * dot * nx,
      dy: dy - 2 * dot * ny
    };
  };
  
  // Animate the target with the current direction - make it smoother on edges
  const animateTarget = () => {
    if (!mainCircleRef.current || !roundActive) return;
    
    const mainCircle = mainCircleRef.current.getBoundingClientRect();
    const centerX = mainCircle.width / 2;
    const centerY = mainCircle.height / 2;
    const radius = (mainCircle.width / 2) * 0.8 - (gameConfig.targetSize / 2) - edgePadding;
    
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
    setRoundActive(true);
    setTargetsHit(0);
    setRoundScore(0);
    
    // Set initial speed based on rounds completed
    setSpeedMultiplier(1 + (roundsCompleted * 0.3));
    
    // Generate initial direction and position
    setDirection(generateRandomDirection());
    setTargetPosition(generateRandomPosition());
    setShowTarget(true);
    
    // Schedule direction changes
    scheduleDirectionChange();
    
    // Start the animation
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animateTarget);
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
    e.stopPropagation();
    
    // Update scores
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    setLastClickTime(now);
    
    let tokensEarned = 2; // Base amount for hitting the target
    
    // Add bonus tokens for consecutive rapid hits
    if (timeSinceLastClick < 500) {
      setConsecutiveClicks(prev => prev + 1);
      
      if (consecutiveClicks >= 3) {
        tokensEarned += Math.min(Math.floor(consecutiveClicks / 3), 5);
      }
    } else {
      setConsecutiveClicks(1);
    }
    
    // Create floating number animation
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      createFloatingNumber(x, y, tokensEarned, containerRef.current);
    }
    
    // Update game state
    setRoundScore(prev => prev + tokensEarned);
    addTokens(tokensEarned);
    setTargetsHit(prev => prev + 1);
    
    // Check if round is complete
    if (targetsHit + 1 >= gameConfig.maxTargets) {
      // Increase rounds completed counter
      setRoundsCompleted(prev => prev + 1);
      
      // Don't end the round, just reset targets hit and show a new target
      setTimeout(() => {
        // Reset targets hit but keep the round active
        setTargetsHit(0);
        
        // Increase speed for the next round
        setSpeedMultiplier(prev => prev + 0.5);
        
        // Generate a new position for the target
        setTargetPosition(generateRandomPosition());
        
        // Keep animation running - important!
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(animateTarget);
      }, 300);
    } else {
      // Increase the speed multiplier for the next target
      setSpeedMultiplier(prev => prev + 0.3);
      
      // Spawn a new target after a short delay
      setTimeout(() => {
        setTargetPosition(generateRandomPosition());
        
        // Ensure animation continues - critical for movement
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(animateTarget);
      }, 200); // Reduced delay for faster gameplay
    }
  };
  
  // Handle clicking on the main circle (base click)
  const handleMainCircleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (roundActive) return; // Ignore clicks during active round
    
    // Animation effect
    setScale(0.95);
    setTimeout(() => setScale(1), 150);
    
    // Calculate base tokens
    let tokensToAdd = 1; // Base amount
    
    // Create floating number animation at click position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      createFloatingNumber(x, y, tokensToAdd, containerRef.current);
    }
    
    // Add tokens and start a new round
    addTokens(tokensToAdd);
    startRound();
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
