
import { useRef, useEffect } from 'react';
import { Position } from './types';
import { generateRandomDirection, calculateBounce, ensureMinimumSpeed } from './animationUtils';

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

  // Schedule more frequent direction changes
  const scheduleDirectionChange = () => {
    // Clear any existing timer
    if (changeDirectionTimer.current) {
      clearTimeout(changeDirectionTimer.current);
    }
    
    // Get current level config
    const levelConfig = getCurrentLevelConfig();
    
    // Set a new timer to change direction randomly - much more frequently now
    // More frequent direction changes for persistent movement
    const baseChangeInterval = 400 - (currentLevel * 75); // Further decreased from 500ms
    const changeInterval = Math.max(80, baseChangeInterval - (roundsCompleted * 50)); // Decreased minimum to 80ms for more erratic movement
    const timer = setTimeout(() => {
      // Wider range of direction changes
      const currentAngle = Math.atan2(direction.dy, direction.dx);
      const angleChange = (Math.random() * Math.PI / 1.2) - Math.PI / 2.4; // Increased range for more unpredictable movement
      const newAngle = currentAngle + angleChange;
      
      // Apply higher speed based on level
      const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
      const levelSpeedMultiplier = levelConfig.speedMultiplier;
      const minSpeed = gameConfig.animationSpeed * speedMultiplier * levelSpeedMultiplier * 1.2;
      const newSpeed = Math.max(currentSpeed, minSpeed);
      
      setDirection({
        dx: Math.cos(newAngle) * newSpeed,
        dy: Math.sin(newAngle) * newSpeed
      });
      
      scheduleDirectionChange(); // Schedule the next change
    }, changeInterval + Math.random() * 150); // Less predictable timing
    
    changeDirectionTimer.current = timer;
  };
  
  // Check if the target has been stationary and force movement if needed
  const checkForStationaryTarget = () => {
    const now = Date.now();
    if (now - lastMovementTime.current > 150) { // If no movement for 150ms (reduced from potential 200ms)
      // Force a direction change with increased speed
      const levelConfig = getCurrentLevelConfig();
      const minSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier * 1.5;
      const newDirection = generateRandomDirection(speedMultiplier * 1.5, roundsCompleted);
      setDirection(newDirection);
      lastMovementTime.current = now;
    }
  };
  
  // Enhanced animation with jitter, continuous acceleration and improved bounce
  const animateTarget = () => {
    if (!mainCircleRef.current || !roundActive) return;
    
    // Check for stationary target and force movement if needed
    checkForStationaryTarget();
    
    // Get current level config
    const levelConfig = getCurrentLevelConfig();
    const targetSize = levelConfig.targetSize; // Use level specific target size
    
    const mainCircle = mainCircleRef.current.getBoundingClientRect();
    const centerX = mainCircle.width / 2;
    const centerY = mainCircle.height / 2;
    // Slightly increased safe area for better bounce detection
    const radius = (mainCircle.width / 2) * 0.85 - (targetSize / 2) - EDGE_PADDING;
    
    // Add random jitter for less predictable motion - increases with level
    const jitterFactor = Math.min(0.4, 0.2 + (currentLevel * 0.04) + (roundsCompleted * 0.01)); // Increased jitter
    const jitterX = (Math.random() * 2 - 1) * jitterFactor;
    const jitterY = (Math.random() * 2 - 1) * jitterFactor;
    
    // Occasionally add sudden movement bursts - increased frequency with level
    const now = Date.now();
    const burstInterval = Math.max(300, 600 - (currentLevel * 80)); // Shorter interval at higher levels
    if (now - lastBounceTime.current > burstInterval) { // More frequent chance for speed burst
      const burstChance = 0.2 + (currentLevel * 0.03); // Higher chance at higher levels
      if (Math.random() < burstChance) { // Increased chance of sudden direction change
        const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
        const burstAngle = Math.random() * 2 * Math.PI;
        const burstMultiplier = 1.6 + (currentLevel * 0.1); // Stronger bursts at higher levels
        setDirection({
          dx: Math.cos(burstAngle) * currentSpeed * burstMultiplier,
          dy: Math.sin(burstAngle) * currentSpeed * burstMultiplier
        });
        lastBounceTime.current = now;
      }
    }
    
    // Add a minimum speed check to ensure target never slows down
    const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
    const minSpeedMultiplier = levelConfig.speedMultiplier * 1.3; // Increased from 1.1
    const minSpeed = gameConfig.animationSpeed * speedMultiplier * minSpeedMultiplier;
    
    if (currentSpeed < minSpeed) {
      const newDirection = ensureMinimumSpeed(direction.dx, direction.dy, minSpeed * 1.3);
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
        
        // Update direction with randomness for unpredictable bounces - increased with level
        const randomFactor = 1 + (Math.random() * (0.4 + currentLevel * 0.05) - 0.15); // More variation at higher levels
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
      
      // Initialize movement timestamp
      lastMovementTime.current = Date.now();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showTarget, roundActive]);

  // Clean up the direction change timer
  useEffect(() => {
    return () => {
      if (changeDirectionTimer.current) {
        clearTimeout(changeDirectionTimer.current);
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
