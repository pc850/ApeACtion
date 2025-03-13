
import { Position } from '../types';
import { 
  generateRandomDirection, 
  calculateBounce, 
  ensureMinimumSpeed
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
  jitterFactor: number = 0  // Remove jitter completely for perfect DVD-like movement
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
  
  // Calculate new position with a constant, predictable movement (DVD-like)
  const newX = targetPosition.x + direction.dx;
  const newY = targetPosition.y + direction.dy;
  
  // Calculate distance from center
  const dx = newX - centerX;
  const dy = newY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  let newDirection = { ...direction };
  let didBounce = false;
  let finalX = newX;
  let finalY = newY;
  
  // If target would go outside the circle, bounce it back like DVD logo
  if (distance > radius) {
    didBounce = true;
    
    // Calculate the normal vector to the circle at the point of intersection
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Calculate the reflection using the normal vector
    const bounce = calculateBounce(direction.dx, direction.dy, nx, ny);
    
    // Apply a slight energy preservation on bounce (DVD-like)
    const preservationFactor = 1.0; // Keep exact same speed after bounce
    newDirection = {
      dx: bounce.dx * preservationFactor,
      dy: bounce.dy * preservationFactor
    };
    
    // Place the target exactly at the edge of the valid area
    const safeDistance = radius - 1;
    finalX = centerX + safeDistance * nx;
    finalY = centerY + safeDistance * ny;
  }
  
  // Ensure we're returning updated position
  return { 
    newPosition: { x: finalX, y: finalY },
    newDirection: didBounce ? newDirection : undefined,
    didBounce
  };
};
