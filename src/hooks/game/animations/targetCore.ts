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
  jitterFactor: number = 0.1  // Reduced jitter for smoother motion
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
  
  // Calculate new position with direct movement - no jitter
  let newX = targetPosition.x + direction.dx;
  let newY = targetPosition.y + direction.dy;
  
  // Calculate distance from center
  const dx = newX - centerX;
  const dy = newY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  let newDirection;
  let didBounce = false;
  
  // If target would go outside the circle, bounce it back
  if (distance > radius) {
    // Calculate the normal vector to the circle at the point of intersection
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Calculate the reflection using the normal vector
    const bounce = calculateBounce(direction.dx, direction.dy, nx, ny);
    
    // Apply a slight energy boost on bounce to keep movement exciting
    const boostFactor = 1.05;
    newDirection = {
      dx: bounce.dx * boostFactor,
      dy: bounce.dy * boostFactor
    };
    
    // Place the target exactly at the edge of the valid area plus a bit inward
    const safeDistance = radius - 1;
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
