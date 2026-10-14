import { GameConfig } from "./GameConfig";
import { Palette } from "./Palette";

/**
 * Class responsible for rendering food
 */
export class FoodRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: GameConfig,
    private worldSize: number,
    private palette: Palette,
  ) {}

  /**
   * Gentle breathing between 0.95 and 1.05 of the resting size
   */
  private getPulsingScale(): number {
    return 1 + 0.05 * Math.sin(Date.now() / 400);
  }

  /**
   * Draw an apple at the specified cell index
   */
  public drawFood(foodCell: number): void {
    const size = this.config.CELL_SIZE;
    const col = foodCell % this.worldSize;
    const row = Math.floor(foodCell / this.worldSize);
    const cx = col * size + size / 2;
    const cy = row * size + size / 2 + size * 0.04;
    const radius = size * 0.34;

    const { ctx, palette } = this;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.getPulsingScale(), this.getPulsingScale());

    // Resting shadow
    ctx.fillStyle = palette.shadow;
    ctx.beginPath();
    ctx.ellipse(0, radius * 1.05, radius * 0.85, radius * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = palette.food;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.ellipse(-radius * 0.38, -radius * 0.38, radius * 0.2, radius * 0.3, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = size * 0.05;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.85);
    ctx.lineTo(radius * 0.1, -radius * 1.3);
    ctx.stroke();

    // Leaf
    ctx.fillStyle = palette.leaf;
    ctx.beginPath();
    ctx.ellipse(radius * 0.45, -radius * 1.2, radius * 0.4, radius * 0.2, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
