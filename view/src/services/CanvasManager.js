import { World } from "snake_game";

class CanvasManager {
  #CELL_SIZE = 25;
  #canvas = null;
  #ctx = null;
  #world;
  #worldSize;

  constructor() {
    if (CanvasManager.instance) {
      return CanvasManager.instance;
    }
    this.#world = World.new();
    this.#worldSize = this.#world.get_width();
    this.#canvas = document.getElementById("snake-canvas");
    this.#ctx = this.#canvas.getContext("2d");

    CanvasManager.instance = this;
  }

  initCanvas() {
    this.#canvas.height = this.#CELL_SIZE * this.#worldSize;
    this.#canvas.width = this.#CELL_SIZE * this.#worldSize;
    this.startGame();
  }

  startGame() {
    const intervelId = setInterval(() => {
      this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
      this.drawWorld();
      this.drawSnake();
      this.#world.update_snake_head();
    }, 100);
  }

  drawWorld() {
    this.#ctx.beginPath();

    for (let line = 0; line <= this.#worldSize; line++) {
      // Draw Horizontal Lines
      this.#ctx.moveTo(this.#CELL_SIZE * line, 0);
      this.#ctx.lineTo(
        this.#CELL_SIZE * line,
        this.#worldSize * this.#CELL_SIZE,
      );

      // Draw Vertical Lines
      this.#ctx.moveTo(0, this.#CELL_SIZE * line);
      this.#ctx.lineTo(
        this.#CELL_SIZE * this.#worldSize,
        this.#CELL_SIZE * line,
      );
    }

    this.#ctx.stroke();
  }

  drawSnake() {
    const snakeIdx = this.#world.get_snake_head_idx();
    const col = snakeIdx % this.#worldSize;
    const row = Math.floor(snakeIdx / this.#worldSize);

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
