use wasm_bindgen::prelude::*;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    pub fn error(s: &str);
}

struct SnakeCell(usize);

#[wasm_bindgen]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

struct Snake {
    body: Vec<SnakeCell>,
    direction: Direction,
}
impl Snake {
    pub fn new(spawn_index: usize, size: usize) -> Self {
        let body: Vec<SnakeCell> = (0..size).map(|i| SnakeCell(spawn_index - i)).collect();
        Snake {
            body,
            direction: Direction::Right,
        }
    }
}

#[wasm_bindgen]
struct World {
    width: usize,
    size: usize,
    snake: Snake,
}

#[wasm_bindgen]
impl World {
    pub fn new(world_size: usize, snake_spawn_idx: usize) -> Self {
        World {
            width: world_size,
            size: world_size * world_size,
            snake: Snake::new(snake_spawn_idx, 3),
        }
    }

    pub fn get_snake_len(&self) -> usize {
        self.snake.body.len()
    }

    pub fn get_first_cell_ptr(&self) -> *const SnakeCell {
        self.snake.body.as_ptr()
    }

    pub fn step(&mut self) {
        self.snake.body[0] = self.gen_next_cell();
    }

    pub fn get_width(&self) -> usize {
        self.width
    }

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

    pub fn get_snake_head_idx(&self) -> usize {
        self.snake.body[0].0
    }

    fn gen_next_cell(&mut self) -> SnakeCell {
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
