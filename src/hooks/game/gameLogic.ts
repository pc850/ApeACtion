
import { Dispatch, SetStateAction, RefObject } from 'react';
import { Position, GameConfig } from './types';
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
  mainCircleRef: RefObject<HTMLDivElement>,
  animationRef: RefObject<number | null>
) => {
  setRoundActive(true);
  setTargetsHit(0);
  setRoundScore(0);
  
  // Set initial speed based on rounds completed, with higher minimum speed
  setSpeedMultiplier(2.0 + (roundsCompleted * 0.4)); // Increased base multiplier
  
  // Generate initial direction and position with higher initial velocity
  setDirection(generateRandomDirection(2.0 + (roundsCompleted * 0.4), roundsCompleted));
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
  setRoundsCompleted: Dispatch<SetStateAction<number>>,
  setSpeedMultiplier: Dispatch<SetStateAction<number>>,
  setTargetPosition: Dispatch<SetStateAction<Position>>,
  mainCircleRef: RefObject<HTMLDivElement>,
  animationRef: RefObject<number | null>,
  animateTarget: () => void
) => {
  e.stopPropagation();
  
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
  
  // Calculate tokens earned
  const tokensEarned = calculateTokensEarned(consecutiveClicks);
  
  // Create floating number animation
  displayTokensEarned(e, containerRef, tokensEarned);
  
  // Update game state
  setRoundScore(prev => prev + tokensEarned);
  addTokens(tokensEarned);
  setTargetsHit(prev => prev + 1);
  
  // Check if round is complete
  if (targetsHit + 1 >= gameConfig.maxTargets) {
    // Increase rounds completed counter
    setRoundsCompleted(prev => prev + 1);
    
    // Don't end the round, just reset targets hit and show a new target with increased difficulty
    setTimeout(() => {
      // Reset targets hit but keep the round active
      setTargetsHit(0);
      
      // Increase speed significantly for the next round
      setSpeedMultiplier(prev => prev + 1.0); // Increased from 0.8
      
      // Generate a new position for the target
      setTargetPosition(generateRandomPosition(mainCircleRef));
      
      // Reset animation but don't directly modify the ref.current
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      // Call animateTarget which will set the ref internally
      animateTarget();
    }, 100); // Further reduced delay for faster gameplay (from 200ms)
  } else {
    // Increase the speed multiplier for the next target
    setSpeedMultiplier(prev => prev + 0.6); // Bigger speed boost
    
    // Spawn a new target after a shorter delay
    setTimeout(() => {
      setTargetPosition(generateRandomPosition(mainCircleRef));
      
      // Ensure animation continues
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      // Call animateTarget which will set the ref internally
      animateTarget();
    }, 100); // Even shorter delay for faster gameplay (from 150ms)
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
