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
import { EffectsRenderer } from "./EffectsRenderer";
import { SoundManager } from "./SoundManager";
import { loadPalette } from "./Palette";

// How far through a step the snake is when it reaches the apple it ate
const EAT_PROGRESS = 0.6;
const SWIPE_THRESHOLD_PX = 24;

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
  private world: World;
  private readonly worldSize: number;
  private isGameRunning: boolean = false;

  // Timing and animation state
  private lastStepAt = 0;
  private lastFrameAt = 0;
  private previousBody: number[] = [];
  private currentBody: number[] = [];
  private lastPoints = 0;
  private lastFoodCell: number | undefined;
  private eating: { cell: number; startedAt: number } | null = null;

  // Rendering components
  private snakeRenderer: SnakeRenderer | null = null;
  private foodRenderer: FoodRenderer | null = null;
  private gridRenderer: GridRenderer | null = null;
  private uiRenderer: UIRenderer | null = null;
  private effectsRenderer: EffectsRenderer | null = null;
  private sound: SoundManager | null = null;

  private constructor() {
    this.config = createDefaultConfig();
    this.world = World.new(this.config.WORLD_SIZE, this.config.SNAKE_SPAWN_IDX);
    this.worldSize = this.world.get_width();

    // Initialize DOM elements
    this.canvas = document.getElementById(
      this.config.canvasId,
    ) as HTMLCanvasElement;

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

    const palette = loadPalette();
    const args = [this.ctx, this.config, this.worldSize, palette] as const;
    this.snakeRenderer = new SnakeRenderer(...args);
    this.foodRenderer = new FoodRenderer(...args);
    this.gridRenderer = new GridRenderer(...args);
    this.effectsRenderer = new EffectsRenderer(...args);
    this.uiRenderer = new UIRenderer(this.activate);
    this.sound = new SoundManager();
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
      this.syncBodies();
      document.addEventListener("keydown", this.handleDirectionChange);
      document.addEventListener("keydown", this.handleActivateKey);
      this.attachSwipeControls();
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
   * Steer by swiping on the board. Touch and pen only, so mouse drags
   * do nothing. The swipe origin resets after each turn, so a player can
   * chain turns without lifting their finger.
   */
  private attachSwipeControls(): void {
    const board = document.querySelector<HTMLElement>(".board");
    if (!board) return;

    let origin: { x: number; y: number } | null = null;

    board.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;
      if (event.target instanceof HTMLButtonElement) return;
      origin = { x: event.clientX, y: event.clientY };
    });

    board.addEventListener("pointermove", (event) => {
      if (!origin) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD_PX) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.world.change_direction(dx > 0 ? Direction.Right : Direction.Left);
      } else {
        this.world.change_direction(dy > 0 ? Direction.Down : Direction.Up);
      }
      origin = { x: event.clientX, y: event.clientY };
    });

    const end = (): void => {
      origin = null;
    };
    board.addEventListener("pointerup", end);
    board.addEventListener("pointercancel", end);
  }

  /**
   * Space starts or restarts the game. When a button has focus, Space
   * belongs to the button and its click handler does the work.
   */
  private handleActivateKey = (event: KeyboardEvent): void => {
    if (event.code !== "Space" || event.target instanceof HTMLButtonElement) {
      return;
    }
    event.preventDefault();
    this.activate();
  };

  /**
   * Start a ready game, or restart a finished one. Shared by the Space
   * key and the overlay button.
   */
  private activate = (): void => {
    this.sound?.unlock();

    if (this.world.get_game_state() === GameState.Ready) {
      this.world.game_start();
      this.lastStepAt = performance.now();
      this.sound?.start();
    } else if (!this.isGameRunning) {
      this.resetGame();
    }
  };

  /**
   * Time between steps for the current score. Each apple shaves a
   * little off, easing toward the minimum rather than jumping.
   */
  private getStepMs(): number {
    const { START_STEP_MS, MIN_STEP_MS, SPEEDUP_PER_POINT } = this.config;
    return Math.max(
      MIN_STEP_MS,
      START_STEP_MS * Math.pow(SPEEDUP_PER_POINT, this.world.get_point()),
    );
  }

  /**
   * Read the snake's current cells and reset the animation to rest there
   */
  private syncBodies(): void {
    if (!this.getSnakeBody) return;
    this.currentBody = this.readBody();
    this.previousBody = this.currentBody;
  }

  private readBody(): number[] {
    return this.getSnakeBody
      ? this.getSnakeBody(
          this.world.get_first_cell_ptr(),
          this.world.get_snake_len(),
        )
      : [];
  }

  /**
   * Start the game animation loop
   */
  private startGameLoop(): void {
    requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    if (!this.ctx || !this.canvas || !this.isGameRunning) return;

    const dt = Math.min((now - this.lastFrameAt) / 1000, 0.05);
    this.lastFrameAt = now;

    this.advance(now);
    this.renderFrame(now, dt);
    this.startGameLoop();
  };

  /**
   * Step the game when enough time has passed. Input is read every frame,
   * but the snake only moves once per step.
   */
  private advance(now: number): void {
    if (this.world.get_game_state() !== GameState.Playing) return;

    const stepMs = this.getStepMs();
    if (now - this.lastStepAt < stepMs) return;

    this.previousBody = this.currentBody;
    this.world.step();
    this.currentBody = this.readBody();

    // Keep a steady rhythm, but don't try to catch up after a hidden tab
    this.lastStepAt += stepMs;
    if (now - this.lastStepAt > stepMs) this.lastStepAt = now;
  }

  /**
   * Render a single frame of the game
   */
  private renderFrame(now: number, dt: number): void {
    if (
      !this.ctx ||
      !this.gridRenderer ||
      !this.snakeRenderer ||
      !this.foodRenderer ||
      !this.effectsRenderer ||
      !this.uiRenderer ||
      !this.getSnakeBody
    )
      return;

    this.ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
    this.gridRenderer.drawGrid();

    const gameState = this.world.get_game_state();
    const points = this.world.get_point();
    const foodCell = this.world.get_food_idx();

    // An apple was eaten this step: keep drawing it until the head reaches it
    if (points > this.lastPoints && this.lastFoodCell !== undefined) {
      this.eating = { cell: this.lastFoodCell, startedAt: this.lastStepAt };
    }
    this.lastPoints = points;
    this.lastFoodCell = foodCell;

    if (this.eating) {
      const progress = (now - this.eating.startedAt) / this.getStepMs();
      if (progress >= EAT_PROGRESS || gameState !== GameState.Playing) {
        this.effectsRenderer.burst(this.eating.cell);
        this.sound?.eat();
        this.eating = null;
      } else {
        this.foodRenderer.drawFoodAt(this.eating.cell, 1, now);
      }
    }

    if (foodCell) this.foodRenderer.drawFood(foodCell, now);

    const progress =
      gameState === GameState.Playing
        ? Math.min(Math.max((now - this.lastStepAt) / this.getStepMs(), 0), 1)
        : 1;
    this.snakeRenderer.drawSnake(
      this.previousBody,
      this.currentBody,
      progress,
      this.world.get_direction(),
      gameState === GameState.GameOver,
    );

    this.effectsRenderer.draw(dt);
    this.uiRenderer.updateScore(points);

    if (gameState === GameState.Ready) {
      this.uiRenderer.displayStartScreen();
    } else if (gameState === GameState.Playing) {
      this.uiRenderer.hideOverlay();
    } else {
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
      this.uiRenderer.displayGameOver(points);
      this.sound?.gameOver();
      this.stopGame();
    } else if (gameState === GameState.Won) {
      this.uiRenderer.displayGameWon(points);
      this.sound?.win();
      this.stopGame();
    }
  }

  /**
   * Stop the game loop
   */
  public stopGame(): void {
    this.isGameRunning = false;
    document.removeEventListener("keydown", this.handleDirectionChange);
  }

  /**
   * Reset the game to the initial state
   */
  private resetGame(): void {
    // Create a new world instance
    const newSpawnIdx = Math.floor(
      Math.random() * DEFAULT_WORLD_SIZE * DEFAULT_WORLD_SIZE,
    );
    this.world = World.new(this.config.WORLD_SIZE, newSpawnIdx);
    this.lastPoints = 0;
    this.lastFoodCell = undefined;
    this.eating = null;
    this.syncBodies();

    // Restart the game loop
    this.isGameRunning = true;
    document.addEventListener("keydown", this.handleDirectionChange);
    this.startGameLoop();
  }
}

// Export the singleton instance
export const gameManager = GameManager.getInstance();
