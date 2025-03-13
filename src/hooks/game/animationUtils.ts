
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
// Now 5x faster than before, with additional randomness
export const generateRandomDirection = (speedMultiplier: number, roundsCompleted: number) => {
  const angle = Math.random() * 2 * Math.PI;
  // Further increased minimum speed to ensure continuous fast movement
  const baseSpeed = Math.max(15, 20 * speedMultiplier * (1 + (roundsCompleted * 0.1)));
  return {
    dx: Math.cos(angle) * baseSpeed,
    dy: Math.sin(angle) * baseSpeed
  };
};

// Improved bounce algorithm with more unpredictable behavior
export const calculateBounce = (dx: number, dy: number, nx: number, ny: number) => {
  // nx, ny is the normal vector to the edge
  const dot = dx * nx + dy * ny;
  
  // Apply speed boost after bouncing to prevent getting stuck and make it harder to click
  const boostFactor = 1.25; // Increased from 1.15
  
  // Add slight randomness to bounce angle to make movement less predictable
  const angleVariation = (Math.random() * 0.4) - 0.2; // ±20% angle variation (increased from 15%)
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
