use crate::{cells::SnakeCell, Direction};

/// Represents the snake with its body segments and movement direction
pub struct Snake {
    pub body: Vec<SnakeCell>,
    pub direction: Direction,
}

impl Snake {
    /// Creates a new snake with the given spawn position and initial size
    pub fn new(spawn_index: usize, size: usize) -> Self {
        let body: Vec<SnakeCell> = (0..size).map(|i| SnakeCell(spawn_index - i)).collect();
        Snake {
            body,
            direction: Direction::Right,
        }
    }
}
