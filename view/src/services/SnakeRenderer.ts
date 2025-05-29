import { GameConfig } from "./GameConfig";
import { CanvasUtils } from "./CanvasUtils";

/**
 * Interface for eye positions
 */
interface EyePositions {
  eyeX1: number;
  eyeX2: number;
  eyeY1: number;
  eyeY2: number;
}

/**
 * Class responsible for rendering the snake
 */
export class SnakeRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: GameConfig,
    private worldSize: number,
  ) {}

  /**
   * Draw the snake on the canvas
   */
  public drawSnake(
    snakeBody: number[],
    getSnakeDirection: () => number,
    isGameOver: boolean,
  ): void {
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
        this.drawSnakeHead(
          x,
          y,
          size,
          padding,
          getSnakeDirection(),
          isGameOver,
        );
      }
      // Snake tail (last segment)
      else if (i === snakeBody.length - 1) {
        // Get a direction of tail by looking at the second-to-last and last segments
        const tailDirection = this.getTailDirection(snakeBody, i);

        // Gradient color for tail
        const gradientPos = i / snakeBody.length;
        const r = Math.floor(46 + (26 - 46) * gradientPos);
        const g = Math.floor(204 + (174 - 204) * gradientPos);
        const b = Math.floor(113 + (159 - 113) * gradientPos);
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

        // Draw the pointed tail based on a direction
        CanvasUtils.drawPointedTail(
          this.ctx,
          x,
          y,
          size,
          padding,
          tailDirection,
        );
      }
      // Snake body segments (middle segments)
      else {
        this.drawSnakeBodySegment(x, y, size, padding, i, snakeBody.length);
      }
    }
  }

  /**
   * Draw the snake's head
   */
  private drawSnakeHead(
    x: number,
    y: number,
    size: number,
    padding: number,
    direction: number,
    isGameOver: boolean,
  ): void {
    // Set head color based on game state
    this.ctx.fillStyle = "#2ecc71"; // Darker red if game over

    // Create a rounded rectangle for the head
    CanvasUtils.roundRect(
      this.ctx,
      x + padding,
      y + padding,
      size - padding * 2,
      size - padding * 2,
      5,
    );
    this.ctx.fill();

    // Get eye positions based on a direction
    const eyePositions = this.getEyePositions(x, y, size, direction);
    const eyeSize = size / 8;

    // Draw appropriate eyes based on game state
    if (isGameOver) {
      this.drawXEyes(eyePositions, eyeSize);
    } else {
      this.drawNormalEyes(eyePositions, eyeSize);
    }
  }

  /**
   * Get eye positions based on a direction
   */
  private getEyePositions(
    x: number,
    y: number,
    size: number,
    direction: number,
  ): EyePositions {
    // 0 = Up, 1 = Right, 2 = Down, 3 = Left
    switch (direction) {
      case 0: // Up
        return {
          eyeX1: x + size / 3,
          eyeX2: x + (size * 2) / 3,
          eyeY1: y + size / 3,
          eyeY2: y + size / 3,
        };
      case 2: // Down
        return {
          eyeX1: x + size / 3,
          eyeX2: x + (size * 2) / 3,
          eyeY1: y + (size * 2) / 3,
          eyeY2: y + (size * 2) / 3,
        };
      case 3: // Left
        return {
          eyeX1: x + size / 3,
          eyeX2: x + size / 3,
          eyeY1: y + size / 3,
          eyeY2: y + (size * 2) / 3,
        };
      case 1: // Right (default)
      default:
        return {
          eyeX1: x + (size * 2) / 3,
          eyeX2: x + (size * 2) / 3,
          eyeY1: y + size / 3,
          eyeY2: y + (size * 2) / 3,
        };
    }
  }

  /**
   * Draw X-shaped eyes when the game is over
   */
  private drawXEyes(positions: EyePositions, eyeSize: number): void {
    const { eyeX1, eyeX2, eyeY1, eyeY2 } = positions;

    // Use red for game over X-eyes
    this.ctx.strokeStyle = "#ff0000";
    this.ctx.lineWidth = 2;

    // Draw X for the first eye
    this.drawXShape(eyeX1, eyeY1, eyeSize);

    // Draw X for the second eye
    this.drawXShape(eyeX2, eyeY2, eyeSize);
  }

  /**
   * Draw a single X shape
   */
  private drawXShape(x: number, y: number, size: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x - size, y - size);
    this.ctx.lineTo(x + size, y + size);
    this.ctx.moveTo(x + size, y - size);
    this.ctx.lineTo(x - size, y + size);
    this.ctx.stroke();
  }

  /**
   * Draw normal circular eyes
   */
  private drawNormalEyes(positions: EyePositions, eyeSize: number): void {
    const { eyeX1, eyeX2, eyeY1, eyeY2 } = positions;

    this.ctx.fillStyle = "#000";

    // Draw first eye
    this.drawCircle(eyeX1, eyeY1, eyeSize);

    // Draw a second eye
    this.drawCircle(eyeX2, eyeY2, eyeSize);
  }

  /**
   * Draw a circle with the given parameters
   */
  private drawCircle(x: number, y: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw a snake body segment
   */
  private drawSnakeBodySegment(
    x: number,
    y: number,
    size: number,
    padding: number,
    segmentIndex: number,
    totalSegments: number,
  ): void {
    // Gradient from head color to tail color based on position
    const gradientPos = segmentIndex / totalSegments;
    const r = Math.floor(46 + (26 - 46) * gradientPos);
    const g = Math.floor(204 + (174 - 204) * gradientPos);
    const b = Math.floor(113 + (159 - 113) * gradientPos);

    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    CanvasUtils.roundRect(
      this.ctx,
      x + padding,
      y + padding,
      size - padding * 2,
      size - padding * 2,
      3,
    );
    this.ctx.fill();
  }

  /**
   * Determine the direction of the snake's tail by comparing the last two segments
   */
  private getTailDirection(snakeBody: number[], tailIndex: number): number {
    if (tailIndex < 1 || tailIndex >= snakeBody.length) return 0;

    const lastCell = snakeBody[tailIndex];
    const secondLastCell = snakeBody[tailIndex - 1];

    return this.calculateDirection(
      lastCell % this.worldSize,
      Math.floor(lastCell / this.worldSize),
      secondLastCell % this.worldSize,
      Math.floor(secondLastCell / this.worldSize),
    );
  }

  /**
   * Calculate a direction based on position difference
   * @param col1 First column position
   * @param row1 First row position
   * @param col2 Second column position
   * @param row2 Second row position
   * @returns Direction as a number (0=Up, 1=Right, 2=Down, 3=Left)
   */
  private calculateDirection(
    col1: number,
    row1: number,
    col2: number,
    row2: number,
  ): number {
    // Handling wrapping around the grid edges
    if (Math.abs(col1 - col2) > 1) {
      // Wrapped horizontally
      return col1 > col2 ? 3 : 1; // Left or Right
    } else if (Math.abs(row1 - row2) > 1) {
      // Wrapped vertically
      return row1 > row2 ? 0 : 2; // Up or Down
    } else {
      // Normal case, no wrapping
      if (col1 < col2) return 3; // Points Left
      if (col1 > col2) return 1; // Points Right
      if (row1 < row2) return 0; // Points Up
      if (row1 > row2) return 2; // Points Down
    }

    return 0; // Default Up
  }
}
