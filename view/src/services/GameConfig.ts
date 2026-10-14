/**
 * Game configuration interface
 */
export interface GameConfig {
  readonly CELL_SIZE: number;
  readonly WORLD_SIZE: number;
  readonly SNAKE_SPAWN_IDX: number;
  /** Time between steps at the start of a run, in ms */
  readonly START_STEP_MS: number;
  /** Fastest the snake can get, in ms per step */
  readonly MIN_STEP_MS: number;
  /** Each apple multiplies the step time by this, so speed ramps smoothly */
  readonly SPEEDUP_PER_POINT: number;
  readonly canvasId: string;
}

/**
 * Default game configuration
 */
export const DEFAULT_WORLD_SIZE = 12;

/**
 * Creates a default game configuration
 */
export function createDefaultConfig(): GameConfig {
  return {
    CELL_SIZE: 48,
    WORLD_SIZE: DEFAULT_WORLD_SIZE,
    SNAKE_SPAWN_IDX: Math.floor(
      Math.random() * DEFAULT_WORLD_SIZE * DEFAULT_WORLD_SIZE,
    ),
    START_STEP_MS: 240,
    MIN_STEP_MS: 70,
    SPEEDUP_PER_POINT: 0.96,
    canvasId: "snake-canvas",
  };
}
