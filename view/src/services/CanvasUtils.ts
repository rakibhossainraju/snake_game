/**
 * Utility class for canvas drawing operations
 */
export class CanvasUtils {
  /**
   * Draw a rounded rectangle
   */
  public static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(
      x + width,
      y + height,
      x + width - radius,
      y + height,
      radius,
    );
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  /**
   * Draw a triangular tail for the snake based on the direction
   */
  public static drawPointedTail(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    padding: number,
    direction: number,
  ): void {
    const adjustedX = x + padding;
    const adjustedY = y + padding;
    const adjustedSize = size - padding * 2;

    // Draw a triangle for the tail based on direction
    ctx.beginPath();

    switch (direction) {
      case 0: // Up - tail points down
        ctx.moveTo(adjustedX, adjustedY + adjustedSize);
        ctx.lineTo(adjustedX + adjustedSize / 2, adjustedY);
        ctx.lineTo(adjustedX + adjustedSize, adjustedY + adjustedSize);
        break;

      case 1: // Right - tail points left
        ctx.moveTo(adjustedX, adjustedY);
        ctx.lineTo(adjustedX + adjustedSize, adjustedY + adjustedSize / 2);
        ctx.lineTo(adjustedX, adjustedY + adjustedSize);
        break;

      case 2: // Down - tail points up
        ctx.moveTo(adjustedX, adjustedY);
        ctx.lineTo(adjustedX + adjustedSize / 2, adjustedY + adjustedSize);
        ctx.lineTo(adjustedX + adjustedSize, adjustedY);
        break;

      case 3: // Left - tail points right
        ctx.moveTo(adjustedX + adjustedSize, adjustedY);
        ctx.lineTo(adjustedX, adjustedY + adjustedSize / 2);
        ctx.lineTo(adjustedX + adjustedSize, adjustedY + adjustedSize);
        break;
    }

    ctx.closePath();
    ctx.fill();
  }
}
