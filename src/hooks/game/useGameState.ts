
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
  
  // Game configuration
  const gameConfig: GameConfig = {
    maxTargets: 5, // User requested 5 targets per round
    animationSpeed: 20, // Base speed
    targetSize: 48, // Size of the breast target in pixels
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
    
    // Config
    gameConfig
  };
};
