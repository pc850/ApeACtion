
import React from 'react';
import { GameConfig } from './types';
import { startRound as startRoundLogic, handleTargetClick as handleTargetClickLogic, handleMainCircleClick as handleMainCircleClickLogic } from './gameLogic';

interface UseGameInteractionsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  mainCircleRef: React.RefObject<HTMLDivElement>;
  gameState: {
    roundActive: boolean;
    setRoundActive: React.Dispatch<React.SetStateAction<boolean>>;
    targetsHit: number;
    setTargetsHit: React.Dispatch<React.SetStateAction<number>>;
    setRoundScore: React.Dispatch<React.SetStateAction<number>>;
    setSpeedMultiplier: React.Dispatch<React.SetStateAction<number>>;
    setDirection: React.Dispatch<React.SetStateAction<{dx: number, dy: number}>>;
    setTargetPosition: React.Dispatch<React.SetStateAction<{x: number, y: number}>>;
    setShowTarget: React.Dispatch<React.SetStateAction<boolean>>;
    lastClickTime: number;
    setLastClickTime: React.Dispatch<React.SetStateAction<number>>;
    consecutiveClicks: number;
    setConsecutiveClicks: React.Dispatch<React.SetStateAction<number>>;
    roundScore: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    roundsCompleted: number;
    setRoundsCompleted: React.Dispatch<React.SetStateAction<number>>;
    speedMultiplier: number;
    currentLevel: number;
    setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
    getCurrentLevelConfig: () => any;
    direction: { dx: number; dy: number }; // Added direction to GameState
  };
  animationControls: {
    scheduleDirectionChange: () => void;
    animateTarget: () => void;
    animationRef: React.RefObject<number | null>;
  };
  gameConfig: GameConfig;
  addTokens: (amount: number) => void;
}

export const useGameInteractions = ({
  containerRef,
  mainCircleRef,
  gameState,
  animationControls,
  gameConfig,
  addTokens
}: UseGameInteractionsProps) => {
  
  // Start a new round of the game
  const startRound = () => {
    startRoundLogic(
      gameState.setRoundActive,
      gameState.setTargetsHit,
      gameState.setRoundScore,
      gameState.setSpeedMultiplier,
      gameState.setDirection,
      gameState.setTargetPosition,
      gameState.setShowTarget,
      animationControls.scheduleDirectionChange,
      animationControls.animateTarget,
      gameState.roundsCompleted,
      gameState.currentLevel,
      gameState.getCurrentLevelConfig,
      mainCircleRef,
      animationControls.animationRef
    );
  };
  
  // Handle clicking on the breast target
  const handleTargetClick = (e: React.MouseEvent) => {
    handleTargetClickLogic(
      e,
      containerRef,
      gameState.setLastClickTime,
      gameState.lastClickTime,
      gameState.setConsecutiveClicks,
      gameState.consecutiveClicks,
      gameState.setRoundScore,
      addTokens,
      gameState.setTargetsHit,
      gameState.targetsHit,
      gameConfig,
      gameState.currentLevel,
      gameState.getCurrentLevelConfig,
      gameState.setCurrentLevel,
      gameState.setRoundsCompleted,
      gameState.setSpeedMultiplier,
      gameState.setTargetPosition,
      mainCircleRef,
      animationControls.animationRef,
      animationControls.animateTarget,
      gameState.direction,  // Pass current direction
      gameState.setDirection // Pass setter for direction
    );
  };
  
  // Handle clicking on the main circle (base click)
  const handleMainCircleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMainCircleClickLogic(
      e,
      gameState.roundActive,
      gameState.setScale,
      containerRef,
      addTokens,
      startRound
    );
  };
  
  return {
    startRound,
    handleTargetClick,
    handleMainCircleClick
  };
};
