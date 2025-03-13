
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
export const generateRandomDirection = (speedMultiplier: number, roundsCompleted: number) => {
  const angle = Math.random() * 2 * Math.PI;
  // Increase speed based on rounds completed, but ensure minimum speed
  const baseSpeed = Math.max(1.5, 2 * speedMultiplier * (1 + (roundsCompleted * 0.2)));
  return {
    dx: Math.cos(angle) * baseSpeed,
    dy: Math.sin(angle) * baseSpeed
  };
};

// Smoother bounce algorithm for when the target hits the circle edge
export const calculateBounce = (dx: number, dy: number, nx: number, ny: number) => {
  // nx, ny is the normal vector to the edge
  const dot = dx * nx + dy * ny;
  return {
    dx: dx - 2 * dot * nx,
    dy: dy - 2 * dot * ny
  };
};
