
import { useRef } from 'react';
import { useClickGame } from '@/hooks/useClickGame';
import GameProgress from './game/GameProgress';
import MainCircle from './game/MainCircle';

const ClickToEarn = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCircleRef = useRef<HTMLDivElement>(null);

  const { 
    gameState, 
    gameConfig, 
    handleTargetClick, 
    handleMainCircleClick 
  } = useClickGame(containerRef, mainCircleRef);

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
          {gameState.roundActive 
            ? `Hit ${gameConfig.maxTargets - gameState.targetsHit} more breast${gameConfig.maxTargets - gameState.targetsHit !== 1 ? "s" : ""} to complete the round!` 
            : "Tap the circle below to start!"
          }
        </p>
      </div>
      
      {/* Game progress */}
      {gameState.roundActive && (
        <GameProgress 
          currentTargets={gameState.targetsHit} 
          maxTargets={gameConfig.maxTargets} 
        />
      )}
      
      {/* Main clickable circle */}
      <MainCircle 
        scale={gameState.scale}
        roundActive={gameState.roundActive}
        showTarget={gameState.showTarget}
        targetPosition={gameState.targetPosition}
        targetSize={gameConfig.targetSize}
        onCircleClick={handleMainCircleClick}
        onTargetClick={handleTargetClick}
        mainCircleRef={mainCircleRef}
      />
      
      <div className="mt-8 text-center text-lg">
        <p>
          <span className="font-semibold text-xl">
            {gameState.roundActive 
              ? "Click the moving breast target!" 
              : "Tap to start a round!"
            }
          </span>
        </p>
        {gameState.roundActive && gameState.roundScore > 0 && (
          <p className="text-primary font-medium mt-2">
            Round score: {gameState.roundScore} tokens
          </p>
        )}
        {!gameState.roundActive && gameState.consecutiveClicks > 1 && (
          <p className="text-primary font-medium mt-2">
            {gameState.consecutiveClicks} consecutive clicks!
          </p>
        )}
      </div>
    </div>
  );
};

export default ClickToEarn;
