
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

// Generate a random movement direction with smooth velocity
export const generateRandomDirection = (speedMultiplier: number, roundsCompleted: number) => {
  const angle = Math.random() * 2 * Math.PI;
  // Medium speed that's visible but not erratic
  const baseSpeed = Math.max(30, 40 * speedMultiplier * (1 + (roundsCompleted * 0.1)));
  return {
    dx: Math.cos(angle) * baseSpeed,
    dy: Math.sin(angle) * baseSpeed
  };
};

// Bounce algorithm with natural physics-like behavior
export const calculateBounce = (dx: number, dy: number, nx: number, ny: number) => {
  // nx, ny is the normal vector to the edge
  const dot = dx * nx + dy * ny;
  
  // Apply slight energy loss on bounce (95% energy conservation)
  const boostFactor = 0.95;
  
  // Apply a very small random angle variation for natural behavior
  const angleVariation = (Math.random() * 0.2) - 0.1; // ±10% angle variation
  const cosVar = Math.cos(angleVariation);
  const sinVar = Math.sin(angleVariation);
  
  // Apply bounce with very slight randomization
  const newDx = (dx - 2 * dot * nx) * boostFactor;
  const newDy = (dy - 2 * dot * ny) * boostFactor;
  
  // Add slight rotation to the bounce vector
  return {
    dx: newDx * cosVar - newDy * sinVar,
    dy: newDx * sinVar + newDy * cosVar
  };
};

// Function to prevent the target from moving too slowly
export const ensureMinimumSpeed = (dx: number, dy: number, minSpeed: number) => {
  const currentSpeed = Math.sqrt(dx * dx + dy * dy);
  if (currentSpeed < minSpeed) {
    // Apply a gentle boost when speed is below minimum
    const angle = Math.atan2(dy, dx);
    const boostMultiplier = 1.2; // Gentle boost multiplier
    return {
      dx: Math.cos(angle) * minSpeed * boostMultiplier,
      dy: Math.sin(angle) * minSpeed * boostMultiplier
    };
  }
  return { dx, dy };
};

// Random acceleration function with moderate effect
export const applyRandomAcceleration = (dx: number, dy: number) => {
  // Add random acceleration in a random direction with moderate magnitude
  const accelerationMagnitude = 2 + Math.random() * 3; // Moderate acceleration
  const accelerationAngle = Math.random() * 2 * Math.PI;
  
  return {
    dx: dx + Math.cos(accelerationAngle) * accelerationMagnitude,
    dy: dy + Math.sin(accelerationAngle) * accelerationMagnitude
  };
};
