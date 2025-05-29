# Snake Game Architecture

This document explains the architecture of the Snake Game application after refactoring to follow the Single Responsibility Principle.

## Overview

The application has been refactored from a monolithic `CanvasManager` class into several smaller, focused classes:

```
           GameManager
                |
    +-----------+------------+-------------+
    |           |            |             |
 GridRenderer SnakeRenderer FoodRenderer UIRenderer

        +-------------+
        |             |
   CanvasUtils    GameConfig
```

## Components

### GameManager

The main coordinator class that:
- Initializes the game and canvas
- Manages game state and lifecycle
- Handles user input
- Coordinates the rendering pipeline
- Implements the game loop

### Renderers

1. **GridRenderer**: Responsible for drawing the game grid and background
2. **SnakeRenderer**: Handles drawing the snake head, body, and tail
3. **FoodRenderer**: Renders the food (apple) on the grid
4. **UIRenderer**: Manages all UI components like score display, game over/win screens, and the start screen

### Utilities

1. **CanvasUtils**: Provides helper methods for canvas drawing operations
2. **GameConfig**: Contains game configuration settings

## Benefits of this Architecture

1. **Single Responsibility**: Each class has a single, well-defined responsibility
2. **Maintainability**: Easier to modify individual components without affecting others
3. **Testability**: Components can be tested in isolation
4. **Readability**: Code is organized by function, making it easier to understand
5. **Extensibility**: New features can be added by extending existing classes or adding new ones

## How it Works

The game initialization starts in `bootstrap.ts`, which loads the WebAssembly module and initializes the `GameManager`. The `GameManager` then creates and coordinates all the renderer components.

During the game loop, `GameManager` calls the appropriate renderer methods based on the current game state. Each renderer is responsible for drawing its specific part of the game.
