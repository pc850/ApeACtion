
import { generateRandomDirection, applyRandomAcceleration, ensureMinimumSpeed } from '../animationUtils';

// Function to schedule random direction changes - less frequent for smoother motion
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
    
    // Set a timer to change direction less frequently for smoother motion
    const baseChangeInterval = Math.max(500, 700 - (currentLevel * 75));
    const changeInterval = Math.max(300, baseChangeInterval - (roundsCompleted * 50));
    
    const timer = setTimeout(() => {
      // Smoother direction changes - smaller angle variations
      const currentAngle = Math.atan2(direction.dy, direction.dx);
      const angleChange = (Math.random() * Math.PI/4) - Math.PI/8; // Smaller angle change (±22.5°)
      const newAngle = currentAngle + angleChange;
      
      // Maintain more consistent speed for smoother motion
      const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
      const levelSpeedMultiplier = levelConfig.speedMultiplier;
      const targetSpeed = gameConfig.animationSpeed * speedMultiplier * levelSpeedMultiplier;
      // Blend between current and target speed for smoother transitions
      const newSpeed = currentSpeed * 0.7 + targetSpeed * 0.3;
      
      setDirection({
        dx: Math.cos(newAngle) * newSpeed,
        dy: Math.sin(newAngle) * newSpeed
      });
      
      scheduleDirectionChange(); // Schedule the next change
    }, changeInterval);
    
    changeDirectionTimer = timer;
  };
  
  // Return both the scheduler function and the timer reference for cleanup
  return {
    scheduleDirectionChange,
    changeDirectionTimer
  };
};

// Utility to create a force movement checker - reduced frequency and strength
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
    
    // Check less frequently for smoother motion
    const timer = setInterval(() => {
      if (!roundActive) return;
      
      const levelConfig = getCurrentLevelConfig();
      const minRequiredSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier;
      
      // Apply gradual acceleration occasionally for smoother changes
      if (Math.random() < 0.2) { // 20% chance each check - less frequent
        const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
        const angle = Math.atan2(direction.dy, direction.dx);
        
        // Apply a small acceleration in roughly the same direction
        const angleVariation = (Math.random() * 0.5) - 0.25; // ±0.25 radians
        const newAngle = angle + angleVariation;
        const speedBoost = minRequiredSpeed * 0.1; // Small boost
        
        setDirection(prev => ({
          dx: prev.dx + Math.cos(newAngle) * speedBoost,
          dy: prev.dy + Math.sin(newAngle) * speedBoost
        }));
      }
      
      // Ensure target is moving at adequate speed, but with smoother transitions
      const currentSpeed = Math.sqrt(direction.dx * direction.dx + direction.dy * direction.dy);
      if (currentSpeed < minRequiredSpeed * 0.8) { // Only boost if significantly below target
        const angle = Math.atan2(direction.dy, direction.dx);
        const newSpeed = minRequiredSpeed * 1.2; // Boost to slightly above minimum
        
        setDirection({
          dx: Math.cos(angle) * newSpeed,
          dy: Math.sin(angle) * newSpeed
        });
        lastMovementTime.current = Date.now();
      }
    }, 150); // Check every 150ms for smoother motion
    
    forceMovementInterval = timer;
  };
  
  return {
    setupForceMovementCheck,
    forceMovementInterval
  };
};

// Utility to create a stall detector - less aggressive fixes for smoother motion
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
    
    // Check position changes less frequently for smoother detection
    const timer = setInterval(() => {
      if (!roundActive || !showTarget) return;
      
      // Calculate distance moved since last check
      const distX = Math.abs(targetPosition.x - lastPositionRef.current.x);
      const distY = Math.abs(targetPosition.y - lastPositionRef.current.y);
      const moved = Math.sqrt(distX * distX + distY * distY);
      
      // If target hasn't moved significantly, apply a gentle push rather than jerky fix
      if (moved < 3) { // If moved less than 3 pixels, apply gentle correction
        const levelConfig = getCurrentLevelConfig();
        const newSpeed = gameConfig.animationSpeed * speedMultiplier * levelConfig.speedMultiplier;
        
        // Get current direction angle if any movement detected
        let currentAngle = 0;
        if (moved > 0.1) {
          currentAngle = Math.atan2(targetPosition.y - lastPositionRef.current.y, 
                                   targetPosition.x - lastPositionRef.current.x);
        } else {
          currentAngle = Math.random() * 2 * Math.PI; // Random if no movement
        }
        
        // Apply a gentle push in roughly the same direction
        const angleVariation = (Math.random() * 0.5) - 0.25; // ±0.25 radians
        const newAngle = currentAngle + angleVariation;
        
        setDirection({
          dx: Math.cos(newAngle) * newSpeed,
          dy: Math.sin(newAngle) * newSpeed
        });
      }
      
      // Update the last position reference
      lastPositionRef.current = { ...targetPosition };
    }, 100); // Check every 100ms
    
    stallDetectionInterval = timer;
  };
  
  return {
    setupStallDetection,
    stallDetectionInterval,
    lastPositionRef
  };
};
