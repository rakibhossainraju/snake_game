/*
 * CanvasManager is a singleton class that manages the canvas for the application.
 */
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

  initCanvas(worldSize) {
    this.#canvas.height = this.#CELL_SIZE * worldSize;
    this.#canvas.width = this.#CELL_SIZE * worldSize;
    this.drawWorld(worldSize);
  }

  drawWorld(worldSize) {
    this.#ctx.beginPath();

    for (let line = 0; line <= worldSize; line++) {
      // Draw Horizontal Lines
      this.#ctx.moveTo(this.#CELL_SIZE * line, 0);
      this.#ctx.lineTo(this.#CELL_SIZE * line, worldSize * this.#CELL_SIZE);

      // Draw Vertical Lines
      this.#ctx.moveTo(0, this.#CELL_SIZE * line);
      this.#ctx.lineTo(this.#CELL_SIZE * worldSize, this.#CELL_SIZE * line);
    }

    this.#ctx.stroke();
  }
}

export const canvasManager = new CanvasManager();
