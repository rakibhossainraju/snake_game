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

struct Snake {
    body: Vec<SnakeCell>,
}
impl Snake {
    pub fn new(spawn_index: usize) -> Self {
        Snake {
            body: vec![SnakeCell(spawn_index)],
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
        self.snake.body[0].0 = (snake_idx + 1) % self.size;
    }

    pub fn get_width(&self) -> usize {
        self.width
    }

    pub fn get_snake_head_idx(&self) -> usize {
        self.snake.body[0].0
    }
}
