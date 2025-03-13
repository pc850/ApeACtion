
import { createFloatingNumber } from '@/lib/animations';

// Calculate tokens earned based on consecutive clicks
export const calculateTokensEarned = (consecutiveClicks: number): number => {
  let tokensEarned = 2; // Base amount for hitting the target
  
  // Add bonus tokens for consecutive rapid hits
  if (consecutiveClicks >= 3) {
    tokensEarned += Math.min(Math.floor(consecutiveClicks / 3), 5);
  }
  
  return tokensEarned;
};

// Display floating number at the click position
export const displayTokensEarned = (
  e: React.MouseEvent, 
  containerRef: React.RefObject<HTMLDivElement>,
  tokensEarned: number
) => {
  if (containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createFloatingNumber(x, y, tokensEarned, containerRef.current);
  }
};
