
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
    
    // Set a timer to change direction frequently
    const baseChangeInterval = Math.max(200, 250 - (currentLevel * 75));
    const changeInterval = Math.max(30, baseChangeInterval - (roundsCompleted * 50)); // Min 30ms
    
    const timer = setTimeout(() => {
      // Wider range of direction changes
      const currentAngle = Math.atan2(direction.dy, direction.dx);
      const angleChange = (Math.random() * Math.PI) - Math.PI/2; 
      const newAngle = currentAngle + angleChange;
      
      // Apply higher speed based on level
      const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
      const levelSpeedMultiplier = levelConfig.speedMultiplier;
      const minSpeed = gameConfig.animationSpeed * speedMultiplier * levelSpeedMultiplier * 1.8;
      const newSpeed = Math.max(currentSpeed, minSpeed);
      
      setDirection({
        dx: Math.cos(newAngle) * newSpeed,
        dy: Math.sin(newAngle) * newSpeed
      });
      
      scheduleDirectionChange(); // Schedule the next change
    }, changeInterval + Math.random() * 50); // Less predictable timing
    
    changeDirectionTimer = timer;
  };
  
  // Return both the scheduler function and the timer reference for cleanup
  return {
    scheduleDirectionChange,
    changeDirectionTimer
  };
};

// Utility to create a force movement checker that ensures target never stops
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
    
    // Check frequently (every 20ms) to ensure constant motion
    const timer = setInterval(() => {
      if (!roundActive) return;
      
      const levelConfig = getCurrentLevelConfig();
      const minRequiredSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier * 1.5;
      
      // Force acceleration randomly to create constant movement
      if (Math.random() < 0.6) { // 60% chance each check
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
    }, 20); // Check every 20ms
    
    forceMovementInterval = timer;
  };
  
  return {
    setupForceMovementCheck,
    forceMovementInterval
  };
};

// Utility to create a stall detector that fixes stalled targets
export const createStallDetector = (
  setDirection: React.Dispatch<React.SetStateAction<{ dx: number; dy: number }>>,
  setTargetPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
  targetPosition: { x: number; y: number },
  roundActive: boolean,
  showTarget: boolean,
  getCurrentLevelConfig: () => any,
  gameConfig: { animationSpeed: number },
  speedMultiplier: number,
  currentLevel: number
) => {
  let stallDetectionInterval: NodeJS.Timeout | null = null;
  const lastPositionRef = { current: { x: 0, y: 0 } };
  
  const setupStallDetection = () => {
    if (stallDetectionInterval) {
      clearInterval(stallDetectionInterval);
    }
    
    // Initialize last position reference
    lastPositionRef.current = { ...targetPosition };
    
    // Check position changes frequently
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
        
        // Apply immediate position change to break out of any potential stuck state
        setTargetPosition(prev => ({
          x: prev.x + Math.cos(newAngle) * 5,
          y: prev.y + Math.sin(newAngle) * 5
        }));
      }
      
      // Update the last position reference
      lastPositionRef.current = { ...targetPosition };
    }, 50); // Check every 50ms
    
    stallDetectionInterval = timer;
  };
  
  return {
    setupStallDetection,
    stallDetectionInterval,
    lastPositionRef
  };
};
