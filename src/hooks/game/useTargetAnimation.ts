
import { useRef, useEffect } from 'react';
import { Position } from './types';
import { 
  generateRandomDirection, 
  calculateBounce, 
  ensureMinimumSpeed, 
  applyRandomAcceleration 
} from './animationUtils';

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

// Add a padding value to prevent edge glitches
const EDGE_PADDING = 5;

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
  const changeDirectionTimer = useRef<NodeJS.Timeout | null>(null);
  const lastMovementTime = useRef(Date.now());
  const forcedMovementTimer = useRef<NodeJS.Timeout | null>(null); // NEW: Timer to force movement

  // Schedule more frequent direction changes
  const scheduleDirectionChange = () => {
    // Clear any existing timer
    if (changeDirectionTimer.current) {
      clearTimeout(changeDirectionTimer.current);
    }
    
    // Get current level config
    const levelConfig = getCurrentLevelConfig();
    
    // IMPROVED: Set a new timer to change direction randomly - much more frequently now
    // DECREASED: Even shorter intervals between direction changes
    const baseChangeInterval = 300 - (currentLevel * 75); // Decreased from 400ms
    const changeInterval = Math.max(50, baseChangeInterval - (roundsCompleted * 50)); // Decreased minimum to 50ms
    const timer = setTimeout(() => {
      // Wider range of direction changes
      const currentAngle = Math.atan2(direction.dy, direction.dx);
      const angleChange = (Math.random() * Math.PI) - Math.PI/2; // INCREASED: Even wider range of angles
      const newAngle = currentAngle + angleChange;
      
      // Apply higher speed based on level
      const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
      const levelSpeedMultiplier = levelConfig.speedMultiplier;
      const minSpeed = gameConfig.animationSpeed * speedMultiplier * levelSpeedMultiplier * 1.3; // INCREASED: Higher minimum speed
      const newSpeed = Math.max(currentSpeed, minSpeed);
      
      setDirection({
        dx: Math.cos(newAngle) * newSpeed,
        dy: Math.sin(newAngle) * newSpeed
      });
      
      scheduleDirectionChange(); // Schedule the next change
    }, changeInterval + Math.random() * 100); // Less predictable timing
    
    changeDirectionTimer.current = timer;
  };
  
  // NEW: Set up a recurring timer to force movement 
  const setupForcedMovementCheck = () => {
    if (forcedMovementTimer.current) {
      clearInterval(forcedMovementTimer.current);
    }
    
    // Check very frequently if target is moving too slow
    const timer = setInterval(() => {
      if (!roundActive) return;
      
      const levelConfig = getCurrentLevelConfig();
      const minRequiredSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier;
      
      // Ensure target is moving at adequate speed
      const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
      if (currentSpeed < minRequiredSpeed * 0.8) { // If below 80% of expected speed
        const newDirection = generateRandomDirection(speedMultiplier * 1.2, roundsCompleted);
        setDirection(newDirection);
        lastMovementTime.current = Date.now();
      }
      
      // Randomly apply acceleration to create more varied movement
      if (Math.random() < 0.3) { // 30% chance each check
        const acceleratedDirection = applyRandomAcceleration(direction.dx, direction.dy);
        setDirection(acceleratedDirection);
      }
    }, 100); // Check every 100ms
    
    forcedMovementTimer.current = timer;
  };
  
  // Enhanced animation with jitter, continuous acceleration and improved bounce
  const animateTarget = () => {
    if (!mainCircleRef.current || !roundActive) return;
    
    // Check time since last position update
    const now = Date.now();
    const timeSinceLastUpdate = now - lastMovementTime.current;
    
    // If no motion for more than 80ms (reduced from 150ms), force a strong direction change
    if (timeSinceLastUpdate > 80) {
      const levelConfig = getCurrentLevelConfig();
      const minSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier * 2.0; // Double minimum speed
      const newDirection = generateRandomDirection(speedMultiplier * 2.0, roundsCompleted); // Double speed multiplier
      setDirection(newDirection);
      lastMovementTime.current = now;
    }
    
    // Get current level config
    const levelConfig = getCurrentLevelConfig();
    const targetSize = levelConfig.targetSize;
    
    const mainCircle = mainCircleRef.current.getBoundingClientRect();
    const centerX = mainCircle.width / 2;
    const centerY = mainCircle.height / 2;
    const radius = (mainCircle.width / 2) * 0.85 - (targetSize / 2) - EDGE_PADDING;
    
    // INCREASED: Add stronger random jitter for less predictable motion
    const jitterFactor = Math.min(0.6, 0.25 + (currentLevel * 0.05) + (roundsCompleted * 0.02)); // Increased from 0.4
    const jitterX = (Math.random() * 2 - 1) * jitterFactor;
    const jitterY = (Math.random() * 2 - 1) * jitterFactor;
    
    // IMPROVED: More frequent sudden movement bursts
    const burstInterval = Math.max(200, 500 - (currentLevel * 80)); // Shortened from 300ms
    if (now - lastBounceTime.current > burstInterval) {
      const burstChance = 0.3 + (currentLevel * 0.05); // Higher chance (increased from 0.2)
      if (Math.random() < burstChance) {
        const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
        const burstAngle = Math.random() * 2 * Math.PI;
        const burstMultiplier = 1.8 + (currentLevel * 0.15); // Stronger burst (increased from 1.6)
        setDirection({
          dx: Math.cos(burstAngle) * currentSpeed * burstMultiplier,
          dy: Math.sin(burstAngle) * currentSpeed * burstMultiplier
        });
        lastBounceTime.current = now;
      }
    }
    
    // IMPROVED: More aggressive minimum speed check
    const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
    const minSpeedMultiplier = levelConfig.speedMultiplier * 1.5; // Increased from 1.3
    const minSpeed = gameConfig.animationSpeed * speedMultiplier * minSpeedMultiplier;
    
    if (currentSpeed < minSpeed) {
      const newDirection = ensureMinimumSpeed(direction.dx, direction.dy, minSpeed * 1.5); // Higher boost
      setDirection(newDirection);
    }
    
    // Update last movement time
    lastMovementTime.current = now;
    
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
        
        // INCREASED: Higher random factor for more unpredictable bounces
        const randomFactor = 1 + (Math.random() * (0.5 + currentLevel * 0.06) - 0.2); 
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
    
    // Request next animation frame - store reference so we can cancel it later
    animationRef.current = requestAnimationFrame(animateTarget);
  };

  // Ensure animation continues even when component re-renders
  useEffect(() => {
    if (showTarget && roundActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animateTarget);
      
      // Start direction change scheduling
      scheduleDirectionChange();
      
      // NEW: Setup forced movement check
      setupForcedMovementCheck();
      
      // Initialize movement timestamp
      lastMovementTime.current = Date.now();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showTarget, roundActive]);

  // Clean up the timers
  useEffect(() => {
    return () => {
      if (changeDirectionTimer.current) {
        clearTimeout(changeDirectionTimer.current);
      }
      if (forcedMovementTimer.current) {
        clearInterval(forcedMovementTimer.current);
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
