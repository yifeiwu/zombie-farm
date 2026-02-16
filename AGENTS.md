# Zombie Farm - Project Architecture & Guide

## Project Overview
"Zombie Farm" is a reverse *Plants vs. Zombies* strategy game built with **Phaser 3** and **Vite**. The player commands a horde of zombies to overwhelm plant defenses and destroy the house.

## Architecture

### 1. Scene Management
The game is split into distinct Phaser Scenes:
- **BootScene**: Handles asset loading (tile atlases + procedural textures) and animation registration.
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

## Tile-Based Sprite Processing

### Asset Requirements
Place new zombie sprites in `assets/` with:
- **`<name>.png`** — Spritesheet (white background; will be color-keyed to transparent)
- **`<name>.txt`** — Frame data: one line per frame, format `frameName,x,y,w,h`

Example `normal.txt`:
```
normal_walk1,0,0,350,400
normal_walk2,350,0,350,400
normal_walk3,700,0,350,400
normal_walk4,1050,0,350,400
normal_attack1,0,400,350,400
...
```

### Adding a New Tile-Based Zombie

1. **Create `assets/<name>.json`** — Phaser JSON Hash format. Each frame:
   ```json
   "frameName": {
     "frame": { "x": 0, "y": 0, "w": 350, "h": 400 },
     "rotated": false, "trimmed": false,
     "spriteSourceSize": { "x": 0, "y": 0, "w": 350, "h": 400 },
     "sourceSize": { "w": 350, "h": 400 }
   }
   ```
   Use `meta.size` for total spritesheet dimensions (e.g. `{ "w": 1400, "h": 800 }`).

2. **BootScene preload** — Add:
   ```js
   this.load.image('zombie_<key>_src', 'assets/<name>.png');
   this.load.json('zombie_<key>_data', 'assets/<name>.json');
   ```

3. **BootScene create** — Add:
   ```js
   this.createColorKeyAtlas('zombie_<key>_src', 'zombie_<key>_data', 'zombie_<key>');
   ```

4. **BootScene generateTextures** — Add `'<entityKey>'` to `atlasZombieKeys` array.

5. **BootScene zombieAnims** — Add entry:
   ```js
   { atlas: 'zombie_<key>', prefix: '<framePrefix>', walkRate: 8, attackRate: 12 },
   ```
   Frame names must follow `<prefix>_walk1`..`<prefix>_walk4` and `<prefix>_attack1`..`<prefix>_attack4`.

6. **entities.js** — Add to the zombie type:
   ```js
   atlasTexture: 'zombie_<key>',
   atlasFrame: '<prefix>_walk1',
   ```

### Color-Key Processing
- White/near-white pixels (R,G,B ≥ 240) are made transparent at load time.
- Threshold is in `createColorKeyAtlas()`; adjust if needed (e.g. 250 for stricter white).

### Frame Naming Convention
- Walk: `<prefix>_walk1` … `<prefix>_walk4`
- Attack: `<prefix>_attack1` … `<prefix>_attack4`

## Key Design Decisions

### Hybrid Assets
The game uses both:
- **Tile atlases**: Zombie sprites from PNG spritesheets, color-keyed and loaded as atlases.
- **Procedural textures**: Plants, projectiles, UI icons, and fallback entities via `SpriteFactory` + `Phaser.Graphics`.

### Event-Driven UI
The UI is decoupled from the game logic. `GameScene` emits events (e.g., `EVENTS.BRAINS_CHANGED`), and `UIScene` listens to update the display. This separation of concerns prevents tight coupling.

### Object Pooling
Projectiles are pooled using Phaser Groups. This prevents garbage collection spikes during intense waves by reusing disabled projectile instances instead of destroying/recreating them.

## Development Rules

1. **Event Constants**: Never use string literals for events. Always add new events to `src/config/events.js`.
2. **Asset Generation**: If adding new entities, generate their textures in `BootScene.js` rather than adding external files, unless a full art pass is decided.
3. **Managers**: If a feature logic grows beyond ~100 lines in `GameScene`, extract it to a dedicated Manager.
4. **Update this File**: When adding new major systems (e.g., a Level Manager, Save System), update the Architecture section of this document.
