import { Dispatch, SetStateAction, RefObject } from 'react';
import { Position, GameConfig, LevelConfig } from './types';
import { generateRandomPosition, generateRandomDirection } from './animationUtils';
import { calculateTokensEarned, displayTokensEarned } from './scoreUtils';
import { createFloatingNumber } from '@/lib/animations';

// Start a new round of the game
export const startRound = (
  setRoundActive: Dispatch<SetStateAction<boolean>>,
  setTargetsHit: Dispatch<SetStateAction<number>>,
  setRoundScore: Dispatch<SetStateAction<number>>,
  setSpeedMultiplier: Dispatch<SetStateAction<number>>,
  setDirection: Dispatch<SetStateAction<{dx: number, dy: number}>>,
  setTargetPosition: Dispatch<SetStateAction<Position>>,
  setShowTarget: Dispatch<SetStateAction<boolean>>,
  scheduleDirectionChange: () => void,
  animateTarget: () => void,
  roundsCompleted: number,
  currentLevel: number,
  getCurrentLevelConfig: () => LevelConfig,
  mainCircleRef: RefObject<HTMLDivElement>,
  animationRef: RefObject<number | null>
) => {
  setRoundActive(true);
  setTargetsHit(0);
  setRoundScore(0);
  
  // Get current level config
  const levelConfig = getCurrentLevelConfig();
  
  // Set initial speed based on level and rounds completed for added difficulty
  const baseSpeedMultiplier = levelConfig.speedMultiplier + (roundsCompleted * 0.05); // Reduced incremental difficulty
  setSpeedMultiplier(baseSpeedMultiplier);
  
  // Generate initial direction and position with level-based velocity
  // Ensure we have a meaningful direction vector with good speed
  const initialDirection = generateRandomDirection(baseSpeedMultiplier, roundsCompleted);
  setDirection(initialDirection);
  setTargetPosition(generateRandomPosition(mainCircleRef));
  setShowTarget(true);
  
  // Schedule direction changes
  scheduleDirectionChange();
  
  // Start the animation - Fix: Don't directly modify the ref
  if (animationRef.current !== null) {
    cancelAnimationFrame(animationRef.current);
  }
  // Call animateTarget which will set animationRef internally
  animateTarget();
};

// Handle clicking on the breast target
export const handleTargetClick = (
  e: React.MouseEvent,
  containerRef: RefObject<HTMLDivElement>,
  setLastClickTime: Dispatch<SetStateAction<number>>,
  lastClickTime: number,
  setConsecutiveClicks: Dispatch<SetStateAction<number>>,
  consecutiveClicks: number,
  setRoundScore: Dispatch<SetStateAction<number>>,
  addTokens: (amount: number) => void,
  setTargetsHit: Dispatch<SetStateAction<number>>,
  targetsHit: number,
  gameConfig: GameConfig,
  currentLevel: number,
  getCurrentLevelConfig: () => LevelConfig,
  setCurrentLevel: Dispatch<SetStateAction<number>>,
  setRoundsCompleted: Dispatch<SetStateAction<number>>,
  setSpeedMultiplier: Dispatch<SetStateAction<number>>,
  setTargetPosition: Dispatch<SetStateAction<Position>>,
  mainCircleRef: RefObject<HTMLDivElement>,
  animationRef: RefObject<number | null>,
  animateTarget: () => void
) => {
  e.stopPropagation();
  
  // Get current level config
  const levelConfig = getCurrentLevelConfig();
  
  // Update scores
  const now = Date.now();
  const timeSinceLastClick = now - lastClickTime;
  setLastClickTime(now);
  
  // Update consecutive clicks based on timing
  if (timeSinceLastClick < 500) {
    setConsecutiveClicks(prev => prev + 1);
  } else {
    setConsecutiveClicks(1);
  }
  
  // Calculate tokens earned with level bonus
  const levelBonus = Math.max(1, Math.floor(currentLevel / 2)); // Higher levels give more tokens
  const tokensEarned = calculateTokensEarned(consecutiveClicks) + levelBonus;
  
  // Create floating number animation
  displayTokensEarned(e, containerRef, tokensEarned);
  
  // Update game state
  setRoundScore(prev => prev + tokensEarned);
  addTokens(tokensEarned);
  setTargetsHit(prev => prev + 1);
  
  // Check if level is complete
  if (targetsHit + 1 >= levelConfig.targetsRequired) {
    // Increase rounds completed counter
    setRoundsCompleted(prev => prev + 1);
    
    // Check if we should advance to the next level
    if (currentLevel < gameConfig.levels.length) {
      setCurrentLevel(prev => prev + 1);
    }
    
    // Don't end the round, just reset targets hit and show a new target with increased difficulty
    setTimeout(() => {
      // Reset targets hit but keep the round active
      setTargetsHit(0);
      
      // Get the new level config (may be the same level if we're at max)
      const newLevelConfig = getCurrentLevelConfig();
      
      // Increase speed significantly for the next round
      setSpeedMultiplier(newLevelConfig.speedMultiplier + 0.5); // Additional boost
      
      // Generate a new position for the target
      setTargetPosition(generateRandomPosition(mainCircleRef));
      
      // Reset animation but don't directly modify the ref.current
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      // Call animateTarget which will set the ref internally
      animateTarget();
    }, 100); // Short delay for faster gameplay
  } else {
    // Increase the speed multiplier for the next target
    setSpeedMultiplier(prev => prev + 0.1); // Reduced speed increment
    
    // Spawn a new target after a shorter delay
    setTimeout(() => {
      setTargetPosition(generateRandomPosition(mainCircleRef));
      
      // Ensure animation continues
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      // Call animateTarget which will set the ref internally
      animateTarget();
    }, 100); // Even shorter delay for faster gameplay
  }
};

// Handle clicking on the main circle (base click)
export const handleMainCircleClick = (
  e: React.MouseEvent<HTMLDivElement>,
  roundActive: boolean,
  setScale: Dispatch<SetStateAction<number>>,
  containerRef: RefObject<HTMLDivElement>,
  addTokens: (amount: number) => void,
  startRoundFn: () => void
) => {
  if (roundActive) return; // Ignore clicks during active round
  
  // Animation effect
  setScale(0.95);
  setTimeout(() => setScale(1), 150);
  
  // Calculate base tokens
  let tokensToAdd = 1; // Base amount
  
  // Create floating number animation at click position
  if (containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createFloatingNumber(x, y, tokensToAdd, containerRef.current);
  }
  
  // Add tokens and start a new round
  addTokens(tokensToAdd);
  startRoundFn();
};
