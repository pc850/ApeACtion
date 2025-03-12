
import { useState, useRef, useEffect } from 'react';
import { useTokens } from '@/context/TokenContext';
import { createFloatingNumber } from '@/lib/animations';
import { cn } from '@/lib/utils';

const ClickToEarn = () => {
  const { addTokens } = useTokens();
  const [scale, setScale] = useState(1);
  const [consecutiveClicks, setConsecutiveClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reset consecutive clicks if user hasn't clicked for a while
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      if (Date.now() - lastClickTime > 2000 && consecutiveClicks > 0) {
        setConsecutiveClicks(0);
      }
    }, 2000);
    
    return () => clearTimeout(resetTimer);
  }, [lastClickTime, consecutiveClicks]);
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Animation effect
    setScale(0.95);
    setTimeout(() => setScale(1), 150);
    
    // Calculate bonus based on click speed
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    setLastClickTime(now);
    
    let tokensToAdd = 1; // Base amount
    
    // Add bonus tokens for consecutive rapid clicks
    if (timeSinceLastClick < 500) {
      setConsecutiveClicks(prev => prev + 1);
      
      if (consecutiveClicks >= 5) {
        tokensToAdd += Math.min(Math.floor(consecutiveClicks / 5), 5);
      }
    } else {
      setConsecutiveClicks(1);
    }
    
    // Create floating number animation at click position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      createFloatingNumber(x, y, tokensToAdd, containerRef.current);
    }
    
    // Add tokens
    addTokens(tokensToAdd);
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <span className="inline-block text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
          Tap to Earn
        </span>
        <h1 className="text-3xl font-bold mb-1">Click & Earn Tokens</h1>
        <p className="text-muted-foreground">
          Tap the character below to earn tokens!
        </p>
      </div>
      
      <div
        onClick={handleClick}
        className={cn(
          "relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden cursor-pointer",
          "clickable-element shadow-xl"
        )}
        style={{ 
          transform: `scale(${scale})`,
          transition: 'transform 150ms ease-out',
        }}
      >
        {/* Character Image */}
        <img
          src="https://images.unsplash.com/photo-1499155286265-79a9dc9c6380?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          alt="Click to earn"
          className="w-full h-full object-cover rounded-full"
        />
        
        {/* Pulsing Effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-soft pointer-events-none" />
        
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-transparent opacity-70 pointer-events-none" />
      </div>
      
      <div className="mt-8 text-center text-lg">
        <p>
          <span className="font-semibold text-xl">
            Tap faster for bonus tokens!
          </span>
        </p>
        {consecutiveClicks > 1 && (
          <p className="text-primary font-medium mt-2">
            {consecutiveClicks} consecutive clicks!
          </p>
        )}
      </div>
    </div>
  );
};

export default ClickToEarn;
