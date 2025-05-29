import { Direction, World, GameState } from "snake_game";
import { getSnakeBodyType } from "../bootstrap";
import {
  GameConfig,
  createDefaultConfig,
  DEFAULT_WORLD_SIZE,
} from "./GameConfig";
import { SnakeRenderer } from "./SnakeRenderer";
import { FoodRenderer } from "./FoodRenderer";
import { GridRenderer } from "./GridRenderer";
import { UIRenderer } from "./UIRenderer";

/**
 * Main game manager class that coordinates all game components
 */
export class GameManager {
  private static instance: GameManager;

  // Game state and components
  private getSnakeBody: getSnakeBodyType | null = null;
  private readonly config: GameConfig;
  private readonly canvas: HTMLCanvasElement | null = null;
  private readonly ctx: CanvasRenderingContext2D | null = null;
  private readonly pointsElement: HTMLSpanElement | null = null;
  private world: World;
  private readonly worldSize: number;
  private isGameRunning: boolean = false;

  // Rendering components
  private snakeRenderer: SnakeRenderer | null = null;
  private foodRenderer: FoodRenderer | null = null;
  private gridRenderer: GridRenderer | null = null;
  private uiRenderer: UIRenderer | null = null;

  private constructor() {
    this.config = createDefaultConfig();
    this.world = World.new(this.config.WORLD_SIZE, this.config.SNAKE_SPAWN_IDX);
    this.worldSize = this.world.get_width();

    // Initialize DOM elements
    this.canvas = document.getElementById(
      this.config.canvasId,
    ) as HTMLCanvasElement;
    this.pointsElement = document.getElementById(
      this.config.pointsElementId,
    ) as HTMLSpanElement;

    if (!this.canvas) {
      console.error(
        `Canvas with ID '${this.config.canvasId}' not found in the document`,
      );
      this.worldSize = 0;
      return;
    }

    this.ctx = this.canvas.getContext("2d");

    if (!this.ctx) {
      console.error("Failed to get 2D context from canvas element");
      return;
    }

    // Initialize renderers
    this.initializeRenderers();
  }

  /**
   * Initialize all renderer components
   */
  private initializeRenderers(): void {
    if (!this.ctx || !this.canvas) return;

    this.snakeRenderer = new SnakeRenderer(
      this.ctx,
      this.config,
      this.worldSize,
    );
    this.foodRenderer = new FoodRenderer(this.ctx, this.config, this.worldSize);
    this.gridRenderer = new GridRenderer(this.ctx, this.config, this.worldSize);
    this.uiRenderer = new UIRenderer(this.ctx, this.canvas);
  }

  /**
   * Get the singleton instance of GameManager
   */
  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  /**
   * Initialize the game and start the game loop
   */
  public initGame(getSnakeBody: getSnakeBodyType): void {
    this.getSnakeBody = getSnakeBody;

    if (!this.canvas || !this.ctx) {
      console.error(
        "Cannot initialize game: Canvas or context is not available",
      );
      return;
    }

    this.canvas.height = this.config.CELL_SIZE * this.worldSize;
    this.canvas.width = this.config.CELL_SIZE * this.worldSize;

    if (!this.isGameRunning) {
      this.isGameRunning = true;
      document.addEventListener("keydown", this.handleDirectionChange);
      document.addEventListener("keydown", this.handleGameStart);
      this.startGameLoop();
    }
  }

  /**
   * Handle direction changes from user input
   */
  private handleDirectionChange = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "ArrowLeft":
        this.world.change_direction(Direction.Left);
        event.preventDefault();
        break;
      case "ArrowRight":
        this.world.change_direction(Direction.Right);
        event.preventDefault();
        break;
      case "ArrowDown":
        this.world.change_direction(Direction.Down);
        event.preventDefault();
        break;
      case "ArrowUp":
        this.world.change_direction(Direction.Up);
        event.preventDefault();
        break;
      default:
        return;
    }
  };

  /**
   * Handle game start with spacer
   */
  private handleGameStart = (event: KeyboardEvent): void => {
    if (
      event.code === "Space" &&
      this.world.get_game_state() === GameState.Ready
    ) {
      document.removeEventListener("keydown", this.handleGameStart);
      this.world.game_start();
      event.preventDefault();
    }
  };

  /**
   * Start the game animation loop
   */
  private startGameLoop(): void {
    setTimeout(() => {
      if (!this.ctx || !this.canvas || !this.isGameRunning) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.renderFrame();

      // Only call a step if the game is still playing
      if (this.world.get_game_state() === GameState.Playing) {
        this.world.step();
      }

      requestAnimationFrame(() => this.startGameLoop());
    }, 1000 / this.config.FPS);
  }

  /**
   * Render a single frame of the game
   */
  private renderFrame(): void {
    if (
      !this.gridRenderer ||
      !this.snakeRenderer ||
      !this.foodRenderer ||
      !this.uiRenderer ||
      !this.getSnakeBody
    )
      return;

    // Draw the grid first
    this.gridRenderer.drawGrid();

    // Check game state
    const gameState = this.world.get_game_state();

    if (gameState === GameState.Ready) {
      // Ready state - show start screen
      this.uiRenderer.displayStartScreen();
    } else {
      // Game is in progress, over, or won
      // Draw snake and food
      const snakeBody = this.getSnakeBody(
        this.world.get_first_cell_ptr(),
        this.world.get_snake_len(),
      );

      this.snakeRenderer.drawSnake(
        snakeBody,
        () => this.world.get_direction(),
        gameState === GameState.GameOver,
      );

      const foodCell = this.world.get_food_idx();
      if (foodCell) {
        this.foodRenderer.drawFood(foodCell);
      }

      // Update score display
      this.uiRenderer.updateScore(this.pointsElement, this.world.get_point());

      // Check for game over or win conditions
      this.checkGameState();
    }
  }

  /**
   * Check the current game state and display the appropriate message
   */
  private checkGameState(): void {
    if (!this.uiRenderer) return;

    const gameState = this.world.get_game_state();
    const points = this.world.get_point();

    if (gameState === GameState.GameOver) {
      // Game Over
      this.uiRenderer.displayGameOver(points);
      this.stopGame();
    } else if (gameState === GameState.Won) {
      // Won
      this.uiRenderer.displayGameWon(points);
      this.stopGame();
    }
  }

  /**
   * Stop the game loop
   */
  public stopGame(): void {
    this.isGameRunning = false;
    document.removeEventListener("keydown", this.handleDirectionChange);
    document.addEventListener("keydown", this.handleRestart);
  }

  /**
   * Handle restart game with spacer
   */
  private handleRestart = (event: KeyboardEvent): void => {
    if (event.code === "Space") {
      document.removeEventListener("keydown", this.handleRestart);
      this.resetGame();
      event.preventDefault();
    }
  };

  /**
   * Reset the game to the initial state
   */
  private resetGame(): void {
    // Create a new world instance
    const newSpawnIdx = Math.floor(
      Math.random() * DEFAULT_WORLD_SIZE * DEFAULT_WORLD_SIZE,
    );
    this.world = World.new(this.config.WORLD_SIZE, newSpawnIdx);

    // Restart the game loop
    this.isGameRunning = true;
    document.addEventListener("keydown", this.handleDirectionChange);
    document.addEventListener("keydown", this.handleGameStart);
    this.startGameLoop();
  }
}

// Export the singleton instance
export const gameManager = GameManager.getInstance();
