
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
// Now with significantly higher minimum speed to ensure continuous motion
export const generateRandomDirection = (speedMultiplier: number, roundsCompleted: number) => {
  const angle = Math.random() * 2 * Math.PI;
  // DRASTICALLY INCREASED: Much higher minimum speed to ensure targets always move visibly
  const baseSpeed = Math.max(60, 80 * speedMultiplier * (1 + (roundsCompleted * 0.15)));
  return {
    dx: Math.cos(angle) * baseSpeed,
    dy: Math.sin(angle) * baseSpeed
  };
};

// Improved bounce algorithm with more unpredictable behavior and increased speed after bouncing
export const calculateBounce = (dx: number, dy: number, nx: number, ny: number) => {
  // nx, ny is the normal vector to the edge
  const dot = dx * nx + dy * ny;
  
  // DRASTICALLY INCREASED: Apply much stronger speed boost after bouncing
  const boostFactor = 2.0; // Increased from 1.5
  
  // INCREASED: Add more randomness to bounce angle for less predictable movement
  const angleVariation = (Math.random() * 1.0) - 0.5; // ±50% angle variation
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

// Drastically enhanced function to prevent the target from moving too slowly
export const ensureMinimumSpeed = (dx: number, dy: number, minSpeed: number) => {
  const currentSpeed = Math.sqrt(dx * dx + dy * dy);
  if (currentSpeed < minSpeed) {
    // DRASTICALLY INCREASED: Apply a much stronger boost when speed is below minimum
    const angle = Math.atan2(dy, dx);
    const boostMultiplier = 2.5; // Significantly increased boost multiplier
    return {
      dx: Math.cos(angle) * minSpeed * boostMultiplier,
      dy: Math.sin(angle) * minSpeed * boostMultiplier
    };
  }
  return { dx, dy };
};

// Improved random acceleration function with stronger effect
export const applyRandomAcceleration = (dx: number, dy: number) => {
  // Add random acceleration in a random direction with higher magnitude
  const accelerationMagnitude = 8 + Math.random() * 12; // Significantly increased (was 2-5)
  const accelerationAngle = Math.random() * 2 * Math.PI;
  
  return {
    dx: dx + Math.cos(accelerationAngle) * accelerationMagnitude,
    dy: dy + Math.sin(accelerationAngle) * accelerationMagnitude
  };
};
