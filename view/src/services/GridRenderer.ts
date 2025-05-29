import { GameConfig } from "./GameConfig";

/**
 * Class responsible for rendering the game grid
 */
export class GridRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: GameConfig,
    private worldSize: number,
  ) {}

  /**
   * Draw the game grid
   */
  public drawGrid(): void {
    const { CELL_SIZE } = this.config;

    // Draw background
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.worldSize * CELL_SIZE, this.worldSize * CELL_SIZE);

    // Draw grid lines
    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(52, 73, 94, 0.5)";
    this.ctx.lineWidth = 1;

    for (let line = 0; line <= this.worldSize; line++) {
      // Draw Horizontal Lines
      this.ctx.moveTo(CELL_SIZE * line, 0);
      this.ctx.lineTo(CELL_SIZE * line, this.worldSize * CELL_SIZE);

      // Draw Vertical Lines
      this.ctx.moveTo(0, CELL_SIZE * line);
      this.ctx.lineTo(CELL_SIZE * this.worldSize, CELL_SIZE * line);
    }

    this.ctx.stroke();

    // Draw a subtle pattern for visual interest
    for (let row = 0; row < this.worldSize; row++) {
      for (let col = 0; col < this.worldSize; col++) {
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
}
