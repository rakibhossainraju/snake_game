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
   * Calculate pulsing scale based on current time
   */
  private getPulsingScale(): number {
    // Use sine wave to create smooth pulsing effect between 0.9 and 1.1
    return 0.9 + (0.2 * (Math.sin(Date.now() / 500) + 1)) / 2;
  }

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
    const scale = this.getPulsingScale();
    const radius = (size / 2 - 2) * scale;

    // Save the current context state
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-centerX, -centerY);

    // Apple body (red circle)
    this.ctx.beginPath();
    this.ctx.fillStyle = "#e74c3c";
    this.ctx.arc(centerX, centerY, radius / scale, 0, Math.PI * 2);
    this.ctx.fill();

    // Restore the context to its original state
    this.ctx.restore();

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
