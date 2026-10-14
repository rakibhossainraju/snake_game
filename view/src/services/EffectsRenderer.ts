import { GameConfig } from "./GameConfig";
import { Palette } from "./Palette";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  ttl: number;
  radius: number;
  color: string;
}

interface Ring {
  x: number;
  y: number;
  age: number;
}

const RING_TTL = 0.32;
const PARTICLE_COUNT = 14;

/**
 * Short-lived effects drawn on top of the board, such as the burst
 * when an apple is eaten.
 */
export class EffectsRenderer {
  private particles: Particle[] = [];
  private rings: Ring[] = [];

  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: GameConfig,
    private worldSize: number,
    private palette: Palette,
  ) {}

  public burst(cell: number): void {
    const size = this.config.CELL_SIZE;
    const x = (cell % this.worldSize) * size + size / 2;
    const y = Math.floor(cell / this.worldSize) * size + size / 2;
    const colors = [this.palette.food, this.palette.food, this.palette.leaf, "#ffd9a0"];

    this.rings.push({ x, y, age: 0 });
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.4;
      const speed = size * (2.2 + Math.random() * 2.2);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        ttl: 0.35 + Math.random() * 0.2,
        radius: size * (0.06 + Math.random() * 0.06),
        color: colors[i % colors.length],
      });
    }
  }

  /**
   * Advance and draw all effects. `dt` is in seconds.
   */
  public draw(dt: number): void {
    const size = this.config.CELL_SIZE;
    const { ctx } = this;

    this.rings = this.rings.filter((r) => (r.age += dt) < RING_TTL);
    for (const ring of this.rings) {
      const progress = ring.age / RING_TTL;
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = this.palette.food;
      ctx.lineWidth = size * 0.08 * (1 - progress);
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, size * (0.3 + 0.6 * progress), 0, Math.PI * 2);
      ctx.stroke();
    }

    this.particles = this.particles.filter((p) => (p.age += dt) < p.ttl);
    for (const p of this.particles) {
      const drag = Math.pow(0.04, dt);
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const life = 1 - p.age / p.ttl;
      ctx.globalAlpha = life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (0.4 + 0.6 * life), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
