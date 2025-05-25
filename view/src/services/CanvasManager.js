class CanvasManager {
  #CELL_SIZE = 25;
  #canvas = null;
  #ctx = null;

  constructor() {
    if (CanvasManager.instance) {
      return CanvasManager.instance;
    }

    this.#canvas = document.getElementById("snake-canvas");
    this.#ctx = this.#canvas.getContext("2d");

    CanvasManager.instance = this;
  }

  initCanvas(worldSize, snakeIdx) {
    if (!worldSize || !snakeIdx) {
      throw new Error("Canvas must be invoked with worldSize and snakeIdx");
    }
    this.worldSize = worldSize;
    this.snakeIdx = snakeIdx;
    this.#canvas.height = this.#CELL_SIZE * worldSize;
    this.#canvas.width = this.#CELL_SIZE * worldSize;
    this.drawWorld();
    this.drawSnake();
  }

  drawWorld() {
    this.#ctx.beginPath();

    for (let line = 0; line <= this.worldSize; line++) {
      // Draw Horizontal Lines
      this.#ctx.moveTo(this.#CELL_SIZE * line, 0);
      this.#ctx.lineTo(
        this.#CELL_SIZE * line,
        this.worldSize * this.#CELL_SIZE,
      );

      // Draw Vertical Lines
      this.#ctx.moveTo(0, this.#CELL_SIZE * line);
      this.#ctx.lineTo(
        this.#CELL_SIZE * this.worldSize,
        this.#CELL_SIZE * line,
      );
    }

    this.#ctx.stroke();
  }

  drawSnake() {
    const col = this.snakeIdx % this.worldSize;
    const row = Math.floor(this.snakeIdx / this.worldSize);

    this.#ctx.beginPath();
    this.#ctx.fillRect(
      this.#CELL_SIZE * col,
      this.#CELL_SIZE * row,
      this.#CELL_SIZE,
      this.#CELL_SIZE,
    );
    this.#ctx.stroke();
  }
}

export const canvasManager = new CanvasManager();
