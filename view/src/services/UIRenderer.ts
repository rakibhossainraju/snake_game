import { CanvasUtils } from "./CanvasUtils";

/**
 * Class responsible for rendering UI elements
 */
export class UIRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private canvas: HTMLCanvasElement,
  ) {}

  /**
   * Display game over a message
   */
  public displayGameOver(point: number): void {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#ff3333";
    this.ctx.font = "bold 24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "GAME OVER",
      this.canvas.width / 2,
      this.canvas.height / 2 - 15,
    );

    this.displayScoreAndRestartText(point);
  }

  /**
   * Display game won message
   */
  public displayGameWon(point: number): void {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#33ff33";
    this.ctx.font = "bold 24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "YOU WIN!",
      this.canvas.width / 2,
      this.canvas.height / 2 - 15,
    );

    this.displayScoreAndRestartText(point);
  }

  /**
   * Display start screen with instructions
   */
  public displayStartScreen(): void {
    // Add semi-transparent overlay
    this.ctx.fillStyle = "rgba(26, 26, 46, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw border
    this.ctx.strokeStyle = "#3498db";
    this.ctx.lineWidth = 6;
    this.ctx.strokeRect(
      10,
      10,
      this.canvas.width - 20,
      this.canvas.height - 20,
    );

    // Draw snake icon
    const centerX = this.canvas.width / 2;
    const snakeY = this.canvas.height / 2 - 50;

    // Draw snake segments
    for (let i = 0; i < 5; i++) {
      this.ctx.fillStyle = i === 0 ? "#2ecc71" : "#27ae60";
      CanvasUtils.roundRect(this.ctx, centerX - 50 + i * 20, snakeY, 18, 18, 5);
      this.ctx.fill();
    }

    // Draw apple
    this.ctx.beginPath();
    this.ctx.fillStyle = "#e74c3c";
    this.ctx.arc(centerX + 60, snakeY + 9, 9, 0, Math.PI * 2);
    this.ctx.fill();

    // Title
    this.ctx.fillStyle = "#ecf0f1";
    this.ctx.font = 'bold 28px "Segoe UI", sans-serif';
    this.ctx.textAlign = "center";
    this.ctx.fillText("SNAKE GAME", centerX, this.canvas.height / 2 + 20);

    // Instructions
    this.ctx.fillStyle = "#3498db";
    this.ctx.font = 'bold 20px "Segoe UI", sans-serif';
    this.ctx.fillText(
      "Press SPACE to Start",
      centerX,
      this.canvas.height / 2 + 60,
    );

    // Controls
    this.ctx.fillStyle = "#bdc3c7";
    this.ctx.font = '14px "Segoe UI", sans-serif';
    this.ctx.fillText(
      "Use arrow keys to control the snake",
      centerX,
      this.canvas.height / 2 + 90,
    );
  }

  /**
   * Display the score and restart text on the canvas
   */
  private displayScoreAndRestartText(point: number): void {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(
      `Score: ${point}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 15,
    );

    this.ctx.font = "14px Arial";
    this.ctx.fillText(
      "Press SPACE to restart",
      this.canvas.width / 2,
      this.canvas.height / 2 + 45,
    );
  }

  /**
   * Update the displayed score
   */
  public updateScore(
    pointsElement: HTMLSpanElement | null,
    points: number,
  ): void {
    if (!pointsElement) return;

    pointsElement.textContent = points.toString();

    // Apply color based on score value
    if (points >= 10) {
      pointsElement.style.color = "#f39c12"; // Yellow/orange for higher scores

      if (points >= 20) {
        pointsElement.style.color = "#e74c3c"; // Red for very high scores

        if (points >= 30) {
          pointsElement.style.color = "#8e44ad"; // Purple for exceptional scores
        }
      }
    } else {
      pointsElement.style.color = "#e74c3c"; // Default red
    }

    // Apply pulsing effect on score change
    pointsElement.classList.add("score-pulse");
    setTimeout(() => {
      pointsElement?.classList.remove("score-pulse");
    }, 300);
  }
}
