import { GameConfig } from "./GameConfig";
import { CanvasUtils } from "./CanvasUtils";
import { Palette } from "./Palette";

interface Point {
  x: number;
  y: number;
}

// Unit vectors for 0 = Up, 1 = Right, 2 = Down, 3 = Left
const DIRECTION_VECTORS: readonly Point[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

/**
 * Class responsible for rendering the snake
 */
export class SnakeRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: GameConfig,
    private worldSize: number,
    private palette: Palette,
  ) {}

  /**
   * Draw the snake: a soft shadow pass first, then the body, then the head
   */
  public drawSnake(
    snakeBody: number[],
    getSnakeDirection: () => number,
    isGameOver: boolean,
  ): void {
    const size = this.config.CELL_SIZE;
    const cells = snakeBody.map((idx) => ({
      x: (idx % this.worldSize) * size,
      y: Math.floor(idx / this.worldSize) * size,
    }));

    this.paintBody(cells, size * 0.07, () => this.palette.shadow);
    this.paintBody(cells, 0, (i) =>
      i === 0
        ? this.palette.snakeHead
        : i % 2 === 0
          ? this.palette.snakeAlt
          : this.palette.snake,
    );

    if (cells.length > 0) {
      this.drawEyes(cells[0], getSnakeDirection(), isGameOver);
    }
  }

  /**
   * Paint every segment and the bridges that join neighbouring segments,
   * so the body reads as one continuous shape. Segments that wrap across
   * the board edge are not bridged.
   */
  private paintBody(
    cells: Point[],
    offsetY: number,
    color: (index: number) => string,
  ): void {
    const size = this.config.CELL_SIZE;
    const pad = size * 0.07;
    const inner = size - pad * 2;
    const radius = size * 0.28;

    cells.forEach((cell, i) => {
      this.ctx.fillStyle = color(i);
      CanvasUtils.roundRect(
        this.ctx,
        cell.x + pad,
        cell.y + pad + offsetY,
        inner,
        inner,
        radius,
      );
      this.ctx.fill();

      const next = cells[i + 1];
      if (!next) return;

      const dx = next.x - cell.x;
      const dy = next.y - cell.y;
      if (Math.abs(dx) + Math.abs(dy) !== size) return;

      // Bridge spans from inside one segment to inside the next
      const left = Math.min(cell.x, next.x);
      const top = Math.min(cell.y, next.y);
      this.ctx.fillStyle = color(i + 1);
      if (dy === 0) {
        this.ctx.fillRect(
          left + size - pad - radius,
          top + pad + offsetY,
          pad * 2 + radius * 2,
          inner,
        );
      } else {
        this.ctx.fillRect(
          left + pad,
          top + size - pad - radius + offsetY,
          inner,
          pad * 2 + radius * 2,
        );
      }
    });
  }

  /**
   * Draw the eyes on the head, or crossed-out eyes once the game is over
   */
  private drawEyes(head: Point, direction: number, isGameOver: boolean): void {
    const size = this.config.CELL_SIZE;
    const forward = DIRECTION_VECTORS[direction] ?? DIRECTION_VECTORS[1];
    const side = { x: -forward.y, y: forward.x };
    const cx = head.x + size / 2;
    const cy = head.y + size / 2;
    const eyeRadius = size * 0.13;

    for (const sign of [-1, 1]) {
      const ex = cx + forward.x * size * 0.18 + side.x * size * 0.2 * sign;
      const ey = cy + forward.y * size * 0.18 + side.y * size * 0.2 * sign;

      if (isGameOver) {
        this.drawCross(ex, ey, eyeRadius * 0.8);
        continue;
      }

      this.ctx.fillStyle = "#ffffff";
      this.drawCircle(ex, ey, eyeRadius);
      this.ctx.fillStyle = this.palette.ink;
      this.drawCircle(
        ex + forward.x * eyeRadius * 0.35,
        ey + forward.y * eyeRadius * 0.35,
        eyeRadius * 0.55,
      );
    }
  }

  private drawCross(x: number, y: number, arm: number): void {
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = this.config.CELL_SIZE * 0.05;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(x - arm, y - arm);
    this.ctx.lineTo(x + arm, y + arm);
    this.ctx.moveTo(x + arm, y - arm);
    this.ctx.lineTo(x - arm, y + arm);
    this.ctx.stroke();
  }

  private drawCircle(x: number, y: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
