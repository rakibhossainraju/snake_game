import { Direction, World } from "snake_game";
import { getSnakeBodyType } from "../bootstrap.ts";
// @ts-ignore
import { getRandomInt } from "../utils/random.js";

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
    CELL_SIZE: 30,
    WORLD_SIZE,
    SNAKE_SPAWN_IDX: Math.floor(Math.random() * WORLD_SIZE * WORLD_SIZE),
    FPS: 5,
    canvasId: "snake-canvas",
  };

  private readonly canvas: HTMLCanvasElement | null = null;
  private readonly ctx: CanvasRenderingContext2D | null = null;
  private readonly pointsElement: HTMLSpanElement | null = null;
  private world: World;
  private readonly worldSize: number;
  private isGameRunning: boolean = false;

  private constructor() {
    this.world = World.new(this.config.WORLD_SIZE, this.config.SNAKE_SPAWN_IDX);
    this.worldSize = this.world.get_width();
    // Don't auto-start the game
    this.canvas = <HTMLCanvasElement>(
      document.getElementById(this.config.canvasId)
    );
    this.pointsElement = <HTMLSpanElement>(
      document.getElementById("points-count")
    );

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
      document.addEventListener("keydown", this.handleGameStart);
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
   * Handle game start with spacebar
   */
  handleGameStart = (event: KeyboardEvent): void => {
    if (event.code === "Space" && this.world.get_game_state() === 3) {
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
      // Only call step if the game is still playing
      if (this.world.get_game_state() === 0) {
        // Playing state
        this.world.step();
      }
      requestAnimationFrame(() => this.startGameLoop());
    }, 1000 / this.config.FPS);
  }

  /**
   * Render a single frame of the game
   */
  private renderFrame(): void {
    this.drawGrid();

    // Check game state first
    const gameState = this.world.get_game_state();

    if (gameState === 3) {
      // Ready state
      this.displayStartScreen();
    } else {
      this.drawSnake();
      this.drawFood();
      this.showGamePoints();
      this.checkGameState();
    }
  }

  /**
   * Check the current game state and display appropriate message
   */
  private checkGameState(): void {
    const gameState = this.world.get_game_state();
    if (gameState === 2) {
      // GameOver
      this.displayGameOver();
      this.stopGame();
    } else if (gameState === 1) {
      // Won
      this.displayGameWon();
      this.stopGame();
    } else if (gameState === 3) {
      // Ready
      this.displayStartScreen();
    }
  }

  /**
   * Display game over message
   */
  private displayGameOver(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#ff3333";
    this.ctx.font = "bold 24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "GAME OVER",
      this.canvas.width / 2,
      this.canvas.height / 2 - 15,
    );

    this.displayScoreAndRestartText();

    // Add event listener for restart
    document.addEventListener("keydown", this.handleRestart);
  }

  /**
   * Display the score and restart text on the canvas
   */
  private displayScoreAndRestartText(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(
      `Score: ${this.world.get_point()}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 15,
    );

    this.ctx.font = "14px Arial";
    this.ctx.fillText(
      "Press SPACE to restart",
      this.canvas.width / 2,
      this.canvas.height / 2 + 45,
    );
  }

  /**
   * Display game won message
   */
  private displayGameWon(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#33ff33";
    this.ctx.font = "bold 24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "YOU WIN!",
      this.canvas.width / 2,
      this.canvas.height / 2 - 15,
    );

    this.displayScoreAndRestartText();

    // Add event listener for restart
    document.addEventListener("keydown", this.handleRestart);
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

    // Draw background
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, worldSize * CELL_SIZE, worldSize * CELL_SIZE);

    // Draw grid lines
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(52, 73, 94, 0.5)";
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

    // Draw a subtle pattern for visual interest
    for (let row = 0; row < worldSize; row++) {
      for (let col = 0; col < worldSize; col++) {
        if ((row + col) % 2 === 0) {
          this.ctx.fillStyle = "rgba(52, 73, 94, 0.1)";
          this.ctx.fillRect(
            col * CELL_SIZE,
            row * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE,
          );
        }
      }
    }
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

      // Calculate cell position
      const x = this.config.CELL_SIZE * col;
      const y = this.config.CELL_SIZE * row;
      const size = this.config.CELL_SIZE;
      const padding = 1; // Small gap between cells for a segmented look

      this.ctx.beginPath();

      // Snake head
      if (i === 0) {
        this.ctx.fillStyle = "#2ecc71";
        // Create rounded rectangle for head
        this.roundRect(
          x + padding,
          y + padding,
          size - padding * 2,
          size - padding * 2,
          5,
        );
        this.ctx.fill();

        // Add eyes
        const eyeSize = size / 8;
        this.ctx.fillStyle = "#000";

        // Position eyes based on direction
        const snakeDirection = this.world.get_direction
          ? this.world.get_direction()
          : 1; // Default to right

        // Set eye positions based on direction
        let eyeX1, eyeX2, eyeY1, eyeY2;

        // 0 = Up, 1 = Right, 2 = Down, 3 = Left
        switch (snakeDirection) {
          case 0: // Up
            eyeX1 = x + size / 3;
            eyeX2 = x + (size * 2) / 3;
            eyeY1 = y + size / 3;
            eyeY2 = y + size / 3;
            break;
          case 2: // Down
            eyeX1 = x + size / 3;
            eyeX2 = x + (size * 2) / 3;
            eyeY1 = y + (size * 2) / 3;
            eyeY2 = y + (size * 2) / 3;
            break;
          case 3: // Left
            eyeX1 = x + size / 3;
            eyeX2 = x + size / 3;
            eyeY1 = y + size / 3;
            eyeY2 = y + (size * 2) / 3;
            break;
          case 1: // Right (default)
          default:
            eyeX1 = x + (size * 2) / 3;
            eyeX2 = x + (size * 2) / 3;
            eyeY1 = y + size / 3;
            eyeY2 = y + (size * 2) / 3;
        }

        this.ctx.beginPath();
        this.ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
      // Snake body
      else {
        // Gradient from head color to tail color based on position
        const gradientPos = i / snakeBody.length;
        const r = Math.floor(46 + (26 - 46) * gradientPos);
        const g = Math.floor(204 + (174 - 204) * gradientPos);
        const b = Math.floor(113 + (159 - 113) * gradientPos);

        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.roundRect(
          x + padding,
          y + padding,
          size - padding * 2,
          size - padding * 2,
          3,
        );
        this.ctx.fill();
      }
    }
  }

  // Helper method to draw rounded rectangles
  private roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    if (!this.ctx) return;

    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.arcTo(x + width, y, x + width, y + radius, radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.arcTo(
      x + width,
      y + height,
      x + width - radius,
      y + height,
      radius,
    );
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.arcTo(x, y + height, x, y + height - radius, radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.arcTo(x, y, x + radius, y, radius);
    this.ctx.closePath();
  }

  private drawFood(): void {
    const foodCell = this.world.get_food_idx();
    if (!this.ctx || !foodCell) return;

    const col = foodCell % this.worldSize;
    const row = Math.floor(foodCell / this.worldSize);

    const x = this.config.CELL_SIZE * col;
    const y = this.config.CELL_SIZE * row;
    const size = this.config.CELL_SIZE;

    // Draw apple shape
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 - 2;

    // Apple body (red circle)
    this.ctx.beginPath();
    this.ctx.fillStyle = "#e74c3c";
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Apple highlight
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.arc(
      centerX - radius / 3,
      centerY - radius / 3,
      radius / 3,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();

    // Apple stem
    this.ctx.beginPath();
    this.ctx.fillStyle = "#27ae60";
    this.ctx.fillRect(centerX - 1, y + 2, 2, 4);
  }

  private showGamePoints(): void {
    if (!this.pointsElement) return;

    const points = this.world.get_point();
    this.pointsElement.textContent = points.toString();

    // Apply color based on score value
    if (points >= 10) {
      this.pointsElement.style.color = "#f39c12"; // Yellow/orange for higher scores

      if (points >= 20) {
        this.pointsElement.style.color = "#e74c3c"; // Red for very high scores

        if (points >= 30) {
          this.pointsElement.style.color = "#8e44ad"; // Purple for exceptional scores
        }
      }
    } else {
      this.pointsElement.style.color = "#e74c3c"; // Default red
    }

    // Apply pulsing effect on score change
    this.pointsElement.classList.add("score-pulse");
    setTimeout(() => {
      this.pointsElement?.classList.remove("score-pulse");
    }, 300);
  }

  /**
   * Stop the game loop
   */
  public stopGame(): void {
    this.isGameRunning = false;
    document.removeEventListener("keydown", this.handleDirectionChange);
  }

  /**
   * Handle restart game with spacebar
   */
  handleRestart = (event: KeyboardEvent): void => {
    if (event.code === "Space") {
      document.removeEventListener("keydown", this.handleRestart);
      this.resetGame();
      event.preventDefault();
    }
  };

  /**
   * Reset the game to initial state
   */
  private resetGame(): void {
    // Create a new world instance
    const newSpawnIdx = Math.floor(Math.random() * WORLD_SIZE * WORLD_SIZE);
    this.world = World.new(this.config.WORLD_SIZE, newSpawnIdx);

    // Restart the game loop
    this.isGameRunning = true;
    document.addEventListener("keydown", this.handleDirectionChange);
    document.addEventListener("keydown", this.handleGameStart);
    this.startGameLoop();
  }

  /**
   * Display start screen with instructions
   */
  private displayStartScreen(): void {
    if (!this.ctx || !this.canvas) return;

    // Add semi-transparent overlay
    this.ctx.fillStyle = "rgba(26, 26, 46, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw border
    this.ctx.strokeStyle = "#3498db";
    this.ctx.lineWidth = 6;
    this.ctx.strokeRect(
      10,
      10,
      this.canvas.width - 20,
      this.canvas.height - 20,
    );

    // Draw snake icon
    const centerX = this.canvas.width / 2;
    const snakeY = this.canvas.height / 2 - 50;

    // Draw snake segments
    for (let i = 0; i < 5; i++) {
      this.ctx.fillStyle = i === 0 ? "#2ecc71" : "#27ae60";
      this.roundRect(centerX - 50 + i * 20, snakeY, 18, 18, 5);
      this.ctx.fill();
    }

    // Draw apple
    this.ctx.beginPath();
    this.ctx.fillStyle = "#e74c3c";
    this.ctx.arc(centerX + 60, snakeY + 9, 9, 0, Math.PI * 2);
    this.ctx.fill();

    // Title
    this.ctx.fillStyle = "#ecf0f1";
    this.ctx.font = 'bold 28px "Segoe UI", sans-serif';
    this.ctx.textAlign = "center";
    this.ctx.fillText("SNAKE GAME", centerX, this.canvas.height / 2 + 20);

    // Instructions
    this.ctx.fillStyle = "#3498db";
    this.ctx.font = 'bold 20px "Segoe UI", sans-serif';
    this.ctx.fillText(
      "Press SPACE to Start",
      centerX,
      this.canvas.height / 2 + 60,
    );

    // Controls
    this.ctx.fillStyle = "#bdc3c7";
    this.ctx.font = '14px "Segoe UI", sans-serif';
    this.ctx.fillText(
      "Use arrow keys to control the snake",
      centerX,
      this.canvas.height / 2 + 90,
    );
  }
}

// Export the singleton instance
export const canvasManager = CanvasManager.getInstance();
