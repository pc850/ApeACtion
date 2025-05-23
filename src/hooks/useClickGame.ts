
import { useRef, useEffect } from 'react';
import { useTokens } from '@/context/TokenContext';
import { GameState, GameConfig } from './game/types';

// Import our refactored hooks
import { useGameState } from './game/useGameState';
import { useTargetAnimation } from './game/animations/useTargetAnimation';
import { useGameInteractions } from './game/useGameInteractions';

// Correctly re-export types
export type { Position, GameState, GameConfig } from './game/types';

export const useClickGame = (containerRef: React.RefObject<HTMLDivElement>, mainCircleRef: React.RefObject<HTMLDivElement>) => {
  const { addTokens } = useTokens();
  const animationRef = useRef<number | null>(null);
  
  // Get game state from dedicated hook
  const gameState = useGameState(mainCircleRef);
  
  // Set up animation with dedicated hook
  const animationControls = useTargetAnimation({
    targetPosition: gameState.targetPosition,
    setTargetPosition: gameState.setTargetPosition,
    direction: gameState.direction,
    setDirection: gameState.setDirection,
    roundActive: gameState.roundActive,
    showTarget: gameState.showTarget,
    speedMultiplier: gameState.speedMultiplier,
    roundsCompleted: gameState.roundsCompleted,
    currentLevel: gameState.currentLevel,
    getCurrentLevelConfig: gameState.getCurrentLevelConfig,
    mainCircleRef,
    gameConfig: gameState.gameConfig
  });
  
  // Set up game interactions
  const interactions = useGameInteractions({
    containerRef,
    mainCircleRef,
    gameState: {
      ...gameState,
      direction: gameState.direction // Make sure direction is passed
    },
    animationControls: {
      ...animationControls,
      animationRef
    },
    gameConfig: gameState.gameConfig,
    addTokens
  });
  
  // Reset consecutive clicks if user hasn't clicked for a while
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      if (Date.now() - gameState.lastClickTime > 2000 && gameState.consecutiveClicks > 0) {
        gameState.setConsecutiveClicks(0);
      }
    }, 2000);
    
    return () => clearTimeout(resetTimer);
  }, [gameState.lastClickTime, gameState.consecutiveClicks]);

  // Get current level configuration
  const currentLevelConfig = gameState.getCurrentLevelConfig();

  return {
    gameState: {
      roundActive: gameState.roundActive,
      targetsHit: gameState.targetsHit,
      targetPosition: gameState.targetPosition,
      showTarget: gameState.showTarget,
      roundScore: gameState.roundScore,
      consecutiveClicks: gameState.consecutiveClicks,
      lastClickTime: gameState.lastClickTime,
      scale: gameState.scale,
      currentLevel: gameState.currentLevel,
      direction: gameState.direction // Include direction in returned state
    },
    gameConfig: gameState.gameConfig,
    currentLevelConfig,
    handleTargetClick: interactions.handleTargetClick,
    handleMainCircleClick: interactions.handleMainCircleClick
  };
};
