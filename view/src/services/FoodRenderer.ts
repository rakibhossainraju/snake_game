import { GameConfig } from "./GameConfig";
import { Palette } from "./Palette";

const POP_IN_MS = 240;

/**
 * Class responsible for rendering food
 */
export class FoodRenderer {
  private lastCell = -1;
  private spawnedAt = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: GameConfig,
    private worldSize: number,
    private palette: Palette,
  ) {}

  /**
   * Draw the current apple. It pops in whenever it appears in a new cell.
   */
  public drawFood(foodCell: number, now: number): void {
    if (foodCell !== this.lastCell) {
      this.lastCell = foodCell;
      this.spawnedAt = now;
    }
    const progress = Math.min((now - this.spawnedAt) / POP_IN_MS, 1);
    this.drawFoodAt(foodCell, easeOutBack(progress), now);
  }

  /**
   * Draw an apple at a cell with an explicit scale, used for the apple
   * that is being eaten while the new one has already spawned.
   */
  public drawFoodAt(foodCell: number, scale: number, now: number): void {
    const size = this.config.CELL_SIZE;
    const col = foodCell % this.worldSize;
    const row = Math.floor(foodCell / this.worldSize);
    const cx = col * size + size / 2;
    const cy = row * size + size / 2 + size * 0.04;
    const radius = size * 0.34;
    const breathe = 1 + 0.04 * Math.sin(now / 400);

    const { ctx, palette } = this;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale * breathe, scale * breathe);

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

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
