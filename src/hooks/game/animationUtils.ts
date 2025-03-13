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

// Generate a random movement direction with proper velocity
export const generateRandomDirection = (speedMultiplier: number, roundsCompleted: number) => {
  const angle = Math.random() * 2 * Math.PI;
  // Set a good base speed that's clearly visible
  const baseSpeed = Math.max(30, 40 * speedMultiplier * (1 + (roundsCompleted * 0.1)));
  return {
    dx: Math.cos(angle) * baseSpeed,
    dy: Math.sin(angle) * baseSpeed
  };
};

// Bounce algorithm using physics reflection
export const calculateBounce = (dx: number, dy: number, nx: number, ny: number) => {
  // nx, ny is the normal vector to the edge
  const dot = dx * nx + dy * ny;
  
  // Calculate the reflection vector: r = d - 2(d·n)n
  return {
    dx: dx - 2 * dot * nx,
    dy: dy - 2 * dot * ny
  };
};

// Function to prevent the target from moving too slowly
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

// Random acceleration function
export const applyRandomAcceleration = (dx: number, dy: number) => {
  // Add random acceleration in a random direction
  const accelerationMagnitude = 0.5 + Math.random() * 1.0;
  const accelerationAngle = Math.random() * 2 * Math.PI;
  
  return {
    dx: dx + Math.cos(accelerationAngle) * accelerationMagnitude,
    dy: dy + Math.sin(accelerationAngle) * accelerationMagnitude
  };
};
