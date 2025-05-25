import { World } from "snake_game";

/**
 * Configuration interface for the CanvasManager
 */
interface CanvasConfig {
  readonly CELL_SIZE: number;
  readonly WORLD_SIZE: number;
  readonly SNAKE_SPAWN_IDX: number;
  readonly FPS: number;
  readonly canvasId: string;
}

/**
 * CanvasManager handles the snake game rendering and game loop
 */
class CanvasManager {
  private static instance: CanvasManager;

  // Private properties
  private readonly config: CanvasConfig = {
    CELL_SIZE: 25,
    WORLD_SIZE: 9,
    SNAKE_SPAWN_IDX: 20,
    FPS: 3,
    canvasId: "snake-canvas",
  };

  private readonly canvas: HTMLCanvasElement | null = null;
  private readonly ctx: CanvasRenderingContext2D | null = null;
  private readonly world: World;
  private readonly worldSize: number;
  private isGameRunning: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.world = World.new(this.config.WORLD_SIZE, this.config.SNAKE_SPAWN_IDX);
    this.worldSize = this.world.get_width();
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
    }
  }

  /**
   * Get the singleton instance of CanvasManager
   */
  public static getInstance(): CanvasManager {
    if (!CanvasManager.instance) {
      CanvasManager.instance = new CanvasManager();
    }
    return CanvasManager.instance;
  }

  /**
   * Initialize the canvas and start the game loop
   * This is the public API method
   */
  public initCanvas(): void {
    if (!this.canvas || !this.ctx) {
      console.error(
        "Cannot initialize canvas: Canvas or context is not available",
      );
      return;
    }

    this.canvas.height = this.config.CELL_SIZE * this.worldSize;
    this.canvas.width = this.config.CELL_SIZE * this.worldSize;

    if (!this.isGameRunning) {
      this.isGameRunning = true;
      this.startGameLoop();
    }
  }

  /**
   * Start the game animation loop
   */
  private startGameLoop(): void {
    setTimeout(() => {
      if (!this.ctx || !this.canvas || !this.isGameRunning) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.world.update_snake_head();
      this.renderFrame();
      requestAnimationFrame(() => this.startGameLoop());
    }, 1000 / this.config.FPS);
  }

  /**
   * Render a single frame of the game
   */
  private renderFrame(): void {
    this.drawGrid();
    this.drawSnake();
  }

  /**
   * Draw the game grid
   */
  private drawGrid(): void {
    if (!this.ctx) return;

    this.ctx.beginPath();
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1;

    for (let line = 0; line <= this.worldSize; line++) {
      // Draw Horizontal Lines
      this.ctx.moveTo(this.config.CELL_SIZE * line, 0);
      this.ctx.lineTo(
        this.config.CELL_SIZE * line,
        this.worldSize * this.config.CELL_SIZE,
      );

      // Draw Vertical Lines
      this.ctx.moveTo(0, this.config.CELL_SIZE * line);
      this.ctx.lineTo(
        this.config.CELL_SIZE * this.worldSize,
        this.config.CELL_SIZE * line,
      );
    }

    this.ctx.stroke();
  }

  /**
   * Draw the snake on the canvas
   */
  private drawSnake(): void {
    if (!this.ctx) return;

    const snakeIdx = this.world.get_snake_head_idx();
    const col = snakeIdx % this.worldSize;
    const row = Math.floor(snakeIdx / this.worldSize);

    this.ctx.beginPath();
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(
      this.config.CELL_SIZE * col,
      this.config.CELL_SIZE * row,
      this.config.CELL_SIZE,
      this.config.CELL_SIZE,
    );
    this.ctx.stroke();
  }

  /**
   * Stop the game loop
   */
  public stopGame(): void {
    this.isGameRunning = false;
  }
}

// Export the singleton instance
export const canvasManager = CanvasManager.getInstance();
