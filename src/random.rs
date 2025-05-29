use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64;
}

/// Generate a random integer in the range [min, max)
pub fn random_range(min: usize, max: usize) -> usize {
    min + (random() * (max - min) as f64) as usize
}
