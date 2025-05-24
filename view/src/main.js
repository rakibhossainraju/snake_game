import { World } from "snake_game";

const CELL_SIZE = 25;

const world = World.new();
const worldSize = world.get_width();

const gameCanvas = document.getElementById("snake-canvas");
const ctx = gameCanvas.getContext("2d");

gameCanvas.height = CELL_SIZE * worldSize;
gameCanvas.width = CELL_SIZE * worldSize;

drawWorld();

function drawWorld() {
  ctx.beginPath();

  for (let line = 0; line <= worldSize; line++) {
    // Draw Horizontal Lines
    ctx.moveTo(CELL_SIZE * line, 0);
    ctx.lineTo(CELL_SIZE * line, worldSize * CELL_SIZE);

    // Draw Vertical Lines
    ctx.moveTo(0, CELL_SIZE * line);
    ctx.lineTo(CELL_SIZE * worldSize, CELL_SIZE * line);
  }

  ctx.stroke();
}
