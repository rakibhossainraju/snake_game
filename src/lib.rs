mod cells;
mod game;
mod random;
mod snake;

use cells::SnakeCell;
use game::GameEngine;
pub use game::GameState;
use snake::Snake;
use wasm_bindgen::prelude::*;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq)]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

/// Represents the world grid and manages the game state
#[wasm_bindgen]
pub struct World {
    width: usize,
    size: usize,
    snake: Snake,
    food_cell: Option<usize>,
    points: usize,
    game_engine: GameEngine,
}

#[wasm_bindgen]
impl World {
    /// Creates a new game world with the given size and snake spawn position
    pub fn new(world_size: usize, snake_spawn_idx: usize) -> Self {
        World {
            width: world_size,
            size: world_size * world_size,
            snake: Snake::new(snake_spawn_idx, 2),
            food_cell: None,
            points: 0,
            game_engine: GameEngine::new(),
        }
    }

    /// Gets the length of the snake
    pub fn get_snake_len(&self) -> usize {
        self.snake.len()
    }

    /// Gets a pointer to the first snake cell for JS interop
    pub fn get_first_cell_ptr(&self) -> *const SnakeCell {
        self.snake.body_ptr()
    }

    /// Advances the game state by one step
    pub fn step(&mut self) {
        if !self.game_engine.is_playing() {
            return; // Game isn't started or already finished
        }

        let next_cell = self.calculate_next_cell();

        // Check for collision with own body
        if self.snake.would_collide(next_cell.0) {
            self.game_engine.set_state(GameState::GameOver);
            return;
        }

        // Move the snake
        self.snake.slither(next_cell);

        // Check for food consumption
        if let Some(food_idx) = self.food_cell {
            if self.snake.head_idx() == food_idx {
                self.snake.grow();
                self.place_food();
                self.points += 1;
            }
        } else {
            self.place_food();
        }
    }

    /// Gets the width of the game world
    pub fn get_width(&self) -> usize {
        self.width
    }

    /// Changes the snake's direction of movement
    pub fn change_direction(&mut self, new_direction: Direction) {
        self.snake.change_direction(new_direction);
    }

    /// Starts the game
    pub fn game_start(&mut self) {
        if self.game_engine.is_ready() || self.game_engine.get_state().is_none() {
            self.game_engine.set_state(GameState::Playing);
            self.place_food();
        }
    }

    /// Gets the index of the snake's head
    pub fn get_snake_head_idx(&self) -> usize {
        self.snake.head_idx()
    }

    /// Gets the index of the food cell
    pub fn get_food_idx(&self) -> Option<usize> {
        self.food_cell
    }

    /// Gets the current score
    pub fn get_point(&self) -> usize {
        self.points
    }

    /// Gets the current game state as a number for JS interop
    pub fn get_game_state(&self) -> u8 {
        self.game_engine.get_state_as_number()
    }

    /// Gets the current direction as a number for JS interop
    pub fn get_direction(&self) -> u8 {
        self.snake.direction_as_number()
    }

    /// Places food at a random empty position
    fn place_food(&mut self) {
        // The snake has filled the entire grid minus 1 space (which would be the food)
        if self.snake.len() >= self.size - 1 {
            self.food_cell = None; // No space for food
            self.game_engine.set_state(GameState::Won);
            return;
        }

        loop {
            let food_position = random::random_range(1, self.size);
            if !self.snake.occupies(food_position) {
                self.food_cell = Some(food_position);
                return;
            }
        }
    }

    /// Calculates the next cell position based on the current direction
    fn calculate_next_cell(&mut self) -> SnakeCell {
        let snake_idx = self.snake.head_idx();
        let (row, col) = (snake_idx / self.width, snake_idx % self.width);

        // Special handling for border cases to allow quick turns
        // Check if we're at an edge and should prioritize pending direction changes
        let is_at_edge = (col == 0 && self.snake.direction == Direction::Left)
            || (col == self.width - 1 && self.snake.direction == Direction::Right)
            || (row == 0 && self.snake.direction == Direction::Up)
            || (row == self.width - 1 && self.snake.direction == Direction::Down);

        if is_at_edge {
            // At the border, we want to immediately check for pending direction changes
            self.snake.handle_border_direction_change();
        }

        // Apply normal direction update (if no border change was applied)
        self.snake.update_direction();

        match self.snake.direction {
            Direction::Right => {
                let new_col = if col == self.width - 1 { 0 } else { col + 1 };
                SnakeCell(row * self.width + new_col)
            }
            Direction::Left => {
                let new_col = if col == 0 { self.width - 1 } else { col - 1 };
                SnakeCell(row * self.width + new_col)
            }
            Direction::Up => {
                let new_row = if row == 0 { self.width - 1 } else { row - 1 };
                SnakeCell(new_row * self.width + col)
            }
            Direction::Down => {
                let new_row = if row == self.width - 1 { 0 } else { row + 1 };
                SnakeCell(new_row * self.width + col)
            }
        }
    }
}
