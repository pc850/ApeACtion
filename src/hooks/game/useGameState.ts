import { useState, useRef } from 'react';
import { Position, GameState, GameConfig } from './types';
import { generateRandomPosition, generateRandomDirection } from './animationUtils';

export const useGameState = (mainCircleRef: React.RefObject<HTMLDivElement>) => {
  // UI state
  const [scale, setScale] = useState(1);
  const [consecutiveClicks, setConsecutiveClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Game state
  const [roundActive, setRoundActive] = useState(false);
  const [targetsHit, setTargetsHit] = useState(0);
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, y: 0 });
  const [showTarget, setShowTarget] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [direction, setDirection] = useState({ dx: 0, dy: 0 });
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  
  // Game configuration with multiple levels
  const gameConfig: GameConfig = {
    maxTargets: 5, // Base targets per round
    animationSpeed: 10, // Reduced base speed
    targetSize: 48, // Base size of the breast target in pixels
    levels: [
      {
        level: 1,
        targetsRequired: 5,
        speedMultiplier: 0.6, // Reduced speed multiplier
        targetSize: 48,
        description: "Beginner - Slow moving targets"
      },
      {
        level: 2,
        targetsRequired: 7,
        speedMultiplier: 0.8, // Reduced speed multiplier
        targetSize: 42,
        description: "Intermediate - Faster & smaller targets"
      },
      {
        level: 3,
        targetsRequired: 10,
        speedMultiplier: 1.0, // Reduced speed multiplier
        targetSize: 38,
        description: "Advanced - Fast & small targets"
      },
      {
        level: 4,
        targetsRequired: 12,
        speedMultiplier: 1.2, // Reduced speed multiplier
        targetSize: 34,
        description: "Expert - Very fast & tiny targets"
      },
      {
        level: 5,
        targetsRequired: 15,
        speedMultiplier: 1.5, // Reduced speed multiplier
        targetSize: 30,
        description: "Master - Extreme speed challenge"
      }
    ]
  };
  
  // Get current level configuration
  const getCurrentLevelConfig = () => {
    const levelIndex = Math.min(currentLevel - 1, gameConfig.levels.length - 1);
    return gameConfig.levels[levelIndex];
  };
  
  // Export all state and state setters
  return {
    // UI state
    scale,
    setScale,
    consecutiveClicks,
    setConsecutiveClicks,
    lastClickTime,
    setLastClickTime,
    
    // Game state
    roundActive,
    setRoundActive,
    targetsHit,
    setTargetsHit,
    targetPosition,
    setTargetPosition,
    showTarget,
    setShowTarget,
    roundScore,
    setRoundScore,
    direction,
    setDirection,
    speedMultiplier,
    setSpeedMultiplier,
    roundsCompleted,
    setRoundsCompleted,
    currentLevel,
    setCurrentLevel,
    
    // Config
    gameConfig,
    getCurrentLevelConfig
  };
};
