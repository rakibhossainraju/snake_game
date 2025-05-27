# 🐍 Snake Game

A modern implementation of the classic Snake game using Rust, WebAssembly (WASM), and TypeScript.

## 🚀 Technologies Used

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
  <img src="https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=WebAssembly&logoColor=white" alt="WebAssembly" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
</div>

## 📋 Project Overview

This Snake Game is built with a hybrid architecture that leverages the strengths of both Rust and TypeScript:

- **Core Game Logic**: Written in Rust and compiled to WebAssembly for optimal performance
- **UI Rendering**: Handled by TypeScript/JavaScript in the browser
- **Communication**: WASM bindings enable seamless interaction between Rust and TypeScript

## 🏗️ Architecture & Flow

### Backend (Rust/WASM)

- **World**: Manages the game state, including the game board dimensions and snake position
- **Snake**: Represents the snake with its body segments and movement direction
- **Direction**: Enum representing possible movement directions (Up, Down, Left, Right)

### Frontend (TypeScript/HTML/CSS)

- **CanvasManager**: Singleton that handles rendering the game on HTML canvas and manages the game loop
- **Bootstrap**: Initializes the WASM module and loads the main application
- **Main**: Entry point that starts the game

## 🔄 Game Flow

1. The Rust code is compiled to WebAssembly and made available as a module
2. When the application loads, the `bootstrap.ts` initializes the WASM module
3. The `main.ts` file creates an instance of the `CanvasManager`
4. `CanvasManager` initializes the canvas and starts the game loop
5. During each frame of the game loop:
   - The canvas is cleared
   - The game grid is drawn
   - The snake is rendered
   - The snake head position is updated based on the current direction
6. Keyboard events are captured to change the snake's direction

## 🛠️ Development Setup

### Prerequisites

- Rust 1.86.0+
- Node.js with npm
- wasm-pack (for compiling Rust to WebAssembly)

### Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

This command uses `concurrently` to run both the Rust backend and Vite development server simultaneously.

### Building for Production

```bash
# Build the project
npm run build
```

## 🎮 Game Controls

Use the arrow keys to control the snake's direction:
- ⬆️ Arrow Up: Move up
- ⬇️ Arrow Down: Move down
- ⬅️ Arrow Left: Move left
- ➡️ Arrow Right: Move right

## 📦 Project Structure

```
├── src/              # Rust source code
│   └── lib.rs        # Core game logic in Rust
├── pkg/              # Compiled WebAssembly output
├── view/             # Frontend code
│   ├── index.html    # Main HTML file
│   └── src/          # TypeScript source
│       ├── bootstrap.ts       # WASM initialization
│       ├── main.ts            # Application entry point
│       ├── style.css          # Global styles
│       └── services/          # Application services
│           └── CanvasManager.ts  # Canvas rendering and game loop
├── Cargo.toml        # Rust dependencies and configuration
└── package.json      # Node.js dependencies and scripts
```

## 🔍 Technical Details

### Performance Optimization

- **wee_alloc**: A smaller memory allocator optimized for WebAssembly
- **Singleton Pattern**: Used in CanvasManager to ensure only one instance controls the game loop
- **RequestAnimationFrame**: For smooth browser animations

### Future Enhancements

- Add food generation and consumption
- Implement snake growth mechanics
- Add collision detection
- Create score tracking
- Add game over condition
- Implement difficulty levels
