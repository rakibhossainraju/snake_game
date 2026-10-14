import { GameConfig } from "./GameConfig";
import { Palette } from "./Palette";

/**
 * Class responsible for rendering the game board
 */
export class GridRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: GameConfig,
    private worldSize: number,
    private palette: Palette,
  ) {}

  /**
   * Draw the board as a two-tone checkerboard
   */
  public drawGrid(): void {
    const { CELL_SIZE } = this.config;

    for (let row = 0; row < this.worldSize; row++) {
      for (let col = 0; col < this.worldSize; col++) {
        this.ctx.fillStyle =
          (row + col) % 2 === 0 ? this.palette.boardA : this.palette.boardB;
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
