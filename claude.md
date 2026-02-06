# Zombie Farm - Project Architecture & Guide

## Project Overview
"Zombie Farm" is a reverse *Plants vs. Zombies* strategy game built with **Phaser 3** and **Vite**. The player commands a horde of zombies to overwhelm plant defenses and destroy the house.

## Architecture

### 1. Scene Management
The game is split into distinct Phaser Scenes:
- **BootScene**: Handles asset generation (procedural textures) and animation registration.
- **MenuScene**: Simple title screen.
- **GameScene**: The core gameplay loop. Manages the grid, input, and high-level game state.
- **UIScene**: HUD overlay (brains, score, wave info) running in parallel with GameScene.

### 2. Entity Component System (Lite)
Entities inherit from `Phaser.GameObjects.Sprite`:
- **Zombie**: The player's units. Handles movement, attacking, and simple AI.
- **Plant**: The enemy units. Stationary, auto-attacking turrets.
- **Projectile**: Projectiles fired by both sides.

### 3. Manager Pattern
To keep `GameScene` clean, complex logic is delegated to Managers:
- **WaveManager**: Controls enemy (plant) spawning logic and difficulty scaling.
- **ProjectileManager**: Handles object pooling for projectiles to optimize performance.
- **CollisionManager**: Centralizes all physics overlap/collision logic.

### 4. Configuration
Configuration is split into granular files in `src/config/` but aggregated via `constants.js` for easy imports:
- **settings.js**: Grid dimensions, game rules, colors.
- **entities.js**: Stats for all zombie and plant types.
- **events.js**: String constants for the event bus.

## Key Design Decisions

### Procedural Assets
Instead of loading external image files, the game generates all textures at runtime using `Phaser.Graphics`.
- **Pros**: Zero asset dependencies, instant load times, easy to tweak colors/shapes via code.
- **Cons**: Limited artistic detail compared to sprites.

### Event-Driven UI
The UI is decoupled from the game logic. `GameScene` emits events (e.g., `EVENTS.BRAINS_CHANGED`), and `UIScene` listens to update the display. This separation of concerns prevents tight coupling.

### Object Pooling
Projectiles are pooled using Phaser Groups. This prevents garbage collection spikes during intense waves by reusing disabled projectile instances instead of destroying/recreating them.

## Development Rules

1.  **Event Constants**: Never use string literals for events. Always add new events to `src/config/events.js`.
2.  **Asset Generation**: If adding new entities, generate their textures in `BootScene.js` rather than adding external files, unless a full art pass is decided.
3.  **Managers**: If a feature logic grows beyond ~100 lines in `GameScene`, extract it to a dedicated Manager.
4.  **Update this File**: When adding new major systems (e.g., a Level Manager, Save System), update the Architecture section of this document.

