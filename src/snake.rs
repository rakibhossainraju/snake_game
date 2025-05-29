use crate::{Direction, cells::SnakeCell};

/// Represents the snake with its body segments and movement direction
pub struct Snake {
    pub body: Vec<SnakeCell>,
    pub direction: Direction,
    pending_direction: Option<Direction>,
}

impl Snake {
    /// Creates a new snake with the given spawn position and initial size
    pub fn new(spawn_index: usize, size: usize) -> Self {
        let body: Vec<SnakeCell> = (0..size).map(|i| SnakeCell(spawn_index - i)).collect();
        Snake {
            body,
            direction: Direction::Right,
            pending_direction: None,
        }
    }

    /// Gets the index of the snake's head
    pub fn head_idx(&self) -> usize {
        self.body[0].0
    }

    /// Gets the length of the snake
    pub fn len(&self) -> usize {
        self.body.len()
    }

    /// Gets a pointer to the first snake cell for JS interop
    pub fn body_ptr(&self) -> *const SnakeCell {
        self.body.as_ptr()
    }

    /// Queue a direction change to be applied on the next movement step
    pub fn change_direction(&mut self, new_direction: Direction) {
        // Store the direction change request for processing during the next movement
        // This prevents multiple direction changes between movement frames
        self.pending_direction = Some(new_direction);
    }

    /// Process any pending direction change and apply it if valid
    pub fn update_direction(&mut self) {
        if let Some(new_direction) = self.pending_direction.take() {
            // Prevent 180° turns (classic snake game rule)
            let invalid_move = match (&self.direction, &new_direction) {
                (Direction::Up, Direction::Down) => true,
                (Direction::Down, Direction::Up) => true,
                (Direction::Left, Direction::Right) => true,
                (Direction::Right, Direction::Left) => true,
                _ => false,
            };

            if !invalid_move {
                self.direction = new_direction;
            }
        }
    }

    /// Move the snake in its current direction
    pub fn slither(&mut self, next_cell: SnakeCell) {
        // Process any pending direction change first
        self.update_direction();

        // Save the current body for updating
        let body = self.body.clone();

        // Update the head to the new position
        self.body[0] = next_cell;

        // Move each body segment to the position of the segment in front of it
        for i in 1..body.len() {
            self.body[i] = SnakeCell(body[i - 1].0);
        }
    }

    /// Add a new segment to the snake's body
    pub fn grow(&mut self) {
        // Use the second-to-last segment position as reference
        if self.body.len() >= 2 {
            self.body.push(SnakeCell(self.body[1].0));
        }
    }

    /// Check if the snake would collide with itself at the given position
    pub fn would_collide(&self, position: usize) -> bool {
        // Check if the position is already occupied by any part of the snake except the head
        self.body.iter().skip(1).any(|cell| cell.0 == position)
    }

    /// Get the direction as a number for JS interop
    pub fn direction_as_number(&self) -> u8 {
        match self.direction {
            Direction::Up => 0,
            Direction::Right => 1,
            Direction::Down => 2,
            Direction::Left => 3,
        }
    }

    /// Check if the snake occupies a specific position
    pub fn occupies(&self, position: usize) -> bool {
        self.body.iter().any(|cell| cell.0 == position)
    }
}
