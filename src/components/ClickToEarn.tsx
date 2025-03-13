import { useState, useRef, useEffect } from 'react';
import { useTokens } from '@/context/TokenContext';
import { createFloatingNumber } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { CircleUser, Target } from 'lucide-react';

// Position interface for the breast target
interface Position {
  x: number;
  y: number;
}

const ClickToEarn = () => {
  const { addTokens } = useTokens();
  const [scale, setScale] = useState(1);
  const [consecutiveClicks, setConsecutiveClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCircleRef = useRef<HTMLDivElement>(null);

  // Game state
  const [roundActive, setRoundActive] = useState(false);
  const [targetsHit, setTargetsHit] = useState(0);
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, y: 0 });
  const [showTarget, setShowTarget] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [direction, setDirection] = useState({ dx: 0, dy: 0 });
  const [changeDirectionTimer, setChangeDirectionTimer] = useState<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const MAX_TARGETS = 5; // User requested 5 targets per round
  const ANIMATION_SPEED = 2; // Controls speed of the target in pixels per frame
  const TARGET_SIZE = 48; // Size of the breast target in pixels

  // Reset consecutive clicks if user hasn't clicked for a while
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      if (Date.now() - lastClickTime > 2000 && consecutiveClicks > 0) {
        setConsecutiveClicks(0);
      }
    }, 2000);
    
    return () => clearTimeout(resetTimer);
  }, [lastClickTime, consecutiveClicks]);

  // Generate a random position within the main circle
  const generateRandomPosition = (): Position => {
    if (!mainCircleRef.current) return { x: 0, y: 0 };

    const mainCircle = mainCircleRef.current.getBoundingClientRect();
    const centerX = mainCircle.width / 2;
    const centerY = mainCircle.height / 2;
    const radius = (mainCircle.width / 2) * 0.8; // Stay within 80% of the radius to avoid touching the edge
    
    // Generate random angle and distance from center (within the radius)
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    // Calculate position
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    
    return { x, y };
  };
  
  // Generate a random movement direction
  const generateRandomDirection = () => {
    const angle = Math.random() * 2 * Math.PI;
    return {
      dx: Math.cos(angle) * ANIMATION_SPEED,
      dy: Math.sin(angle) * ANIMATION_SPEED
    };
  };
  
  // Schedule periodic direction changes
  const scheduleDirectionChange = () => {
    // Clear any existing timer
    if (changeDirectionTimer) {
      clearTimeout(changeDirectionTimer);
    }
    
    // Set a new timer to change direction randomly
    const timer = setTimeout(() => {
      setDirection(generateRandomDirection());
      scheduleDirectionChange(); // Schedule the next change
    }, 1000 + Math.random() * 2000); // Change direction every 1-3 seconds
    
    setChangeDirectionTimer(timer);
  };
  
  // Clean up the direction change timer
  useEffect(() => {
    return () => {
      if (changeDirectionTimer) {
        clearTimeout(changeDirectionTimer);
      }
    };
  }, [changeDirectionTimer]);
  
  // Animate the target with the current direction
  const animateTarget = () => {
    if (!mainCircleRef.current || !showTarget || !roundActive) return;
    
    const mainCircle = mainCircleRef.current.getBoundingClientRect();
    const centerX = mainCircle.width / 2;
    const centerY = mainCircle.height / 2;
    const radius = (mainCircle.width / 2) * 0.8 - (TARGET_SIZE / 2); // Adjust for target size
    
    setTargetPosition(prev => {
      // Calculate new position
      let newX = prev.x + direction.dx;
      let newY = prev.y + direction.dy;
      
      // Calculate distance from center
      const dx = newX - centerX;
      const dy = newY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If target would go outside the circle, bounce it back
      if (distance > radius) {
        // Calculate the angle of the current position
        const angle = Math.atan2(dy, dx);
        
        // Create a new direction that bounces back
        const newDirection = {
          dx: -direction.dx,
          dy: -direction.dy
        };
        
        // Update the direction
        setDirection(newDirection);
        
        // Keep the target within the circle
        newX = centerX + (radius - 2) * Math.cos(angle);
        newY = centerY + (radius - 2) * Math.sin(angle);
      }
      
      return { x: newX, y: newY };
    });
    
    if (roundActive && showTarget) {
      animationRef.current = requestAnimationFrame(animateTarget);
    }
  };
  
  // Start a new round of the game
  const startRound = () => {
    setRoundActive(true);
    setTargetsHit(0);
    setRoundScore(0);
    
    // Generate initial direction and position
    setDirection(generateRandomDirection());
    setTargetPosition(generateRandomPosition());
    setShowTarget(true);
    
    // Schedule direction changes
    scheduleDirectionChange();
    
    // Start the animation
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animateTarget);
  };
  
  // Clean up animation on component unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Start animation when target becomes visible
  useEffect(() => {
    if (showTarget && roundActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animateTarget);
    }
  }, [showTarget, roundActive]);
  
  // Handle clicking on the breast target
  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Update scores
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    setLastClickTime(now);
    
    let tokensEarned = 2; // Base amount for hitting the target
    
    // Add bonus tokens for consecutive rapid hits
    if (timeSinceLastClick < 500) {
      setConsecutiveClicks(prev => prev + 1);
      
      if (consecutiveClicks >= 3) {
        tokensEarned += Math.min(Math.floor(consecutiveClicks / 3), 5);
      }
    } else {
      setConsecutiveClicks(1);
    }
    
    // Create floating number animation
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      createFloatingNumber(x, y, tokensEarned, containerRef.current);
    }
    
    // Update game state
    setRoundScore(prev => prev + tokensEarned);
    addTokens(tokensEarned);
    setTargetsHit(prev => prev + 1);
    
    // Hide the current target
    setShowTarget(false);
    
    // Check if round is complete
    if (targetsHit + 1 >= MAX_TARGETS) {
      // Round complete!
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      if (changeDirectionTimer) {
        clearTimeout(changeDirectionTimer);
      }
      
      setTimeout(() => {
        setRoundActive(false);
      }, 500);
    } else {
      // Spawn a new target after a short delay
      setTimeout(() => {
        setTargetPosition(generateRandomPosition());
        setShowTarget(true);
      }, 300);
    }
  };
  
  // Handle clicking on the main circle (base click)
  const handleMainCircleClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    startRound();
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full max-w-lg mx-auto h-[600px]"
    >
      <div className="text-center mb-8">
        <span className="inline-block text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
          Tap to Earn
        </span>
        <h1 className="text-3xl font-bold mb-1">Click & Earn Tokens</h1>
        <p className="text-muted-foreground">
          {roundActive 
            ? `Hit ${MAX_TARGETS - targetsHit} more breast${MAX_TARGETS - targetsHit !== 1 ? "s" : ""} to complete the round!` 
            : "Tap the circle below to start!"
          }
        </p>
      </div>
      
      {/* Game progress */}
      {roundActive && (
        <div className="w-full max-w-xs mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{targetsHit}/{MAX_TARGETS}</span>
          </div>
          <Progress value={(targetsHit / MAX_TARGETS) * 100} />
        </div>
      )}
      
      {/* Main clickable circle */}
      <div
        ref={mainCircleRef}
        onClick={handleMainCircleClick}
        className={cn(
          "relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden cursor-pointer",
          "clickable-element shadow-xl",
          roundActive && "pointer-events-none opacity-90"
        )}
        style={{ 
          transform: `scale(${scale})`,
          transition: 'transform 150ms ease-out',
          background: 'linear-gradient(135deg, #FF69B4, #D946EF)',
        }}
      >
        {/* Main Circle Icon/Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CircleUser className="w-32 h-32 text-white/80" />
        </div>
        
        {/* Breast Target */}
        {showTarget && roundActive && (
          <div
            onClick={handleTargetClick}
            className="absolute w-12 h-12 rounded-full bg-[#FFDEE2] cursor-pointer hover:scale-105 transition-transform z-10 animate-pulse"
            style={{
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y}px`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px rgba(217, 70, 239, 0.5)',
            }}
          >
            {/* Inner circle for nipple effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#D946EF]" />
            
            {/* Target indicator */}
            <div className="absolute -top-1 -right-1">
              <Target className="w-4 h-4 text-primary animate-pulse" />
            </div>
          </div>
        )}
        
        {/* Pulsing Effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-soft pointer-events-none" />
        
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-transparent opacity-70 pointer-events-none" />
      </div>
      
      <div className="mt-8 text-center text-lg">
        <p>
          <span className="font-semibold text-xl">
            {roundActive 
              ? "Click the moving breast target!" 
              : "Tap to start a round!"
            }
          </span>
        </p>
        {roundActive && roundScore > 0 && (
          <p className="text-primary font-medium mt-2">
            Round score: {roundScore} tokens
          </p>
        )}
        {!roundActive && consecutiveClicks > 1 && (
          <p className="text-primary font-medium mt-2">
            {consecutiveClicks} consecutive clicks!
          </p>
        )}
      </div>
    </div>
  );
};

export default ClickToEarn;
