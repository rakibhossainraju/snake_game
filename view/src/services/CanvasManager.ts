import { Direction, World } from "snake_game";
import { getSnakeBodyType } from "../bootstrap.ts";

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

const WORLD_SIZE = 10;

/**
 * CanvasManager handles the snake game rendering and game loop
 */
class CanvasManager {
  private static instance: CanvasManager;

  private getSnakeBody: getSnakeBodyType | null = null;
  // Private properties
  private readonly config: CanvasConfig = {
    CELL_SIZE: 20,
    WORLD_SIZE,
    SNAKE_SPAWN_IDX: Math.floor(Math.random() * WORLD_SIZE),
    FPS: 6,
    canvasId: "snake-canvas",
  };

  private readonly canvas: HTMLCanvasElement | null = null;
  private readonly ctx: CanvasRenderingContext2D | null = null;
  private readonly world: World;
  private readonly worldSize: number;
  private isGameRunning: boolean = false;

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
  public initCanvas(getSnakeBody: getSnakeBodyType): void {
    this.getSnakeBody = getSnakeBody;
    // ... rest of the initialization code
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
      document.addEventListener("keydown", this.handleDirectionChange);
      this.startGameLoop();
    }
  }

  handleDirectionChange = (event: KeyboardEvent): void => {
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
   * Start the game animation loop
   */
  private startGameLoop(): void {
    setTimeout(() => {
      if (!this.ctx || !this.canvas || !this.isGameRunning) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.renderFrame();
      this.world.step();
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

    const {
      config: { CELL_SIZE },
      worldSize,
    } = this;
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1;

    for (let line = 0; line <= worldSize; line++) {
      // Draw Horizontal Lines
      this.ctx.moveTo(CELL_SIZE * line, 0);
      this.ctx.lineTo(CELL_SIZE * line, worldSize * CELL_SIZE);

      // Draw Vertical Lines
      this.ctx.moveTo(0, CELL_SIZE * line);
      this.ctx.lineTo(CELL_SIZE * worldSize, CELL_SIZE * line);
    }

    this.ctx.stroke();
  }

  private drawSnake(): void {
    if (!this.ctx || !this.getSnakeBody) return;

    const snakeBody = this.getSnakeBody(
      this.world.get_first_cell_ptr(),
      this.world.get_snake_len(),
    );

    for (const [i, cellIdx] of snakeBody.entries()) {
      const col = cellIdx % this.worldSize;
      const row = Math.floor(cellIdx / this.worldSize);
      this.ctx.beginPath();
      this.ctx.fillStyle = i ? "#353591" : "#7878db";
      this.ctx.fillRect(
        this.config.CELL_SIZE * col,
        this.config.CELL_SIZE * row,
        this.config.CELL_SIZE,
        this.config.CELL_SIZE,
      );
      this.ctx.stroke();
    }
  }

  /**
   * Stop the game loop
   */
  public stopGame(): void {
    this.isGameRunning = false;
    document.removeEventListener("keydown", this.handleDirectionChange);
  }
}

// Export the singleton instance
export const canvasManager = CanvasManager.getInstance();
