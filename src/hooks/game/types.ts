
// Game-related types and interfaces

// Position interface for the breast target
export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  roundActive: boolean;
  targetsHit: number;
  targetPosition: Position;
  showTarget: boolean;
  roundScore: number;
  consecutiveClicks: number;
  lastClickTime: number;
  scale: number;
}

export interface GameConfig {
  maxTargets: number;
  animationSpeed: number;
  targetSize: number;
}
