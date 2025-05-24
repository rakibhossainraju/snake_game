import { World } from "snake_game";
import { canvasManager } from "./services/CanvasManager.js";

const world = World.new();
const worldSize = world.get_width();

canvasManager.initCanvas(worldSize);
