/**
 * Game configuration interface
 */
export interface GameConfig {
  readonly CELL_SIZE: number;
  readonly WORLD_SIZE: number;
  readonly SNAKE_SPAWN_IDX: number;
  readonly FPS: number;
  readonly canvasId: string;
}

/**
 * Default game configuration
 */
export const DEFAULT_WORLD_SIZE = 10;

/**
 * Creates a default game configuration
 */
export function createDefaultConfig(): GameConfig {
  return {
    CELL_SIZE: 30,
    WORLD_SIZE: DEFAULT_WORLD_SIZE,
    SNAKE_SPAWN_IDX: Math.floor(
      Math.random() * DEFAULT_WORLD_SIZE * DEFAULT_WORLD_SIZE,
    ),
    FPS: 6,
    canvasId: "snake-canvas",
  };
}
