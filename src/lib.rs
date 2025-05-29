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
            snake: Snake::new(snake_spawn_idx, 3),
            food_cell: None,
            points: 0,
            game_engine: GameEngine::new(),
        }
    }

    /// Gets the length of the snake
    pub fn get_snake_len(&self) -> usize {
        self.snake.body.len()
    }

    /// Gets a pointer to the first snake cell for JS interop
    pub fn get_first_cell_ptr(&self) -> *const SnakeCell {
        self.snake.body.as_ptr()
    }

    /// Advances the game state by one step
    pub fn step(&mut self) {
        if !self.game_engine.is_playing() {
            return; // Game not started or already finished
        }

        let body = self.snake.body.clone();
        let next_cell = self.calculate_next_cell();

        // Check for collision with own body
        if body.iter().skip(1).any(|cell| cell.0 == next_cell.0) {
            self.game_engine.set_state(GameState::GameOver);
            return;
        }

        self.snake.body[0] = next_cell;

        for i in 1..body.len() {
            self.snake.body[i] = SnakeCell(body[i - 1].0);
        }

        if let Some(food_idx) = self.food_cell {
            if self.get_snake_head_idx() == food_idx {
                self.snake.body.push(SnakeCell(body[1].0));
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
        // Prevent 180° turns (classic snake game rule)
        let invalid_move = match (&self.snake.direction, &new_direction) {
            (Direction::Up, Direction::Down) => true,
            (Direction::Down, Direction::Up) => true,
            (Direction::Left, Direction::Right) => true,
            (Direction::Right, Direction::Left) => true,
            _ => false,
        };

        if !invalid_move {
            self.snake.direction = new_direction;
        }
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
        self.snake.body[0].0
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
        match self.snake.direction {
            Direction::Up => 0,
            Direction::Right => 1,
            Direction::Down => 2,
            Direction::Left => 3,
        }
    }

    /// Places food at a random empty position
    fn place_food(&mut self) {
        if self.snake.body.len() >= self.size {
            self.food_cell = None; // No space for food
            self.game_engine.set_state(GameState::Won);
            return;
        }

        loop {
            let food_position = random::random_range(0, self.size);
            if !self.snake.body.iter().any(|cell| cell.0 == food_position) {
                self.food_cell = Some(food_position);
                return;
            }
        }
    }

    /// Calculates the next cell position based on the current direction
    fn calculate_next_cell(&self) -> SnakeCell {
        let snake_idx = self.get_snake_head_idx();
        let (row, col) = (snake_idx / self.width, snake_idx % self.width);

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
