// import { canvasManager } from "./services/CanvasManager";
import { getSnakeBodyType } from "./bootstrap.ts";
import { gameManager } from "./services/GameManager.ts";

export function main(getSnakeBody: getSnakeBodyType) {
  // canvasManager.initCanvas(getSnakeBody);
  gameManager.initGame(getSnakeBody);
}
