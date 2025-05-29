import { getSnakeBodyType } from "./bootstrap.ts";
import { gameManager } from "./services/GameManager.ts";

export function main(getSnakeBody: getSnakeBodyType) {
  gameManager.initGame(getSnakeBody);
}
