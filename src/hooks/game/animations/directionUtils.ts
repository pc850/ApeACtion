
import { generateRandomDirection, applyRandomAcceleration, ensureMinimumSpeed } from '../animationUtils';

// Function to schedule random direction changes
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
  
  const scheduleDirectionChange = () => {
    // Clear any existing timer
    if (changeDirectionTimer) {
      clearTimeout(changeDirectionTimer);
    }
    
    // Get current level config
    const levelConfig = getCurrentLevelConfig();
    
    // Set a timer to change direction occasionally
    const baseChangeInterval = Math.max(1000, 2000 - (currentLevel * 200));
    const changeInterval = Math.max(800, baseChangeInterval - (roundsCompleted * 100));
    
    const timer = setTimeout(() => {
      // Get a completely new direction periodically for more dynamic movement
      const levelSpeedMultiplier = levelConfig.speedMultiplier;
      const newDirection = generateRandomDirection(speedMultiplier * levelSpeedMultiplier, roundsCompleted);
      setDirection(newDirection);
      
      scheduleDirectionChange(); // Schedule the next change
    }, changeInterval);
    
    changeDirectionTimer = timer;
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
      if (currentSpeed < minRequiredSpeed) {
        // If speed is too low, give it a new direction with proper speed
        const newDirection = generateRandomDirection(speedMultiplier, roundsCompleted);
        setDirection(newDirection);
        lastMovementTime.current = Date.now();
      }
    }, 300);
    
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
      
      // If target hasn't moved significantly, give it a new direction
      if (moved < 5) {
        const levelConfig = getCurrentLevelConfig();
        const baseSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier;
        
        // Create a stronger movement if stalled
        const newDirection = generateRandomDirection(speedMultiplier * 2, roundsCompleted);
        setDirection(newDirection);
      }
      
      // Update the last position reference
      lastPositionRef.current = { ...targetPosition };
    }, 200);
    
    stallDetectionInterval = timer;
  };
  
  return {
    setupStallDetection,
    stallDetectionInterval,
    lastPositionRef
  };
};
