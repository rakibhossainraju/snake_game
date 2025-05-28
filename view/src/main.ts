import { canvasManager } from "./services/CanvasManager";
import { getSnakeBodyType } from "./bootstrap.ts";

export function main(getSnakeBody: getSnakeBodyType) {
  canvasManager.initCanvas(getSnakeBody);
}
