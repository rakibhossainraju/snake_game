import init from "snake_game";

export type getSnakeBodyType = (
  firstCellPtr: number,
  snakeBodyLen: number,
) => number[];

(async () => {
  try {
    const wasm = await init(); // Initialize the snake_game module from the Rust side
    const getSnakeBody: getSnakeBodyType = (firstCellPtr, snakeBodyLen) => {
      const snakeBody = new Uint32Array(
        wasm.memory.buffer,
        firstCellPtr,
        snakeBodyLen,
      );
      return [...snakeBody.filter((v) => !isNaN(v))];
    };
    const { main } = await import("./main.ts");
    main(getSnakeBody);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
})();
