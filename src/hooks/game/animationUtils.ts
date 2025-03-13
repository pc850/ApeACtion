
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
  // INCREASED: Higher minimum speed ensures targets always move quickly
  const baseSpeed = Math.max(40, 45 * speedMultiplier * (1 + (roundsCompleted * 0.15)));
  return {
    dx: Math.cos(angle) * baseSpeed,
    dy: Math.sin(angle) * baseSpeed
  };
};

// Improved bounce algorithm with more unpredictable behavior and increased speed after bouncing
export const calculateBounce = (dx: number, dy: number, nx: number, ny: number) => {
  // nx, ny is the normal vector to the edge
  const dot = dx * nx + dy * ny;
  
  // INCREASED: Apply stronger speed boost after bouncing to prevent getting stuck
  const boostFactor = 1.5; // Increased from 1.35
  
  // INCREASED: Add more randomness to bounce angle for less predictable movement
  const angleVariation = (Math.random() * 0.8) - 0.4; // ±40% angle variation (increased from 30%)
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

// Enhanced function to prevent the target from moving too slowly
export const ensureMinimumSpeed = (dx: number, dy: number, minSpeed: number) => {
  const currentSpeed = Math.sqrt(dx * dx + dy * dy);
  if (currentSpeed < minSpeed) {
    // INCREASED: Apply a stronger boost when speed is below minimum
    const angle = Math.atan2(dy, dx);
    const boostMultiplier = 1.5; // Added boost multiplier
    return {
      dx: Math.cos(angle) * minSpeed * boostMultiplier,
      dy: Math.sin(angle) * minSpeed * boostMultiplier
    };
  }
  return { dx, dy };
};

// NEW: Add a function to apply random acceleration to prevent stale movement patterns
export const applyRandomAcceleration = (dx: number, dy: number) => {
  // Add random acceleration in a random direction
  const accelerationMagnitude = 2 + Math.random() * 3; // Random acceleration between 2-5
  const accelerationAngle = Math.random() * 2 * Math.PI;
  
  return {
    dx: dx + Math.cos(accelerationAngle) * accelerationMagnitude,
    dy: dy + Math.sin(accelerationAngle) * accelerationMagnitude
  };
};
