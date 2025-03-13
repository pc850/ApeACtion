
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
  const lastPositionRef = useRef<Position>({ x: 0, y: 0 });
  const forceMovementInterval = useRef<NodeJS.Timeout | null>(null); // Timer for constant checks
  const stallDetectionInterval = useRef<NodeJS.Timeout | null>(null); // Timer for stall detection

  // Schedule much more frequent direction changes
  const scheduleDirectionChange = () => {
    // Clear any existing timer
    if (changeDirectionTimer.current) {
      clearTimeout(changeDirectionTimer.current);
    }
    
    // Get current level config
    const levelConfig = getCurrentLevelConfig();
    
    // DRASTICALLY IMPROVED: Set a new timer to change direction much more frequently
    const baseChangeInterval = Math.max(200, 250 - (currentLevel * 75)); // Reduced interval
    const changeInterval = Math.max(30, baseChangeInterval - (roundsCompleted * 50)); // Min 30ms
    
    const timer = setTimeout(() => {
      // Wider range of direction changes
      const currentAngle = Math.atan2(direction.dy, direction.dx);
      const angleChange = (Math.random() * Math.PI) - Math.PI/2; 
      const newAngle = currentAngle + angleChange;
      
      // Apply much higher speed based on level
      const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
      const levelSpeedMultiplier = levelConfig.speedMultiplier;
      const minSpeed = gameConfig.animationSpeed * speedMultiplier * levelSpeedMultiplier * 1.8; // Higher speed
      const newSpeed = Math.max(currentSpeed, minSpeed);
      
      setDirection({
        dx: Math.cos(newAngle) * newSpeed,
        dy: Math.sin(newAngle) * newSpeed
      });
      
      scheduleDirectionChange(); // Schedule the next change
    }, changeInterval + Math.random() * 50); // Less predictable timing
    
    changeDirectionTimer.current = timer;
  };
  
  // Force movement every few milliseconds to ensure target never stops
  const setupForceMovementCheck = () => {
    if (forceMovementInterval.current) {
      clearInterval(forceMovementInterval.current);
    }
    
    // Check extremely frequently (every 20ms) to ensure constant motion
    const timer = setInterval(() => {
      if (!roundActive) return;
      
      const levelConfig = getCurrentLevelConfig();
      const minRequiredSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier * 1.5;
      
      // IMPROVED: Force acceleration randomly to create constant movement
      if (Math.random() < 0.6) { // 60% chance each check - much higher probability
        const acceleratedDirection = applyRandomAcceleration(direction.dx, direction.dy);
        setDirection(acceleratedDirection);
      }
      
      // Ensure target is moving at adequate speed
      const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
      if (currentSpeed < minRequiredSpeed) {
        const newDirection = generateRandomDirection(speedMultiplier * 1.5, roundsCompleted);
        setDirection(newDirection);
        lastMovementTime.current = Date.now();
      }
    }, 20); // Check every 20ms - much more frequent
    
    forceMovementInterval.current = timer;
  };
  
  // New function to detect and fix stalled targets
  const setupStallDetection = () => {
    if (stallDetectionInterval.current) {
      clearInterval(stallDetectionInterval.current);
    }
    
    // Check position changes extremely frequently
    const timer = setInterval(() => {
      if (!roundActive || !showTarget) return;
      
      // Calculate distance moved since last check
      const distX = Math.abs(targetPosition.x - lastPositionRef.current.x);
      const distY = Math.abs(targetPosition.y - lastPositionRef.current.y);
      const moved = Math.sqrt(distX * distX + distY * distY);
      
      // If target hasn't moved significantly, force a drastic direction change
      if (moved < 2) { // If moved less than 2 pixels, consider it stalled
        const levelConfig = getCurrentLevelConfig();
        const newSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier * 3.0;
        const newAngle = Math.random() * 2 * Math.PI;
        
        setDirection({
          dx: Math.cos(newAngle) * newSpeed,
          dy: Math.sin(newAngle) * newSpeed
        });
        
        // Also apply immediate position change to break out of any potential stuck state
        setTargetPosition(prev => ({
          x: prev.x + Math.cos(newAngle) * 5,
          y: prev.y + Math.sin(newAngle) * 5
        }));
      }
      
      // Update the last position reference
      lastPositionRef.current = targetPosition;
    }, 50); // Check every 50ms
    
    stallDetectionInterval.current = timer;
  };
  
  // Drastically enhanced animation with stronger jitter, continuous acceleration and improved bounce
  const animateTarget = () => {
    if (!mainCircleRef.current || !roundActive) return;
    
    // Check time since last position update
    const now = Date.now();
    const timeSinceLastUpdate = now - lastMovementTime.current;
    
    // If no motion for more than 50ms (reduced from 80ms), force a strong direction change
    if (timeSinceLastUpdate > 50) {
      const levelConfig = getCurrentLevelConfig();
      const minSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier * 3.0; // Triple minimum speed
      const newDirection = generateRandomDirection(speedMultiplier * 3.0, roundsCompleted); // Triple speed multiplier
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
    
    // DRASTICALLY INCREASED: Add much stronger random jitter for constant visible motion
    const jitterFactor = Math.min(1.0, 0.4 + (currentLevel * 0.1) + (roundsCompleted * 0.05)); // Increased from 0.6
    const jitterX = (Math.random() * 2 - 1) * jitterFactor * 1.5;
    const jitterY = (Math.random() * 2 - 1) * jitterFactor * 1.5;
    
    // IMPROVED: Much more frequent sudden movement bursts
    const burstInterval = Math.max(100, 300 - (currentLevel * 80)); // Shortened from 200ms
    if (now - lastBounceTime.current > burstInterval) {
      const burstChance = 0.5 + (currentLevel * 0.1); // Much higher chance (increased from 0.3)
      if (Math.random() < burstChance) {
        const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
        const burstAngle = Math.random() * 2 * Math.PI;
        const burstMultiplier = 2.5 + (currentLevel * 0.25); // Much stronger burst
        setDirection({
          dx: Math.cos(burstAngle) * currentSpeed * burstMultiplier,
          dy: Math.sin(burstAngle) * currentSpeed * burstMultiplier
        });
        lastBounceTime.current = now;
      }
    }
    
    // IMPROVED: More aggressive minimum speed check
    const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
    const minSpeedMultiplier = levelConfig.speedMultiplier * 2.5; // Drastically increased
    const minSpeed = gameConfig.animationSpeed * speedMultiplier * minSpeedMultiplier;
    
    if (currentSpeed < minSpeed) {
      const newDirection = ensureMinimumSpeed(direction.dx, direction.dy, minSpeed * 2.0); // Much higher boost
      setDirection(newDirection);
    }
    
    // Update last movement time
    lastMovementTime.current = now;
    
    setTargetPosition(prev => {
      // Calculate new position with strong jitter
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
        const randomFactor = 1 + (Math.random() * (0.8 + currentLevel * 0.1) - 0.3); 
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
      
      // Setup continuous movement checks - run all three mechanisms
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

  // Clean up the timers
  useEffect(() => {
    return () => {
      if (changeDirectionTimer.current) {
        clearTimeout(changeDirectionTimer.current);
      }
      if (forceMovementInterval.current) {
        clearInterval(forceMovementInterval.current);
      }
      if (stallDetectionInterval.current) {
        clearInterval(stallDetectionInterval.current);
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
