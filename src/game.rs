use wasm_bindgen::prelude::*;

/// Represents the current state of the game
#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq)]
pub enum GameState {
    Playing,
    Won,
    GameOver,
    Ready,
}

/// Manages the game state and rules
pub struct GameEngine {
    state: Option<GameState>,
}

impl GameEngine {
    /// Creates a new game engine in the Ready state
    pub fn new() -> Self {
        GameEngine {
            state: Some(GameState::Ready),
        }
    }

    /// Checks if the game is currently in the Playing state
    pub fn is_playing(&self) -> bool {
        matches!(self.state, Some(GameState::Playing))
    }

    /// Checks if the game is currently in the Ready state
    pub fn is_ready(&self) -> bool {
        matches!(self.state, Some(GameState::Ready))
    }

    /// Gets the current game state
    pub fn get_state(&self) -> Option<GameState> {
        self.state
    }

    /// Sets the game state
    pub fn set_state(&mut self, state: GameState) {
        self.state = Some(state);
    }

    /// Converts the game state to a number for JS interop
    pub fn get_state_as_number(&self) -> u8 {
        match self.state {
            Some(GameState::Playing) => 0,
            Some(GameState::Won) => 1,
            Some(GameState::GameOver) => 2,
            Some(GameState::Ready) => 3,
            None => 3, // Default to ready if not set
        }
    }
}
