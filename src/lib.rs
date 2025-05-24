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

#[wasm_bindgen]
struct World {
    width: usize,
}

#[wasm_bindgen]
impl World {
    pub fn new() -> World {
        World { width: 8 }
    }

    pub fn get_width(&self) -> usize {
        self.width
    }
}
