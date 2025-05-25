import init from "snake_game";

try {
  await init(); // Initialize the snake_game module from the Rust side
  await import("./main.ts");
} catch (error) {
  console.error("Error during initialization:", error);
}
