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
    snake: Snake,
}

#[wasm_bindgen]
impl World {
    pub fn new() -> Self {
        World {
            width: 8,
            snake: Snake::new(10),
        }
    }

    pub fn get_width(&self) -> usize {
        self.width
    }

    pub fn get_snake_head(&self) -> usize {
        self.snake.body[0].0
    }
}
