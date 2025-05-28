use wasm_bindgen::prelude::*;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Math)]
    pub fn random() -> f64;
}

#[derive(Clone)]
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
    food_cell: Option<usize>,
    point: usize,
}

#[wasm_bindgen]
impl World {
    pub fn new(world_size: usize, snake_spawn_idx: usize) -> Self {
        World {
            width: world_size,
            size: world_size * world_size,
            snake: Snake::new(snake_spawn_idx, 3),
            food_cell: None,
            point: 0,
        }
    }

    pub fn get_snake_len(&self) -> usize {
        self.snake.body.len()
    }

    pub fn get_first_cell_ptr(&self) -> *const SnakeCell {
        self.snake.body.as_ptr()
    }

    pub fn step(&mut self) {
        let body = self.snake.body.clone();
        let next_cell = self.gen_next_cell();
        self.snake.body[0] = next_cell;

        for i in 1..body.len() {
            self.snake.body[i] = SnakeCell(body[i - 1].0);
        }
        if let Some(food_idx) = self.food_cell {
            if self.get_snake_head_idx() == food_idx {
                self.snake.body.push(SnakeCell(body[1].0));
                self.set_food_idx();
                self.point += 1;
            }
        } else {
            self.set_food_idx();
        }
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

    pub fn get_food_idx(&self) -> Option<usize> {
        self.food_cell
    }

    pub fn set_food_idx(&mut self) {
        let mut food_cell: usize = self.get_random_int();
        loop {
            if !self.snake.body.iter().any(|cell| cell.0 == food_cell) {
                self.food_cell = Some(food_cell);
                return;
            }
            food_cell = self.get_random_int();
        }
    }

    pub fn get_point(&self) -> usize {
        self.point
    }

    fn get_random_int(&self) -> usize {
        (random() * self.size as f64) as usize
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
