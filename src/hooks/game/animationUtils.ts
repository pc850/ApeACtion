
import { Position } from './types';

// Function to generate a random position within the main circle
export const generateRandomPosition = (mainCircleRef: React.RefObject<HTMLDivElement>): Position => {
  if (!mainCircleRef.current) return { x: 0, y: 0 };

  const mainCircle = mainCircleRef.current.getBoundingClientRect();
  const centerX = mainCircle.width / 2;
  const centerY = mainCircle.height / 2;
  // Reduce the usable radius to avoid spawning too close to the edge
  const radius = (mainCircle.width / 2) * 0.7; 
  
  // Generate random angle and distance from center (within the radius)
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;
  
  // Calculate position
  const x = centerX + distance * Math.cos(angle);
  const y = centerY + distance * Math.sin(angle);
  
  return { x, y };
};

// Generate a random movement direction with smoother velocity
// Now with guaranteed minimum speed to ensure constant motion
export const generateRandomDirection = (speedMultiplier: number, roundsCompleted: number) => {
  const angle = Math.random() * 2 * Math.PI;
  // Further increased minimum speed to ensure continuous motion with no slow points
  const baseSpeed = Math.max(25, 30 * speedMultiplier * (1 + (roundsCompleted * 0.15)));
  return {
    dx: Math.cos(angle) * baseSpeed,
    dy: Math.sin(angle) * baseSpeed
  };
};

// Improved bounce algorithm with more unpredictable behavior and no slowing down
export const calculateBounce = (dx: number, dy: number, nx: number, ny: number) => {
  // nx, ny is the normal vector to the edge
  const dot = dx * nx + dy * ny;
  
  // Apply speed boost after bouncing to prevent getting stuck and make it harder to click
  const boostFactor = 1.35; // Increased from 1.25 to ensure constant motion
  
  // Add increased randomness to bounce angle to make movement less predictable
  const angleVariation = (Math.random() * 0.6) - 0.3; // ±30% angle variation (increased from 20%)
  const cosVar = Math.cos(angleVariation);
  const sinVar = Math.sin(angleVariation);
  
  // Apply bounce with randomized direction
  const newDx = (dx - 2 * dot * nx) * boostFactor;
  const newDy = (dy - 2 * dot * ny) * boostFactor;
  
  // Add slight rotation to the bounce vector
  return {
    dx: newDx * cosVar - newDy * sinVar,
    dy: newDx * sinVar + newDy * cosVar
  };
};

// New function to prevent the target from stopping or moving too slowly
export const ensureMinimumSpeed = (dx: number, dy: number, minSpeed: number) => {
  const currentSpeed = Math.sqrt(dx * dx + dy * dy);
  if (currentSpeed < minSpeed) {
    const angle = Math.atan2(dy, dx);
    return {
      dx: Math.cos(angle) * minSpeed,
      dy: Math.sin(angle) * minSpeed
    };
  }
  return { dx, dy };
};
