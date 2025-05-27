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
    pub fn new(spawn_index: usize) -> Self {
        Snake {
            body: vec![SnakeCell(spawn_index)],
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
            snake: Snake::new(snake_spawn_idx),
        }
    }

    pub fn update_snake_head(&mut self) {
        let snake_idx = self.get_snake_head_idx();
        let (row, col) = (snake_idx / self.width, snake_idx % self.width);

        let (row, col) = match self.snake.direction {
            Direction::Right => (row, (col + 1) % self.width),
            Direction::Left => (row, if col == 0 { self.width - 1 } else { col - 1 }),
            Direction::Up => (if row == 0 { self.width - 1 } else { row - 1 }, col),
            Direction::Down => ((row + 1) % self.width, col),
        };

        self.snake.body[0].0 = (row * self.width) + col;
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
}
