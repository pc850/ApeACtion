
import { generateRandomDirection, ensureMinimumSpeed } from '../animationUtils';

// Function to schedule random direction changes - reduced for DVD-like movement
export const createDirectionChangeScheduler = (
  setDirection: React.Dispatch<React.SetStateAction<{ dx: number; dy: number }>>,
  direction: { dx: number; dy: number },
  currentLevel: number,
  roundsCompleted: number,
  getCurrentLevelConfig: () => any,
  gameConfig: { animationSpeed: number },
  speedMultiplier: number
) => {
  let changeDirectionTimer: NodeJS.Timeout | null = null;
  
  // For DVD-like movement, we don't randomly change direction
  // This function now only schedules direction changes for level progression
  const scheduleDirectionChange = () => {
    // Clear any existing timer
    if (changeDirectionTimer) {
      clearTimeout(changeDirectionTimer);
    }
    
    // We'll keep this function but make it a no-op for DVD movement
    // It will only be used when explicitly called for level progression
  };
  
  return {
    scheduleDirectionChange,
    changeDirectionTimer
  };
};

// Utility to create a force movement checker
export const createForceMovementChecker = (
  setDirection: React.Dispatch<React.SetStateAction<{ dx: number; dy: number }>>,
  direction: { dx: number; dy: number },
  roundActive: boolean,
  speedMultiplier: number,
  getCurrentLevelConfig: () => any,
  gameConfig: { animationSpeed: number },
  roundsCompleted: number,
  lastMovementTime: React.MutableRefObject<number>
) => {
  let forceMovementInterval: NodeJS.Timeout | null = null;
  
  const setupForceMovementCheck = () => {
    if (forceMovementInterval) {
      clearInterval(forceMovementInterval);
    }
    
    const timer = setInterval(() => {
      if (!roundActive) return;
      
      const levelConfig = getCurrentLevelConfig();
      const minRequiredSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier;
      
      // Ensure target is moving at adequate speed
      const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
      if (currentSpeed < minRequiredSpeed * 0.8) {
        // If speed is too low, adjust speed but maintain direction
        const angle = Math.atan2(direction.dy, direction.dx);
        setDirection({
          dx: Math.cos(angle) * minRequiredSpeed,
          dy: Math.sin(angle) * minRequiredSpeed
        });
        lastMovementTime.current = Date.now();
      }
    }, 500);
    
    forceMovementInterval = timer;
  };
  
  return {
    setupForceMovementCheck,
    forceMovementInterval
  };
};

// Utility to create a stall detector
export const createStallDetector = (
  setDirection: React.Dispatch<React.SetStateAction<{ dx: number; dy: number }>>,
  setTargetPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
  targetPosition: { x: number; y: number },
  direction: { dx: number; dy: number }, // Added missing direction parameter
  roundActive: boolean,
  showTarget: boolean,
  getCurrentLevelConfig: () => any,
  gameConfig: { animationSpeed: number },
  speedMultiplier: number,
  currentLevel: number,
  roundsCompleted: number
) => {
  let stallDetectionInterval: NodeJS.Timeout | null = null;
  const lastPositionRef = { current: { x: 0, y: 0 } };
  
  const setupStallDetection = () => {
    if (stallDetectionInterval) {
      clearInterval(stallDetectionInterval);
    }
    
    // Initialize last position reference
    lastPositionRef.current = { ...targetPosition };
    
    const timer = setInterval(() => {
      if (!roundActive || !showTarget) return;
      
      // Calculate distance moved since last check
      const distX = Math.abs(targetPosition.x - lastPositionRef.current.x);
      const distY = Math.abs(targetPosition.y - lastPositionRef.current.y);
      const moved = Math.sqrt(distX * distX + distY * distY);
      
      // If target hasn't moved significantly, maintain its direction but increase speed
      if (moved < 2) {
        const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
        const angle = Math.atan2(direction.dy, direction.dx);
        
        // Maintain direction but increase speed
        setDirection({
          dx: Math.cos(angle) * currentSpeed * 1.1,
          dy: Math.sin(angle) * currentSpeed * 1.1
        });
      }
      
      // Update the last position reference
      lastPositionRef.current = { ...targetPosition };
    }, 300);
    
    stallDetectionInterval = timer;
  };
  
  return {
    setupStallDetection,
    stallDetectionInterval,
    lastPositionRef
  };
};
