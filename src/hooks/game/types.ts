
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
  currentLevel: number;
}

export interface GameConfig {
  maxTargets: number;
  animationSpeed: number;
  targetSize: number;
  levels: LevelConfig[];
}

export interface LevelConfig {
  level: number;
  targetsRequired: number;
  speedMultiplier: number;
  targetSize: number;
  description: string;
}

