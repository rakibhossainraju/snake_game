import { GameConfig } from "./GameConfig";
import { Palette } from "./Palette";

interface Point {
  x: number;
  y: number;
}

/**
 * Class responsible for rendering the snake as a smooth, tapering tube.
 *
 * The game logic moves the snake one cell per step. To animate between
 * steps, each segment slides from where it was in the previous body to
 * where it is in the current one. Segments are unwrapped into one
 * continuous chain, so a snake crossing a board edge is drawn on both
 * sides at once.
 */
export class SnakeRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: GameConfig,
    private worldSize: number,
    private palette: Palette,
  ) {}

  /**
   * @param previous body before the latest step
   * @param current body after the latest step
   * @param t progress through the step, 0 to 1
   * @param fallbackDirection used for the eyes when the snake has no neck yet
   */
  public drawSnake(
    previous: number[],
    current: number[],
    t: number,
    fallbackDirection: number,
    isGameOver: boolean,
  ): void {
    const chain = this.buildChain(previous, current, t);
    if (chain.length === 0) return;

    const size = this.config.CELL_SIZE;
    const boardPx = this.worldSize * size;
    const xs = chain.map((p) => p.x);
    const ys = chain.map((p) => p.y);
    const offsets = (values: number[]): number[] =>
      [-boardPx, 0, boardPx].filter(
        (o) =>
          Math.max(...values) + size + o > 0 &&
          Math.min(...values) - size + o < boardPx,
      );
    const xOffsets = offsets(xs);
    const yOffsets = offsets(ys);

    const passes: Array<() => void> = [];
    passes.push(() => this.strokeChain(chain, 0.84, size * 0.07, this.palette.shadow));
    passes.push(() => this.strokeChain(chain, 0.84, 0, this.palette.snake));
    passes.push(() => this.strokeChain(chain, 0.28, -size * 0.1, this.palette.snakeAlt));
    passes.push(() => this.drawHead(chain, fallbackDirection, isGameOver));

    for (const pass of passes) {
      for (const ox of xOffsets) {
        for (const oy of yOffsets) {
          this.ctx.save();
          this.ctx.translate(ox, oy);
          pass();
          this.ctx.restore();
        }
      }
    }
  }

  /**
   * Interpolate every segment between its previous and current cell, then
   * unwrap the result so neighbouring points are never a board apart.
   */
  private buildChain(previous: number[], current: number[], t: number): Point[] {
    const size = this.config.CELL_SIZE;
    const boardPx = this.worldSize * size;
    const toXY = (idx: number): Point => ({
      x: (idx % this.worldSize) * size,
      y: Math.floor(idx / this.worldSize) * size,
    });
    const shortest = (d: number): number =>
      d > boardPx / 2 ? d - boardPx : d < -boardPx / 2 ? d + boardPx : d;
    const unwrap = (v: number, ref: number): number => {
      while (v - ref > boardPx / 2) v -= boardPx;
      while (v - ref < -boardPx / 2) v += boardPx;
      return v;
    };

    const chain: Point[] = [];
    current.forEach((idx, j) => {
      const to = toXY(idx);
      const from = j < previous.length ? toXY(previous[j]) : to;
      let x = from.x + shortest(to.x - from.x) * t + size / 2;
      let y = from.y + shortest(to.y - from.y) * t + size / 2;
      if (j > 0) {
        x = unwrap(x, chain[j - 1].x);
        y = unwrap(y, chain[j - 1].y);
      }
      chain.push({ x, y });
    });
    return chain;
  }

  /**
   * Stroke the chain segment by segment, narrowing toward the tail.
   * `thickness` is a fraction of a cell at the head.
   */
  private strokeChain(
    chain: Point[],
    thickness: number,
    offsetY: number,
    color: string,
  ): void {
    const size = this.config.CELL_SIZE;
    const last = Math.max(chain.length - 1, 1);

    this.ctx.strokeStyle = color;
    this.ctx.lineCap = "round";
    for (let j = 0; j < chain.length - 1; j++) {
      const taper = 1 - 0.4 * ((j + 0.5) / last);
      this.ctx.lineWidth = size * thickness * taper;
      this.ctx.beginPath();
      this.ctx.moveTo(chain[j].x, chain[j].y + offsetY);
      this.ctx.lineTo(chain[j + 1].x, chain[j + 1].y + offsetY);
      this.ctx.stroke();
    }

    // A lone head has no segments to stroke
    if (chain.length === 1) {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(chain[0].x, chain[0].y + offsetY, (size * thickness) / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawHead(chain: Point[], fallbackDirection: number, isGameOver: boolean): void {
    const size = this.config.CELL_SIZE;
    const head = chain[0];
    const forward = this.headDirection(chain, fallbackDirection);
    const side = { x: -forward.y, y: forward.x };

    this.ctx.fillStyle = this.palette.snakeHead;
    this.ctx.beginPath();
    this.ctx.ellipse(
      head.x,
      head.y,
      size * 0.5,
      size * 0.45,
      Math.atan2(forward.y, forward.x),
      0,
      Math.PI * 2,
    );
    this.ctx.fill();

    const eyeRadius = size * 0.13;
    for (const sign of [-1, 1]) {
      const ex = head.x + forward.x * size * 0.16 + side.x * size * 0.2 * sign;
      const ey = head.y + forward.y * size * 0.16 + side.y * size * 0.2 * sign;

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

  /**
   * Unit vector the head is travelling in, taken from the neck so the eyes
   * follow the motion. 0 = Up, 1 = Right, 2 = Down, 3 = Left for the fallback.
   */
  private headDirection(chain: Point[], fallbackDirection: number): Point {
    if (chain.length > 1) {
      const dx = chain[0].x - chain[1].x;
      const dy = chain[0].y - chain[1].y;
      if (dx !== 0 || dy !== 0) {
        return Math.abs(dx) > Math.abs(dy)
          ? { x: Math.sign(dx), y: 0 }
          : { x: 0, y: Math.sign(dy) };
      }
    }
    const fallback: Point[] = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];
    return fallback[fallbackDirection] ?? fallback[1];
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
