import { GameConfig } from "./GameConfig";

/**
 * Class responsible for rendering food
 */
export class FoodRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: GameConfig,
    private worldSize: number,
  ) {}

  /**
   * Draw food at the specified cell index
   */
  public drawFood(foodCell: number): void {
    if (!foodCell) return;

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

    // Apple leaf
    this.ctx.beginPath();
    this.ctx.fillStyle = "#2ecc71";
    this.ctx.ellipse(centerX + 3, y + 3, 3, 5, Math.PI / 4, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
