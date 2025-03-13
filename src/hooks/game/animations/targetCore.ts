
import { Position } from '../types';
import { 
  generateRandomDirection, 
  calculateBounce, 
  ensureMinimumSpeed, 
  applyRandomAcceleration 
} from '../animationUtils';

// Add a padding value to prevent edge glitches
export const EDGE_PADDING = 5;

// Core animation function that handles target movement
export const animateTargetFrame = (
  targetPosition: Position,
  direction: { dx: number; dy: number },
  mainCircleRef: React.RefObject<HTMLDivElement>,
  targetSize: number,
  currentLevel: number,
  roundsCompleted: number,
  jitterFactor: number = 0.4
): {
  newPosition: Position;
  newDirection?: { dx: number; dy: number };
  didBounce: boolean;
} => {
  if (!mainCircleRef.current) {
    return { newPosition: targetPosition, didBounce: false };
  }
  
  const mainCircle = mainCircleRef.current.getBoundingClientRect();
  const centerX = mainCircle.width / 2;
  const centerY = mainCircle.height / 2;
  const radius = (mainCircle.width / 2) * 0.85 - (targetSize / 2) - EDGE_PADDING;
  
  // Apply strong random jitter for constant visible motion
  const jitterStrength = Math.min(1.0, jitterFactor + (currentLevel * 0.1) + (roundsCompleted * 0.05));
  const jitterX = (Math.random() * 2 - 1) * jitterStrength * 1.5;
  const jitterY = (Math.random() * 2 - 1) * jitterStrength * 1.5;
  
  // Calculate new position with jitter
  let newX = targetPosition.x + direction.dx + jitterX;
  let newY = targetPosition.y + direction.dy + jitterY;
  
  // Calculate distance from center
  const dx = newX - centerX;
  const dy = newY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  let newDirection;
  let didBounce = false;
  
  // If target would go outside the circle, bounce it back with improved detection
  if (distance > radius) {
    // Calculate the normal vector to the circle at the point of intersection
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Calculate the reflection using the normal vector
    const bounce = calculateBounce(direction.dx, direction.dy, nx, ny);
    
    // Higher random factor for more unpredictable bounces
    const randomFactor = 1 + (Math.random() * (0.8 + currentLevel * 0.1) - 0.3);
    newDirection = {
      dx: bounce.dx * randomFactor,
      dy: bounce.dy * randomFactor
    };
    
    // Place the target exactly at the edge of the valid area plus a bit inward
    const safeDistance = radius - 5;
    newX = centerX + safeDistance * nx;
    newY = centerY + safeDistance * ny;
    
    didBounce = true;
  }
  
  return { 
    newPosition: { x: newX, y: newY },
    newDirection,
    didBounce
  };
};
