import { World } from "snake_game";
import { canvasManager } from "./services/CanvasManager.js";

const world = World.new();
const worldSize = world.get_width();
const snakeIdx = world.get_snake_head_idx();

canvasManager.initCanvas(worldSize, snakeIdx);
